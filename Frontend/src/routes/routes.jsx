import { Routes, Route, Navigate, createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import RedirectAuthenticatedUser from "./RedirectAuthenticatedUser";
import MainLayout from "../layouts/MainLayout";
import SignUpLayout from "../layouts/SignUpLayout";
import ErrorPage from "../pages/ErrorPage";
import WelcomePage from "../pages/WelcomePage";
import SignUpPage from "../pages/SignUpPage";
import SignUpDetailsPage from "../pages/SignUpDetailsPage";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AllActivitysPage from "../pages/Profile/AllActivitysPage";
import AnalyticsPage from '../pages/Profile/AnalyticsPage';
import ResourcePage from '../pages/Profile/ResourcesPage';
import MessagingPage from "../pages/Messaging/MessagingPage";
import FollowersPage from "../pages/Profile/FollowersPage";
import PostDetails from "../components/Post/PostDetails";

const Home = lazy(() => import("../pages/Home"));
const Networks = lazy(() => import("../pages/Networks/NetworksPage"));
const Notifications = lazy(() => import("../pages/Notifications/NotificationsPage"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const SearchPage = lazy(() => import("../pages/SearchPage"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Navigate to="/feed" replace />,
      },
      {
        path: "feed",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <Home />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:profileId",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/allActivity/:id",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <AllActivitysPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "posts/:id",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <PostDetails />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <AnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "resources",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <ResourcePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "networks",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <Networks />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <Notifications />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "messaging",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <MessagingPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "followers",
        element: (
          <ProtectedRoute>
            <FollowersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "searchAll",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<h1>Loading...</h1>}>
              <SearchPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<h1>Loading...</h1>}>
        <WelcomePage />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<h1>Loading...</h1>}>
        <SignUpLayout />
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: (
          <RedirectAuthenticatedUser>
            <Suspense fallback={<h1>Loading...</h1>}>
              <SignUpPage />
            </Suspense>
          </RedirectAuthenticatedUser>
        ),
      },
    ],
  },
  {
    path: "/SignUpDetailsPage",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<h1>Loading...</h1>}>
          <SignUpDetailsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <RedirectAuthenticatedUser>
        <EmailVerificationPage />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password/:token",
    element: (
      <RedirectAuthenticatedUser>
        <ResetPasswordPage />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: "/login",
    element: (
      <RedirectAuthenticatedUser>
        <Suspense fallback={<h1>Loading...</h1>}>
          <LoginPage />
        </Suspense>
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);

export default routes;


