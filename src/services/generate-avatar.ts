import fs from "fs";
import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

const generate_avatar = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const form = new FormData();
        form.append("image", fs.createReadStream(req.file.path));

        const response = await axios.post("http://127.0.0.1:5000/generate", form, {
            headers: { ...form.getHeaders() },
        });

        // Delete temp file
        fs.unlinkSync(req.file.path);
        return res.json(response.data);
    } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { generate_avatar };

