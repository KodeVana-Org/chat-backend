import { IUser } from "../../models/user.Model";
import { User } from "../../models/user.Model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { Response, Request } from "express";

const get_incomming_reuest = asyncHandler(async (req: Request, res: Response) => {
    //First need the user id => who will fetch the incoming_firend_request
})
