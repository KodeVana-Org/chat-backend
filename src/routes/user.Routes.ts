import { Router } from "express";
import { getAllUser } from "../controllers/user/getAllUser";

const router = Router();

router.route("/all-users").get(getAllUser);

export default router;
