import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getToken, setToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (mounted) {
          setAdmin(response.data.admin);
        }
      } catch {
        setToken(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await authApi.login(credentials);
    setToken(response.data.token);
    setAdmin(response.data.admin);
    return response.data.admin;
  }

  function logout() {
    setToken(null);
    setAdmin(null);
  }

  const value = useMemo(
    () => ({
      admin,
      loading,
      login,
      logout
    }),
    [admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}

