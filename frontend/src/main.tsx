import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import HowItWorks from './pages/user/HowItWorks.tsx'
import { UserLayout } from './layouts/UserLayout.tsx'
import Body from './pages/user/Body.tsx'

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
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />

  </StrictMode>,
)
