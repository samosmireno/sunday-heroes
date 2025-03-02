import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/auth-context.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home-page.tsx";
import ErrorPage from "./pages/error-page.tsx";
import ProtectedRoute from "./pages/protected-route.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AddMultiForm from "./pages/add-multi-form.tsx";
import AuthCallback from "./pages/auth-callback.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <HomePage />
        <ReactQueryDevtools />
      </>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/add-match",
    element: (
      <ProtectedRoute>
        <AddMultiForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-match/:matchId",
    element: (
      <ProtectedRoute>
        <AddMultiForm />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
