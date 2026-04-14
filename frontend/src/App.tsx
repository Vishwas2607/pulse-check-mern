import './App.css'
import MonitorAnalytics from './pages/MonitorAnalytics'
import MonitorDetails from './pages/MonitorDetailsPage'
import Monitors from './pages/MonitorsPage'
import { Routes, Route } from 'react-router'
function App() {

  return (
    <>
    <main className='flex-center gap-main bg-main min-h-svh'>
    <Routes>
      <Route path='/' element={<Monitors/>}/>
      <Route path="/monitors/:id" element={<MonitorDetails/>}/>
      <Route path="/monitors/:id/analytics" element={<MonitorAnalytics/>}/>
    </Routes>
    </main>
    </>
  )
}

export default App
