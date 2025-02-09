
import { Router } from "express";
import { deleteMessage, getMessageByConversationId, getMessageMedia, sendMessage } from "../controllers/chat/message.controller";
import { upload } from "../config/multerConfig";

const router = Router();

//router.route("/").post(sendMessage)
router.post(
    "/",
    upload.fields([
        { name: "media", maxCount: 5 }, // Allow up to 5 media files
        { name: "document", maxCount: 1 }, // Allow 1 document file
        { name: "audio", maxCount: 1 }, // Allow 1 audio file
    ]),
    sendMessage
);

router.route("/:conversationId").get(getMessageByConversationId)
router.route("/:messageId").delete(deleteMessage)
router.route("/:messageId/media").get(getMessageMedia)

export default router;
