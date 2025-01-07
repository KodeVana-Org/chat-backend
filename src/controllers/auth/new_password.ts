import { User } from "../../models/user.Model"
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse"
import { asyncHandler } from "../../utils/asyncHandler"
import { Response, Request } from "express";

const new_password = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, new_password } = req.body;

        //check email is valid or not
        const user = await User.findOne({ email }).select("+password")

        //user not exist
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        //here i need to set the new password
        user.password = new_password
        user.save()
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password Reset Successfully"))

    } catch (error) {
        console.error("Eror while setting new password")

        if (error instanceof ApiResponse) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message))
        }
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "An unexpected error occured"))
    }
})

export { new_password }
