import React, { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
  withCredentials: true, 
});

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  const handleRegister = async (name, userName, password) => {
    try {
      const response = await client.post("/register", {
        name,
        userName,
        password,
      });
      return response.data.message;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleLogin = async (userName, password) => {
    try {
      const response = await client.post("/login", {
        userName,
        password,
      });
      if (response.data.user) {
        setUserData(response.data.user);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await client.post("/logout");
      setUserData(null); 
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }
  };
  
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        
        const response = await client.get("/status");
        if (response.data.user) {
          setUserData(response.data.user);
        }
      } catch (error) {
        console.log("User not authenticated.");
      } finally {

        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);


  const value = {
    userData,
    loading, 
    handleRegister,
    handleLogin,
    handleLogout, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};