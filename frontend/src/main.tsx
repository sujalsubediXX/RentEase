import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import { AuthProvider } from "./contexts/AuthContext"; // ADD THIS

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
import OwnerListingForm from "./pages/owner/OwnerListingForm";
import { Earnings } from "./pages/owner/Earnings";
import ProtectedRoute from "./auth/ProtectedRoute";
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
import CategoryManagement from "./pages/owner/CategoryManagement";
import CheckoutPage from "./pages/user/CheckoutPage";
import ConfirmBookingPage from "./pages/user/ConfirmBookingPage";
import PaymentSuccessPage from "./pages/user/PaymentSuccessPage";
import PaymentFailurePage from "./pages/user/PaymentFailurePage";
import Unauthorized from "./pages/Unauthorized";
import Kycviewpage from "./pages/admin/Kycreviewpage";
import KYCDetailView from "./pages/admin/Kycdetailview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { path: "/", element: <Body /> },
      { path: "/how-it-works", element: <HowItWorks /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password/:token", element: <ResetPasswordPage /> },
      { path: "/categories/:categoryId", element: <CategoryPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      {
        path: "/profile", element: (
          <ProtectedRoute allowedRoles={["owner", "renter"]} >
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: "/cart", element: (
          <ProtectedRoute allowedRoles={["owner", "renter"]} >
            <CartPage />
          </ProtectedRoute>
        )
      },

      {
        path: "/wishlist", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <WishlistPage />
            </ProtectedRoute>
          )
      },
      {
        path: "/checkout", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <CheckoutPage />
            </ProtectedRoute>
          )
      },
      {
        path: "/confirm-booking", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <ConfirmBookingPage />
            </ProtectedRoute>
          )
      },
      {
        path: "/payment-failure", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <PaymentFailurePage />
            </ProtectedRoute>
          )
      },
      {
        path: "/payment-success", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <PaymentSuccessPage />
            </ProtectedRoute>
          )
      },
      {
        path: "/settings", element:
          (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
              <UserSettingsPage />
            </ProtectedRoute>
          )
      },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/kycverification", element:
     (
            <ProtectedRoute allowedRoles={["owner", "renter"]} >
            <KYCVerificationForm /> 
            </ProtectedRoute>
          )
},
  { path: "/register", element: <Register /> },

  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["owner"]} >
        <OwnerLayout />
      </ProtectedRoute >
    ),
    children: [
      { path: "/owner/dashboard", element: <Dashboard /> },
      { path: "/owner/bookings", element: <Bookings /> },
      { path: "/owner/managecategory", element: <CategoryManagement /> },
      { path: "/owner/listings", element: <OwnerListings /> },
      { path: "/owner/listings/edit/:itemId", element: <OwnerListingForm /> },
      { path: "/owner/listings/new", element: <OwnerListingForm /> },
      { path: "/owner/reviews", element: <Reviews /> },
      { path: "/owner/messages", element: <Messages /> },
      { path: "/owner/settings", element: <Settings /> },
      { path: "/owner/earnings", element: <Earnings /> },
    ],
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]} >
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/admin/dashboard", element: <DashboardPage /> },
      { path: "/admin/users", element: <UsersPage  /> },
      { path: "/admin/owners", element: <OwnersPage  /> },
      { path: "/admin/listings", element: <ListingsPage /> },
      { path: "/admin/bookings", element: <BookingsPage /> },
      { path: "/admin/revenue", element: <RevenuePage /> },
      { path: "/admin/reviews", element: <ReviewsPage /> },
      { path: "/admin/kycreview", element: <Kycviewpage /> },
      { path: "/admin/kyc/:id", element: <KYCDetailView /> },
      { path: "/admin/messages", element: <MessagesPage /> },
      { path: "/admin/settings", element: <SettingsPage /> },
    ],
  },

  { path: "*", element: <NoFoundPage /> },
  { path: "/unauthorized", element: <Unauthorized /> }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);