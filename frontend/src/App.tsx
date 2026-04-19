import { Dot } from 'lucide-react'
import './App.css'
import Home from './pages/HomePage'
import Incidents from './pages/IncidentPage'
import MonitorAnalytics from './pages/MonitorAnalytics'
import MonitorDetails from './pages/MonitorDetailsPage'
import Monitors from './pages/MonitorsPage'
import { Routes, Route } from 'react-router'
import Register from './pages/RegisterPage'
import Login from './pages/LoginPage'
import ProtectedRoute from './routes/protectedRoute'
import CreateMonitor from './pages/CreateMonitorPage'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import {AnimatePresence,motion} from "framer-motion"
import {Squash as Hamburger} from "hamburger-react"

function App() {

  const [isOpen, setOpen] = useState<boolean>(false)

  return (
    <>
    <div className='min-h-svh flex flex-col bg-main'>

    <header className="header flex justify-between items-center h-12 mb-6">

      <div className='lg:hidden'>
        <Hamburger toggled={isOpen} toggle={()=>setOpen(!isOpen)} color={"white"} size={24}/>
      </div>

      <h2 className='text-title text-indigo-500'>PulseCheck</h2>

      <div className='hidden lg:flex'><Navbar /></div>
      <AnimatePresence>
          {isOpen && <motion.div 
          key={"sidebar-wrapper"}
          initial={{x: "-100%"}}
          animate= {{x:0}}
          exit={{x:"-100%"}}
          transition={{duration:0.4, ease:"easeOut"}}
          aria-hidden={!isOpen}
          className='fixed bottom-0 left-0 h-[calc(100vh-48px)] z-10 lg:hidden'
          >
          <Sidebar/>
          </motion.div>
          }
        </AnimatePresence>
    </header>

    <main className='flex-1'>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>}/>
      
      <Route element={<ProtectedRoute/>}>
        <Route path='/monitors' element={<Monitors/>}/>
        <Route path="/monitors/add-monitor" element={<CreateMonitor/>}/>
        <Route path="/monitors/:id" element={<MonitorDetails/>}/>
        <Route path="/monitors/:id/edit-monitor" element={<CreateMonitor/>}/>
        <Route path="/monitors/:id/analytics" element={<MonitorAnalytics/>}/>
        <Route path="/monitors/:id/incidents" element={<Incidents/>} />
      </Route>

    </Routes>
    </main>

    <footer className="flex-between bg-gray-950 border-t mt-5 mb-2 border-gray-700 w-full px-2 py-1">
      <div className='text-body flex flex-col flex-center w-full md:gap-6 md:flex-row flex-wrap'>
        <p className=''>Keeping your pulse on the web</p>
        <p className='flex'><Dot color='green'/> <span>System Status: All system operational</span></p>
        <p>@{new Date().getFullYear()} PulseCheck. Built for reliability</p>
      </div>
    </footer >
    </div>
    </>
  )
}

export default App
