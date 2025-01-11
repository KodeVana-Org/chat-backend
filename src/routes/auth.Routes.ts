import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
} from "../controllers/auth/register";
import {
    userLoginValidator,
    userRegisterValidator,
} from "../validators/user.validator";
import { validate } from "../validators/validator";
import { verifyJWT } from "../middlewares/auth.middleware";
import { forgot_password } from "../controllers/auth/forgot_password";
import { verify_otp } from "../controllers/auth/verify_otp";
import { new_password } from "../controllers/auth/new_password";
import { auth_google } from "../controllers/auth/auth_google";

const router = Router();

// public-route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/forgot-password").post(forgot_password);
router.route("/verify-otp").post(verify_otp);
router.route("/new-password").post(new_password);
router.route("/google").post(auth_google)

//secure route
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
