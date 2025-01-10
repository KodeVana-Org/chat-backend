import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../models/user.Model";
import env from "../config/dotenvConfig";
export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

export function generateAccessToken(user: IUser): string {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
        env.ACCESS_TOKEN_SECRET!,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY! },
    );
}

export function generateRefreshToken(user: IUser): string {
    return jwt.sign(
        {
            _id: user._id,
        },
        env.REFRESH_TOKEN_SECRET!,
        { expiresIn: env.REFRESH_TOKEN_EXPIRY! },
    );
}

export function generateTemperaryToken(): {
    unHashedToken: string;
    hashedToken: string;
    tokenExpiry: number;
} {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;
    return { unHashedToken, hashedToken, tokenExpiry };
}
