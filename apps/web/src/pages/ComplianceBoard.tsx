import React from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock, Filter, Plus, TrendingDown } from 'lucide-react'

export function ComplianceBoard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary-600" />
            Compliance Board
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter Controls
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            New Control
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">142</p>
              <p className="text-gray-500">Compliant</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-gray-500">Non-Compliant</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">94.8%</p>
              <p className="text-gray-500">Overall Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {complianceFrameworks.map((framework) => (
              <button
                key={framework.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  framework.id === 'iso27001'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {framework.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Controls List */}
        <div className="divide-y divide-gray-200">
          {mockControls.map((control) => (
            <div key={control.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{control.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      control.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      control.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                      control.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {control.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      control.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      control.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      control.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {control.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{control.description}</p>
                  <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                    <span>Framework: {control.framework}</span>
                    <span>Category: {control.category}</span>
                    <span>Assets: {control.assetCount}</span>
                    <span>Last Assessment: {control.lastAssessment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Next Assessment</p>
                  <p className="text-sm font-medium text-gray-900">{control.nextAssessment}</p>
                  {control.daysOverdue > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {control.daysOverdue} days overdue
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder message */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex">
          <Shield className="h-6 w-6 text-purple-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-purple-900">Compliance Management System</h3>
            <p className="text-purple-700 mt-2">
              The Compliance Board will provide comprehensive compliance management including:
            </p>
            <ul className="list-disc list-inside text-purple-700 mt-2 space-y-1">
              <li>Multi-framework compliance tracking (ISO 27001, NIST, CIS, PCI DSS, SOX)</li>
              <li>Evidence collection and document management</li>
              <li>Automated compliance assessments and scoring</li>
              <li>Risk-based compliance prioritization</li>
              <li>CVE impact analysis and vulnerability management</li>
              <li>Audit trail and reporting capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const complianceFrameworks = [
  { id: 'iso27001', name: 'ISO 27001' },
  { id: 'nist', name: 'NIST' },
  { id: 'cis', name: 'CIS Controls' },
  { id: 'pci_dss', name: 'PCI DSS' },
  { id: 'sox', name: 'SOX' },
]

const mockControls = [
  {
    id: '1',
    name: 'Access Control Management',
    description: 'Ensure proper access controls are implemented and maintained across all systems',
    framework: 'ISO 27001',
    category: 'Access Control',
    status: 'compliant',
    severity: 'high',
    assetCount: 45,
    lastAssessment: '2024-01-15',
    nextAssessment: '2024-04-15',
    daysOverdue: 0
  },
  {
    id: '2',
    name: 'Incident Response Procedures',
    description: 'Establish and maintain incident response procedures and capabilities',
    framework: 'NIST',
    category: 'Incident Response',
    status: 'pending',
    severity: 'critical',
    assetCount: 12,
    lastAssessment: '2023-11-20',
    nextAssessment: '2024-02-20',
    daysOverdue: 5
  },
  {
    id: '3',
    name: 'Data Encryption Standards',
    description: 'Implement appropriate encryption for data at rest and in transit',
    framework: 'PCI DSS',
    category: 'Cryptography',
    status: 'non_compliant',
    severity: 'high',
    assetCount: 28,
    lastAssessment: '2024-01-10',
    nextAssessment: '2024-04-10',
    daysOverdue: 0
  },
  {
    id: '4',
    name: 'Vulnerability Management',
    description: 'Regular vulnerability scanning and patch management processes',
    framework: 'CIS',
    category: 'Vulnerability Management',
    status: 'compliant',
    severity: 'medium',
    assetCount: 67,
    lastAssessment: '2024-01-12',
    nextAssessment: '2024-04-12',
    daysOverdue: 0
  },
  {
    id: '5',
    name: 'Backup and Recovery Testing',
    description: 'Regular testing of backup and disaster recovery procedures',
    framework: 'ISO 27001',
    category: 'Business Continuity',
    status: 'pending',
    severity: 'medium',
    assetCount: 34,
    lastAssessment: '2023-12-01',
    nextAssessment: '2024-03-01',
    daysOverdue: 0
  }
]