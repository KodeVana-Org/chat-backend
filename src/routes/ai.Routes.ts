import { Router } from "express";
import { generate_avatar } from "../services/generate-avatar";
import multer from "multer";
import { generate_gemini_text } from "../chatgpt/chatgpt";
const upload = multer({ dest: "upload/" })

const router = Router();


router.route("/upload").post(upload.single("image"), generate_avatar)
router.route("/ai").post(generate_gemini_text)

export default router;
