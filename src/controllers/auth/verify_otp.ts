import { User } from "../../models/user.Model"
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler"
import { Request, Response } from "express"

const verify_otp = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        //get email and opt
        const { email, otp } = req.body;
        console.log(email, otp)
        //check email is valid or not
        const user = await User.findOne({ email })

        //user not exist
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        //opt is match or not
        if (user.otp !== otp) {
            throw new ApiError(404, "Invalid otp")
        }
        console.log("if im here opt verifiled: ")
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "otp verified successfully"))
    } catch (error) {
        console.error("Error during otp verification", error)

        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message))
        }
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "An unexpected error occurred"));
    }
})

export { verify_otp }
