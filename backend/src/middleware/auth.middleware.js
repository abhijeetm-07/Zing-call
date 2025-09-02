import { User } from "../models/user.model.js";
import httpStatus from "http-status";


const authMiddleware = async (req, res, next) => {
 // Get the token from cookies
  const { token } = req.cookies;


  if (!token) {
    return next(); 
  }

  try {
    const user = await User.findOne({ token }).select("-password"); 

    if (!user) {
      res.clearCookie("token");
      return next();
    }


    req.user = user;
    next(); 
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Authentication error" });
  }
};


export const protectRoute = (req, res, next) => {
    if (!req.user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "You must be logged in to access this." });
    }
    next();
};


export default authMiddleware;