import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Cities from './pages/Cities'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Rankings from './pages/Rankings'
import Citizens from './pages/Citizens'
import Complaints from './pages/Complaints'
import Moderation from './pages/Moderation'
import Settings from './pages/Settings'
import { ApiTest } from '@/components/ApiTest'

const router = createBrowserRouter([
  {
    path: '/landing',
    element: <Landing />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'project/:id',
        element: <ProjectDetail />
      },
      {
        path: 'cities',
        element: <Cities />
      },
      {
        path: 'projects',
        element: <Projects />
      },
      {
        path: 'rankings',
        element: <Rankings />
      },
      {
        path: 'citizens',
        element: <Citizens />
      },
      {
        path: 'complaints',
        element: <Complaints />
      },
      {
        path: 'moderation',
        element: <Moderation />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
])

function App() {
  return (
    <>
      <ApiTest />
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
