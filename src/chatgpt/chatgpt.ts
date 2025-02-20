import { GoogleGenerativeAI } from "@google/generative-ai"
//import env from "../src/config/dotenvConfig"
import env from "../config/dotenvConfig"
import { Request, Response } from "express"; // Importing Request and Response from express

const genAI = new GoogleGenerativeAI(env.GEMENI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface GenerateTextRequestBody {
    prompt: string;
}

const generate_gemini_text = async (req: Request<{}, {}, GenerateTextRequestBody>, res: Response): Promise<Response> => {
    try {
        const { prompt } = req.body;
        console.log("this is prompt", req.body)
        // Validate the prompt
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({ error: "Invalid or missing 'prompt' in request body." });
        }

        // Generate content using the model
        const result = await model.generateContent(prompt);
        const response = result.response.text(); // Await properly

        // Return the generated response
        return res.json({ response });
    } catch (error: any) {
        console.error("Error generating AI response:", error);
        return res.status(500).json({ error: "Error generating response." });
    }
};

export { generate_gemini_text }
