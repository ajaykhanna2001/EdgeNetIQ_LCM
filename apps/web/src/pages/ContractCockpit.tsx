import React from 'react'
import { FileText, Search, Filter, Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react'

export function ContractCockpit() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary-600" />
            Contract Cockpit
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter Contracts
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-gray-500">Active Contracts</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">$2.4M</p>
              <p className="text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-gray-500">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-gray-500">License Utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts by vendor, type, or reference..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Contracts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                      <div className="text-sm text-gray-500">{contract.reference}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${contract.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.status === 'active' ? 'bg-green-100 text-green-800' :
                      contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex">
          <FileText className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-green-900">Contract & License Management</h3>
            <p className="text-green-700 mt-2">
              The Contract Cockpit will provide comprehensive contract and license management including:
            </p>
            <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
              <li>Contract lifecycle management and renewal tracking</li>
              <li>License utilization monitoring and optimization</li>
              <li>Vendor performance analytics and reporting</li>
              <li>Automated renewal notifications and workflows</li>
              <li>Cost optimization and budget forecasting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const mockContracts = [
  {
    id: '1',
    name: 'Enterprise Navigation Software',
    reference: 'CTR-2024-001',
    vendor: 'Maritime Tech Solutions',
    type: 'Software',
    value: 150000,
    status: 'active',
    endDate: '2024-12-31'
  },
  {
    id: '2',
    name: 'Fuel Management System License',
    reference: 'CTR-2024-002',
    vendor: 'FuelTech Corp',
    type: 'Software',
    value: 75000,
    status: 'active',
    endDate: '2025-03-15'
  },
  {
    id: '3',
    name: 'Communication Equipment Support',
    reference: 'CTR-2023-089',
    vendor: 'CommSys International',
    type: 'Support',
    value: 200000,
    status: 'pending',
    endDate: '2024-06-30'
  },
  {
    id: '4',
    name: 'Safety System Maintenance',
    reference: 'CTR-2023-067',
    vendor: 'SafeMarine Ltd',
    type: 'Service',
    value: 120000,
    status: 'active',
    endDate: '2024-09-15'
  },
  {
    id: '5',
    name: 'Legacy System Migration',
    reference: 'CTR-2023-012',
    vendor: 'Digital Marine Solutions',
    type: 'Service',
    value: 300000,
    status: 'expired',
    endDate: '2024-01-31'
  }
]