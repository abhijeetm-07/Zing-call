import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto"

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
      name: name,
      userName: userName,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (error) {
    res.json({ message: `Something went wrong ${error}` });
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
    let isPasswordCorrect= await bcrypt.compare(password,user.password)
    if(isPasswordCorrect){
      let token=crypto.randomBytes(20).toString("hex");
      user.token=token;
      await user.save();
      return res.status(httpStatus.OK).json({token:token});
    }
    else{
      return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Username or Password"})
    }
  } catch (error) {
    return res.status(500).json({message:`Something went wrong ${error}`})
  }
};
export {login,register}