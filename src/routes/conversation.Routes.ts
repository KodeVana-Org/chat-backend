
import { Router } from "express";
import { GetConversationBYId, addGroupMember, createConversation, deleteGroup, getAllConversations, removeMember, renameGroup } from "../controllers/chat/conversation.controller";

const router = Router();

router.route("/:userId").post(createConversation);
router.route("/:conversationId").get(GetConversationBYId);
router.route("/con").get(getAllConversations);
router.route("/rename-group/:userId").patch(renameGroup);
router.route("/delete-group/:userId").delete(deleteGroup);
router.route("/remove-member/:userId").post(removeMember);
router.route("/add-member/:userId").post(addGroupMember);

export default router;
