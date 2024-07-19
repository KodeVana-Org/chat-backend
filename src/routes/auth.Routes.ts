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

const router = Router();

// public-route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

//secure route
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
