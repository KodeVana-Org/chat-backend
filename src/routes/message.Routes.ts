
import { Router } from "express";
import { getMessageByConversationId, sendMessage } from "../controllers/chat/message.controller";

const router = Router();

router.route("/").post(sendMessage)
router.route("/:conversationId").get(getMessageByConversationId)

export default router;
