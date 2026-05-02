import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  api.get("/auth/me")
    .then((res) => setUser(res.data.data))
    .catch(() => setUser(null))  // ✅ Already correct — bas interceptor fix karo
    .finally(() => setLoading(false));
}, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
