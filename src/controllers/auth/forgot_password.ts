import { IUser, User } from "../../models/user.Model"
import { generate_otp } from "../../services/generate_otp"
import { ApiError } from "../../utils/ApiError"
import { ApiResponse } from "../../utils/ApiResponse"
import { asyncHandler } from "../../utils/asyncHandler"
import { Request, Response } from "express"
import { sendOtp } from "../../services/sendEmail"

const forgot_password = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        // Extract the user ID from request parameters
        const { email } = req.body;


        // Validate user ID
        if (!email) {
            throw new ApiError(400, "User ID is required");
        }

        // Find the user by ID and include the email field
        const user: IUser | null = await User.findOne({ email }).select("+email +username");
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate an OTP and save it to the user document
        const otp = generate_otp(4);
        console.log("OTP", otp)
        user.otp = otp;
        await user.save();

        // Send the OTP to the user's email
        await sendOtp(user.email, otp);
        console.log("OTP sent successfully to:", user.email);


        // Return success response
        return res
            .status(200)
            .json(new ApiResponse(200, { otp }, "OTP sent successfully"));
    } catch (error) {
        console.error("Error while trying to send OTP:", error);

        // Handle known API errors gracefully
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message));
        }

        // Handle unexpected errors
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "An unexpected error occurred"));
    }
});

const resendOTP = asyncHandler(async (req, res, next) => {

    try {
        // Extract the user ID from request parameters
        const { email } = req.body;


        // Validate user ID
        if (!email) {
            throw new ApiError(400, "User ID is required");
        }

        // Find the user by ID and include the email field
        const user = await User.findOne({ email }).select("+email");
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate an OTP and save it to the user document
        const otp = generate_otp(4);
        user.otp = otp;
        await user.save();

        // Send the OTP to the user's email
        await sendOtp(user.email, otp);
        console.log("OTP sent successfully to:", user.email);

        // Return success response
        return res
            .status(200)
            .json(new ApiResponse(200, { otp }, "OTP resent successfully"));
    } catch (error) {
        console.error("Error while trying to send OTP:", error);

        // Handle known API errors gracefully
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message));
        }

        // Handle unexpected errors
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "An unexpected error occurred"));
    }
})
export { forgot_password, resendOTP }
