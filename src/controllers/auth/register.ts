import { Request, Response } from "express";
import { User, UserRoles } from "../../models/user.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { generateAccessAndRefreshToken } from "../../utils/generateAccessAndRefreshToken";
import { TempEmail } from "../../models/temp"
import { generate_otp } from "../../services/generate_otp";

/*
   first lets veify the user  throught the email if ther email is valid then we will register 
   I think there need to be also check if the user is already regiusterd or not
*/
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        /*
         * Lets check if hte email is already registerd
        */

        const user_already_registerd = await User.findOne({ email })
        if (user_already_registerd) {
            return res.status(400).json({
                message: "This email is already registerd"
            })
        }

        const emailExist = await TempEmail.findOne({ email })

        //generate four digit otp
        const otp = generate_otp(4)
        console.log("OTP: ", otp)

        //if emial exist then update the opt and send
        if (emailExist) {
            emailExist.otp = otp
            await emailExist.save()
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { otp },
                        "OTP sended successfully",
                    ),
                );
        }

        //if email not exist that mean new user ,
        // new user  then save the mail and save the otp and send
        const newEmail = await TempEmail.create({ email, otp })
        await newEmail.save()

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { otp },
                    "OTP sended successfully",
                ),
            );

    } catch (error) {
        console.error("Eror while seding verification email", error)
    }

})



const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, otp } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        return res.status(200).json({ message: "User already exist" })
        //throw new ApiError(400, "User with email or username already exists", []);
    }

    // lets verify otp here first
    const tempEmail_exist = await TempEmail.findOne({ email })
    if (!tempEmail_exist) {
        return res.status(404).json({
            message: "Email and OTP not exist"
        })
    }
    if (tempEmail_exist) {
        if (tempEmail_exist.otp != otp) {
            return res.status(401).json({
                message: "Incorrect OTP"
            })
        }
    }



    const user = await User.create({
        email,
        password,
        username,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    try {
        return res
            .status(200)
            .cookie("accessToken", accessToken) // set the access token in the cookie
            .cookie("refreshToken", refreshToken) // set the refresh token in the cookie
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
                    "User registerd  successfully",
                ),
            );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while login",
        });
    }
});


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required ");
    }

    const user = await User.findOne({
        $or: [{ email }],
    }).select("+password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User does not exist ",
        });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    try {
        return res
            .status(200)
            .cookie("accessToken", accessToken) // set the access token in the cookie
            .cookie("refreshToken", refreshToken) // set the refresh token in the cookie
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
                    "User logged in successfully",
                ),
            );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while login",
        });
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        { new: true },
    );

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, loginUser, logoutUser, verifyEmail };
