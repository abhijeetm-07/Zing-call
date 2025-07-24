import axios, { HttpStatusCode } from "axios";
import { useState } from "react";
import { createContext, use, useContext } from "react";
import { useNavigate } from "react-router";



export const AuthContext=createContext({});

const client=axios.create({
  baseURL:"http://localhost:8000/api/v1/users"
})

export const AuthProvider=({children})=>{
  const authContext =useContext(AuthContext);
  const [userData,setUserData]=useState(authContext);

const handleRegister = async (name, userName, password) => {
  try {
    console.log("Sending request:", { name, userName, password }); // Debug log
    const response = await client.post("/register", {
      name,
      userName,
      password,
    });

    console.log("Register response:", response); // Debug log

    if (response.status === HttpStatusCode.Created) {
      return response.data.message;
    } else {
      throw new Error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
};

  const handleLogin=async(userName,password)=>{
    try {
      let request=await client.post("/login",{
        userName:userName,
        password:password,
      })
      if(request.status===HttpStatusCode.Ok){
       localStorage.setItem("token",request.data.token)
       router("/home")
       
      }

    } catch (error) {
      throw error;
    }
  }

  const router=useNavigate()
  const data={
    userData,setUserData,handleRegister,handleLogin
  };

  return(
  <AuthContext.Provider value={data}>
    {children}
  </AuthContext.Provider>
  )
}