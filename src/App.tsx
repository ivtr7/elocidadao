import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Layout from './components/Layout'
import BlogLayout from './components/BlogLayout'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Cities from './pages/Cities'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Rankings from './pages/Rankings'
import About from './pages/About'
import Citizens from './pages/Citizens'
import Complaints from './pages/Complaints'
import Moderation from './pages/Moderation'
import Settings from './pages/Settings'
import WhatsAppAgent from './pages/WhatsAppAgent'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BlogLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'project/:id',
        element: <ProjectDetail />
      },
      {
        path: 'rankings',
        element: <Rankings />
      },
      {
        path: 'about',
        element: <About />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
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
      },
      {
        path: 'whatsapp',
        element: <WhatsAppAgent />
      }
    ]
  }
])

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  )
}

export default App
