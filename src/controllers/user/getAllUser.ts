import { User } from "../../models/user.Model";
import { Response, Request } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const allUser = await User.find({});
    if (allUser.length === 0) {
      throw new ApiError(404, "User now found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { user: allUser }, "successfully fetch all user"),
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching users");
  }
});

export { getAllUser };
