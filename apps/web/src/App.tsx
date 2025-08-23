import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CalendarPage } from '@/pages/CalendarPage'
import { AssetDrawer } from '@/pages/AssetDrawer'
import { ContractCockpit } from '@/pages/ContractCockpit'
import { ComplianceBoard } from '@/pages/ComplianceBoard'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/assets" element={<AssetDrawer />} />
        <Route path="/contracts" element={<ContractCockpit />} />
        <Route path="/compliance" element={<ComplianceBoard />} />
      </Routes>
    </Layout>
  )
}

export default App