import { Router } from "express";
import { sent_fr_request } from "../controllers/friend/send-request";
import { acceptOrReject } from "../controllers/friend/acceptOrreject";
import { incomming_reuest } from "../controllers/friend/incomming-request";
import { get_friends } from "../controllers/friend/fetch-friends";

const router = Router();

router.route("/sent-req/:recipientId").post(sent_fr_request);
router.route("/action-req/:userId").put(acceptOrReject);
router.route("/all-req/:userId").get(incomming_reuest)
router.route("/friends/:userId").get(get_friends)

export default router;
