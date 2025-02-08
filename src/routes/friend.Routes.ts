import { Router } from "express";
import { sent_fr_request } from "../controllers/friend/send-request";
import { acceptOrReject } from "../controllers/friend/acceptOrreject";
import { incomming_reuest } from "../controllers/friend/incomming-request";
import { get_friends } from "../controllers/friend/fetch-friends";
import { outgoing_request } from "../controllers/friend/outgoing-request";

const router = Router();

router.route("/sent-req/:recipientId").post(sent_fr_request);
router.route("/action-req/:userId").put(acceptOrReject);
router.route("/all-req/:userId").get(incomming_reuest)
router.route("/all-req-ongoing/:userId").get(outgoing_request)
router.route("/friends/:userId").get(get_friends)

export default router;
