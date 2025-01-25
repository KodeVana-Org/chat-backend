import mongoose from "mongoose";
import { User } from "../../models/user.Model"
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler"
import { cloudinary } from "../../config/cloudinaryConfigs";
import { Request, Response } from "express";


const update_user_details = asyncHandler(async (req: Request, res: Response) => {
    try {
        //updating :=> name , bio, profile
        const { userId } = req.params
        const { name, bio } = req.body
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(404, "Invalid userId")
        }

        //find the user
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        // Update the field if provided
        if (name) user.username = name
        if (bio) user.bio = bio


        const files = req.files as { [fieldname: string]: Express.Multer.File[] }
        const imageFile = files?.['image']?.[0]


        // Upload profile image to Cloudinary if provided

        // Upload profile image to Cloudinary
        let imageResults: string | undefined;

        if (imageFile) {
            // Ensure the file buffer exists
            if (!imageFile.buffer) {
                throw new Error("File buffer not found. Ensure you're using `multer.memoryStorage()`.");
            }

            // Upload profile image to Cloudinary
            imageResults = await new Promise<string>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image' },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        if (!result || !result.secure_url) {
                            return reject(new Error("Failed to upload image to Cloudinary"));
                        }
                        resolve(result.secure_url); // Resolve with the image URL
                    }
                );

                stream.end(imageFile.buffer); // Pass file buffer to Cloudinary
            });

            // Update user with the Cloudinary image details
            user.avatar.url = imageResults;
        }

        // Save the updated user data
        await user.save();

        // Return response
        return res
            .status(200)
            .json(new ApiResponse(200, { imageResults }, "Updated bio successfully"));
    } catch (error) {
        console.error("Error while updating user details:", error);

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

export { update_user_details }
