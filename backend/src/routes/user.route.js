import { Router } from "express";
import { login, register, logout, checkAuthStatus } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; 

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/logout").post(logout);


router.route("/status").get(protectRoute, checkAuthStatus);

router.route("/add_to_activity");
router.route("/get_all_activity");

export default router;