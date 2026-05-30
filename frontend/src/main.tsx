import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import HowItWorks from "./pages/user/HowItWorks";
import Body from "./pages/user/Body";
import CategoriesPage from "./pages/user/Categories";
import CategoryPage from "./pages/user/CategoryPage";

import { UserLayout } from "./layouts/UserLayout";
import { OwnerLayout } from "./layouts/OwnerLayout";

import Dashboard from "./pages/owner/Dashboard";
import Bookings from "./pages/owner/Bookings";
import OwnerListings from "./pages/owner/OwnerListing";
import {Earnings} from "./pages/owner/Earnings";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import NoFoundPage from "./pages/NoFoundPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Messages } from "./pages/owner/Messages";
import { Reviews } from "./pages/owner/Reviews";
import { Settings } from "./pages/owner/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorks />,
      },

      {
        path: "/categories/:categoryId",
        element: <CategoryPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      }

    ],
  },


  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
 
  {
    path: "/owner",
    element:
      <>
        <ProtectedRoute>
          <OwnerLayout />
        </ProtectedRoute>
      </>,
    children: [
      {
        path: "/owner/dashboard",
        element: <Dashboard />,
      },

      {
        path: "/owner/bookings",
        element: <Bookings />,
      },
      {
        path: "/owner/listings",
        element: <OwnerListings />,
      },
      {
        path: "/owner/reviews",
        element: <Reviews />,
      },
      {
        path: "/owner/messages",
        element: <Messages />,
      },
      {
        path: "/owner/settings",
        element: <Settings />,
      },
      {
        path: "/owner/earnings",
        element: <Earnings />,
      }
    ],
  },
  {
    path: "*",
    element: <NoFoundPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);