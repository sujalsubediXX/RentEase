import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import HowItWorks from './pages/user/HowItWorks.tsx'
import { UserLayout } from './layouts/UserLayout.tsx'
import Body from './pages/user/Body.tsx'
import { OwnerLayout } from './layouts/OwnerLayout.tsx'
import Dashboard from './pages/owner/Dashboard.tsx'
import OwnerListing from './pages/owner/OwnerListing.tsx'
import Bookings from './pages/owner/Bookings.tsx'

const router = createBrowserRouter([
  { 
    path: '/',
    element: <UserLayout />,
    children:[
      {
        path: '/',
        element:<Body />
      },
      {
        path: '/how-it-works',
        element:<HowItWorks />
      }
    ]
   },
  { 
    path: '/owner',
    element: <OwnerLayout />,
    children:[
      {
        path: '/owner/dashboard',
        element:<Dashboard />
      },
      {
        path: '/owner/listings',
        element:<OwnerListing />
      },
      {
        path: '/owner/bookings',
        element:<Bookings />
      },
      
    ]
   },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />

  </StrictMode>,
)
