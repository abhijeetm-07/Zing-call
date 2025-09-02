import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const register = async (req, res) => {
  const { name, userName, password } = req.body;
  try {
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      userName,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${error}` });
  }
};

const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Username or Password" });
    }


    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,        
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",   
      maxAge: 24 * 60 * 60 * 1000, 
    });

    return res
      .status(httpStatus.OK)
      .json({ 
          message: "Login successful", 
          user: { 
              id: user._id, 
              name: user.name, 
              userName: user.userName 
            } 
        });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Something went wrong ${error}` });
  }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    return res.status(httpStatus.OK).json({ message: "Logged out successfully" });
};

const checkAuthStatus = async (req, res) => {
    return res.status(httpStatus.OK).json({ user: req.user });
};

export { login, register, logout, checkAuthStatus };