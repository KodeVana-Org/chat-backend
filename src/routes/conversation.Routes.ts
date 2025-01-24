
import { Router } from "express";
import { createConversation, getAllConversations, renameGroup } from "../controllers/chat/conversation.controller";

const router = Router();

router.route("/:userId").post(createConversation);
router.route("/con").get(getAllConversations);
router.route("/rename-group/:userId").patch(renameGroup);
//router.route("/con").get(getAllConversations);

export default router;
