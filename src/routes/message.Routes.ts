
import { Router } from "express";
import { deleteMessage, getMessageByConversationId, getMessageMedia, sendMessage } from "../controllers/chat/message.controller";

const router = Router();

router.route("/").post(sendMessage)
router.route("/:conversationId").get(getMessageByConversationId)
router.route("/:messageId").delete(deleteMessage)
router.route("/:messageId/media").get(getMessageMedia)

export default router;
