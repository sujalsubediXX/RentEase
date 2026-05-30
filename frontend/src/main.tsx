import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import HowItWorks from "./pages/user/HowItWorks";
import Body from "./pages/user/Body";

import CategoriesPage from "./pages/user/Categories";

import CategoryPage from "../src/pages/user/CategoryPage";


import { UserLayout } from "./layouts/UserLayout";
import { OwnerLayout } from "./layouts/OwnerLayout";

import Dashboard from "./pages/owner/Dashboard";
import OwnerListing from "./pages/owner/OwnerListing";
import Bookings from "./pages/owner/Bookings";

import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import NoFoundPage from "./pages/NoFoundPage";

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
    element: <Auth />,
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
        path: "/owner/listings",
        element: <OwnerListing />,
      },
      {
        path: "/owner/bookings",
        element: <Bookings />,
      },
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