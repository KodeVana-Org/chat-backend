import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError"
import env from "../config/dotenvConfig"
import { Request, Response, NextFunction } from "express";

interface TokenPayload {
    _id: string
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            throw new ApiError(404, "Token not found")
        }
        try {
            const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload

            //attach this extracted token to the => req.user
            req.user = decodedToken

            next()

        } catch (error) {
            console.log("Error while veriftying token")
            throw new ApiError(401, "Invalid or expired access token")

        }
    } catch (error) {
        throw new ApiError(404, "Invalid Token or expired")

    }
}


