
import { Router } from "express";
import { deleteMessage, getMessageByConversationId, sendMessage } from "../controllers/chat/message.controller";

const router = Router();

router.route("/").post(sendMessage)
router.route("/:conversationId").get(getMessageByConversationId)
router.route("/:messageId").delete(deleteMessage)

export default router;
