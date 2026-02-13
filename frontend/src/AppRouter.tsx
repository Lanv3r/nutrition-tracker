import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import DietOverview from "./pages/DietOverview";
import AddMeal from "./pages/AddMeal";
import Dashboard from "./pages/Dashboard";

function RequireAuth({
  userId,
  children,
}: {
  userId: number | null;
  children: React.ReactNode;
}) {
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
          setUsername(data.username);
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (!csrfRes.ok) throw new Error("Unable to fetch CSRF token");
      const { csrfToken } = await csrfRes.json();
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? "Logout failed");
      }
    } catch (err) {
      // ignore
    }
    setUserId(null);
    setUsername(null);
  };

  if (checking) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Checking session…</div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/login",
      element: userId ? (
        <Navigate to="/" replace />
      ) : (
        <Login
          onSuccess={(id, name) => {
            setUserId(id);
            setUsername(name);
            router.navigate("/");
          }}
          onGoToSignup={() => router.navigate("/signup")}
        />
      ),
    },
    {
      path: "/signup",
      element: userId ? (
        <Navigate to="/" replace />
      ) : (
        <Signup
          onSuccess={(id, name) => {
            setUserId(id);
            setUsername(name);
            router.navigate("/");
          }}
          onGoToLogin={() => router.navigate("/login")}
        />
      ),
    },
    {
      path: "/",
      element: (
        <RequireAuth userId={userId}>
          <MainPage
            userId={userId!}
            username={username!}
            onLogout={handleLogout}
          />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <Dashboard userId={userId!} /> },
        { path: "add-meal", element: <AddMeal userId={userId!} /> },
        { path: "diet-overview", element: <DietOverview userId={userId!} /> },
        { path: "profile", element: <Profile userId={userId!} /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
