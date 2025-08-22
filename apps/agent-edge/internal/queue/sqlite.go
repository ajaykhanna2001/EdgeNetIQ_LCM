package queue

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Message struct {
	ID          int64     `json:"id"`
	ConnectorName string `json:"connector_name"`
	Timestamp   time.Time `json:"timestamp"`
	Payload     []byte    `json:"payload"`
	RetryCount  int       `json:"retry_count"`
	NextRetry   *time.Time `json:"next_retry,omitempty"`
}

type SQLiteQueue struct {
	db *sql.DB
}

func NewSQLiteQueue(dbPath string) (*SQLiteQueue, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	queue := &SQLiteQueue{db: db}
	if err := queue.createTables(); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return queue, nil
}

func (q *SQLiteQueue) createTables() error {
	query := `
	CREATE TABLE IF NOT EXISTS queue (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		connector_name TEXT NOT NULL,
		timestamp DATETIME NOT NULL,
		payload BLOB NOT NULL,
		retry_count INTEGER DEFAULT 0,
		next_retry DATETIME
	);
	
	CREATE INDEX IF NOT EXISTS idx_next_retry ON queue(next_retry);
	CREATE INDEX IF NOT EXISTS idx_connector_name ON queue(connector_name);
	`

	_, err := q.db.Exec(query)
	return err
}

func (q *SQLiteQueue) Enqueue(connectorName string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	query := `
	INSERT INTO queue (connector_name, timestamp, payload)
	VALUES (?, ?, ?)
	`

	_, err = q.db.Exec(query, connectorName, time.Now(), payload)
	if err != nil {
		return fmt.Errorf("failed to insert message: %w", err)
	}

	return nil
}

func (q *SQLiteQueue) GetBatch(limit int) ([]*Message, error) {
	query := `
	SELECT id, connector_name, timestamp, payload, retry_count, next_retry
	FROM queue
	WHERE next_retry IS NULL OR next_retry <= ?
	ORDER BY timestamp ASC
	LIMIT ?
	`

	rows, err := q.db.Query(query, time.Now(), limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query messages: %w", err)
	}
	defer rows.Close()

	var messages []*Message
	for rows.Next() {
		var msg Message
		var nextRetry sql.NullTime

		err := rows.Scan(
			&msg.ID,
			&msg.ConnectorName,
			&msg.Timestamp,
			&msg.Payload,
			&msg.RetryCount,
			&nextRetry,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}

		if nextRetry.Valid {
			msg.NextRetry = &nextRetry.Time
		}

		messages = append(messages, &msg)
	}

	return messages, nil
}

func (q *SQLiteQueue) DeleteMessages(messages []*Message) error {
	if len(messages) == 0 {
		return nil
	}

	tx, err := q.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `DELETE FROM queue WHERE id = ?`
	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, msg := range messages {
		if _, err := stmt.Exec(msg.ID); err != nil {
			return fmt.Errorf("failed to delete message %d: %w", msg.ID, err)
		}
	}

	return tx.Commit()
}

func (q *SQLiteQueue) RetryMessages(messages []*Message) error {
	if len(messages) == 0 {
		return nil
	}

	tx, err := q.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `UPDATE queue SET retry_count = ?, next_retry = ? WHERE id = ?`
	stmt, err := tx.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, msg := range messages {
		retryCount := msg.RetryCount + 1
		// Exponential backoff: 2^retry_count minutes, max 60 minutes
		backoffMinutes := 1 << uint(retryCount-1)
		if backoffMinutes > 60 {
			backoffMinutes = 60
		}
		nextRetry := time.Now().Add(time.Duration(backoffMinutes) * time.Minute)

		if _, err := stmt.Exec(retryCount, nextRetry, msg.ID); err != nil {
			return fmt.Errorf("failed to update retry for message %d: %w", msg.ID, err)
		}
	}

	return tx.Commit()
}

func (q *SQLiteQueue) GetStats() (map[string]int, error) {
	stats := make(map[string]int)

	// Total messages
	var total int
	err := q.db.QueryRow("SELECT COUNT(*) FROM queue").Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %w", err)
	}
	stats["total"] = total

	// Ready messages (not waiting for retry)
	var ready int
	query := "SELECT COUNT(*) FROM queue WHERE next_retry IS NULL OR next_retry <= ?"
	err = q.db.QueryRow(query, time.Now()).Scan(&ready)
	if err != nil {
		return nil, fmt.Errorf("failed to get ready count: %w", err)
	}
	stats["ready"] = ready

	// Waiting for retry
	stats["waiting"] = total - ready

	return stats, nil
}

func (q *SQLiteQueue) Close() error {
	return q.db.Close()
}