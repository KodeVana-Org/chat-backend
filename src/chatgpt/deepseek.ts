import { Request, Response } from "express";
import axios from "axios";
import env from "../config/dotenvConfig";

interface GenerateTextRequestBody {
    prompt: string;
}

const openrouter_text = async (
    req: Request<{}, {}, GenerateTextRequestBody>,
    res: Response
): Promise<Response> => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions", // OpenRouter API endpoint
            {
                model: "deepseek/deepseek-r1:free", // Free DeepSeek model
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.DEEPSEEK}`, // Your OpenRouter API key
                },
            }
        );

        const resp = response.data.choices[0]?.message.content || "No response generated";
        console.log(resp);
        return res.json({ response: resp });
    } catch (error: any) {
        const errorMsg = error.response?.data || error.message;
        console.error("Error in OpenRouter request:", errorMsg);
        return res.status(500).json({ error: "Failed to process request", details: errorMsg });
    }
};

export { openrouter_text };
