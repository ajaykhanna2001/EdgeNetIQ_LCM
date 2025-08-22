import { Package, Search, Filter, Plus } from 'lucide-react'

export function AssetDrawer() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-primary-600" />
            Asset Drawer
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter Assets
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by name, type, serial number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssets.map(asset => (
          <div key={asset.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{asset.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  asset.status === 'active' ? 'bg-green-100 text-green-800' :
                  asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {asset.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Type:</span> {asset.type}</p>
                <p><span className="font-medium">Ship:</span> {asset.ship}</p>
                <p><span className="font-medium">Location:</span> {asset.location}</p>
                <p><span className="font-medium">Criticality:</span> 
                  <span className={`ml-1 ${
                    asset.criticality === 'critical' ? 'text-red-600 font-medium' :
                    asset.criticality === 'high' ? 'text-orange-600' :
                    asset.criticality === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {asset.criticality}
                  </span>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last Updated</span>
                  <span>{asset.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <Package className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Asset Management Coming Soon</h3>
            <p className="text-blue-700 mt-2">
              The Asset Drawer will provide comprehensive asset lifecycle management including:
            </p>
            <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
              <li>Real-time asset tracking and status monitoring</li>
              <li>Maintenance history and scheduling</li>
              <li>End-of-support-life (EOSL) tracking</li>
              <li>Asset relationships and dependencies</li>
              <li>Integration with ship systems via edge agents</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const mockAssets = [
  {
    id: '1',
    name: 'Main Engine Control Unit',
    type: 'Control System',
    ship: 'MV Atlantic Star',
    location: 'Engine Room',
    status: 'active',
    criticality: 'critical',
    lastUpdated: '2 hours ago'
  },
  {
    id: '2',
    name: 'Navigation Radar System',
    type: 'Navigation',
    ship: 'MV Pacific Explorer',
    location: 'Bridge',
    status: 'maintenance',
    criticality: 'high',
    lastUpdated: '1 day ago'
  },
  {
    id: '3',
    name: 'Fuel Management System',
    type: 'Fuel System',
    ship: 'MV Baltic Pioneer',
    location: 'Engine Room',
    status: 'active',
    criticality: 'medium',
    lastUpdated: '30 minutes ago'
  },
  {
    id: '4',
    name: 'Communication Array',
    type: 'Communication',
    ship: 'MV Atlantic Star',
    location: 'Bridge',
    status: 'active',
    criticality: 'high',
    lastUpdated: '5 hours ago'
  },
  {
    id: '5',
    name: 'Backup Generator',
    type: 'Power System',
    ship: 'MV Pacific Explorer',
    location: 'Engine Room',
    status: 'decommissioned',
    criticality: 'low',
    lastUpdated: '1 week ago'
  },
  {
    id: '6',
    name: 'Fire Suppression Controller',
    type: 'Safety System',
    ship: 'MV Baltic Pioneer',
    location: 'Multiple',
    status: 'active',
    criticality: 'critical',
    lastUpdated: '3 hours ago'
  }
]