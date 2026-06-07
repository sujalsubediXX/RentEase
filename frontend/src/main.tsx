import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import HowItWorks from "./pages/user/HowItWorks";
import Body from "./pages/user/Body";
import CategoriesPage from "./pages/user/Categories";
import CategoryPage from "./pages/user/CategoryPage";
import Contact from "./pages/user/Contact";
import About from "./pages/user/About";

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
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { ListingsPage } from "./pages/admin/ListingsPage";
import { BookingsPage } from "./pages/admin/BookingsPage";
import { RevenuePage } from "./pages/admin/RevenuePage";
import { ReviewsPage } from "./pages/admin/ReviewsPage";
import { MessagesPage } from "./pages/admin/MessagesPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { OwnersPage } from "./pages/admin/OwnersPage";
import ProfilePage from "./pages/user/ProfilePage";
import WishlistPage from "./pages/user/WishlistPage";
import CartPage from "./pages/user/CartPage";
import UserSettingsPage from "./pages/user/UserSettingsPage";
import KYCVerificationForm from "./pages/KYCVerificationForm";


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
      },
      {
        path: "/about",
        element: <About/>,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/settings",
        element: <UserSettingsPage />,
      },

    ],
  },


  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/kycverification",
    element: <KYCVerificationForm />,
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
    path: "/admin",
    element:
      <>
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      </>,
    children: [
      {
        path: "/admin/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/admin/users",
        element: <UsersPage  roleFilter="user" />,
      },
      {
        path: "/admin/owners",
        element: <OwnersPage roleFilter="owner" />,
      },
      {
        path: "/admin/listings",
        element: <ListingsPage />,
      },
      {
        path: "/admin/bookings",
        element: <BookingsPage />,
      },
      {
        path: "/admin/revenue",
        element: <RevenuePage />,
      },
      {
        path: "/admin/reviews",
        element: <ReviewsPage />,
      },
      {
        path: "/admin/messages",
        element: <MessagesPage />,
      },
      {
        path: "/admin/settings",
        element: <SettingsPage />,
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