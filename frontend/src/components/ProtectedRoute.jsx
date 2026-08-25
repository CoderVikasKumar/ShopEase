import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const [checking, setChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      // No JWT token = definitely logged out
      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Session invalid"
          );
        }

        // Valid token
        localStorage.setItem(
          "shopease_current_user",
          JSON.stringify(data.user)
        );

        setAuthenticated(true);
      } catch (error) {
        console.error(
          "Session verification failed:",
          error
        );

        // Remove invalid session
        localStorage.removeItem(
          "shopease_token"
        );

        localStorage.removeItem(
          "shopease_current_user"
        );

        localStorage.removeItem(
          "shopease_remember_me"
        );

        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifySession();
  }, []);

  if (checking) {
    return (
      <div className="protected-loading">
        Checking session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
        }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;