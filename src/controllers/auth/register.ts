import { Request, Response } from "express";
import { User, UserRoles } from "../../models/user.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { generateAccessAndRefreshToken } from "../../utils/generateAccessAndRefreshToken";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(400, "User with email or username already exists", []);
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
            message: "user not exist ",
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

export { registerUser, loginUser, logoutUser };
