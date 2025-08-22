import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface CachedResponse {
  statusCode: number;
  data: any;
  timestamp: number;
}

@Injectable()
export class IdempotencyMiddleware implements CanActivate {
  // In production, use Redis or a proper cache
  private static cache = new Map<string, CachedResponse>();
  private static readonly TTL = 300000; // 5 minutes

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Only apply to POST requests
    if (request.method !== 'POST') {
      return true;
    }

    const idempotencyKey = request.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      // Idempotency key is optional, proceed without caching
      return true;
    }

    const cacheKey = `${request.url}:${idempotencyKey}`;
    const cached = IdempotencyMiddleware.cache.get(cacheKey);

    if (cached) {
      const now = Date.now();
      
      // Check if cache entry is still valid
      if (now - cached.timestamp < IdempotencyMiddleware.TTL) {
        // Return cached response
        response.status(cached.statusCode).json(cached.data);
        return false; // Block execution
      } else {
        // Remove expired entry
        IdempotencyMiddleware.cache.delete(cacheKey);
      }
    }

    // Store the original methods to intercept response
    // const _originalEnd = response.end;
    const originalJson = response.json;

    // let _responseData: any;
    let statusCode: number = 200;

    // Intercept json method
    response.json = function(data: any) {
      // _responseData = data;
      statusCode = response.statusCode;
      
      // Cache the response for successful requests
      if (statusCode >= 200 && statusCode < 300) {
        IdempotencyMiddleware.cache.set(cacheKey, {
          statusCode,
          data,
          timestamp: Date.now(),
        });
      }

      return originalJson.call(this, data);
    };

    // Clean up expired entries periodically
    this.cleanupExpiredEntries();

    return true;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const entries = Array.from(IdempotencyMiddleware.cache.entries());
    
    for (const [key, value] of entries) {
      if (now - value.timestamp >= IdempotencyMiddleware.TTL) {
        IdempotencyMiddleware.cache.delete(key);
      }
    }
  }

  // Method to clear cache (useful for testing)
  static clearCache(): void {
    IdempotencyMiddleware.cache.clear();
  }
}