import { Router } from "express";
import { sent_fr_request } from "../controllers/friend/send-request";
import { acceptOrReject } from "../controllers/friend/acceptOrreject";

const router = Router();

router.route("/sent-req/:recipientId").post(sent_fr_request);
router.route("/action-req/:userId").post(acceptOrReject);
//router.route("/friends").post('')

export default router;
