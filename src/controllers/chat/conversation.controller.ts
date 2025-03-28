/*
    Route: POST /api/conversations/:userId
    Purpose: Create a new one-to-one or group conversation.
    Request Body:

    For one-to-one chat
        {
          "isGroup": false,
          "members": ["677d5bebc511fdf6b110a6e0"]
        }

    For group-chat
        {
         "isGroup": true,
         "members" :["677d5bebc511fdf6b110a6e0","6781ae41f33ba75158229db7"],
         "name": "Group Name",
        }

    Response:

    {
      "success": true,
      "conversation": { ... } // Newly created conversation object
    }
*/

import { Conversation, IConversation } from "../../models/conversation.Model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export const createConversation = asyncHandler(async (req: Request, res: Response): Promise<Response> => {

    try {

        const userId = req.params.userId; // user initiating  the conversation
        const { image, isGroup, members, name } = req.body

        // validate userId is valid
        if (!userId) {
            throw new ApiError(400, "User Id is required to create conversation")
        }

        // If it is a one-to-one chat , check if the converstaion already exist
        if (!isGroup && members.length === 1) {
            console.log("is this executing")
            const existingConversation = await Conversation.findOne(
                {
                    isGroupChat: false, // Ensure it's a one-to-one conversation
                    "participants.userId": { $all: [userId, members[0]] }

                }
            )
            if (existingConversation) {
                console.log("is this executing 2")
                return res.status(200).json(
                    new ApiResponse(200, existingConversation, "conversation already exist")
                )
            }
        }

        //validate the request data
        if (!members || members.length < 1) {
            throw new ApiError(400, "A conversation must have at least two member ")
        }

        //if isGroup is true
        if (isGroup) {

            //check members are more then two
            if (!members || members.length < 2) {
                throw new ApiError(400, "must have more than two member")
            }

            //check name exist
            if (!name || name.trim() == "") {
                throw new ApiError(400, "must have group name")
            }

            //check if name already taken
            const trimNamed = name.trim()
            const groupNameExist = await Conversation.findOne({ groupName: trimNamed })
            if (groupNameExist) {
                throw new ApiError(400, "Group name already taken, choose another name")
            }
        }

        // first adding data to participants
        const participants = [
            {
                userId, // The initiating user
                isAdmin: isGroup || false, //The initiating user is admin if it is a group chat
                role: isGroup ? "admin" : "member" // ROLE as "admin" for group chate and "member" otherwise
            },
            ...members.map((memberId: string) => ({
                userId: memberId,
                isAdmin: false, // Other participants are not admin  by default
                role: "member" // All other participants are member
            }))
        ]

        //creating conversation object
        const newConversation = new Conversation({
            participants,
            isGroupChat: isGroup || false,
            groupName: isGroup ? name : null,
            groupImage: isGroup ? image : null

        })

        const savedConversation = await newConversation.save()
        return res.status(201).json(
            new ApiResponse(201, { savedConversation }, "Conversation created sucessfully")
        )

    } catch (error: any) {
        console.error("Error while creating conversation", error)
        throw new ApiError(500, "Internal server error", error.message)
    }

})


/*
 * This controller is for getting all the conversation
 * 
 */

export const getAllConversations = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        // Fetch all conversations with type safety
        const conversations: IConversation[] = await Conversation.find();

        // Check if no conversations are found
        if (conversations.length === 0) {
            throw new ApiError(404, "No conversations found");
        }

        // Return success response with fetched data
        return res.status(200).json(
            new ApiResponse(200, { data: conversations }, "Fetched all conversations successfully")
        );
    } catch (error) {
        console.error("Error while fetching conversations:", error);

        // Safely extract error message
        let errorMessage = "An unknown error occurred";
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
        }

        // Throw a generic API error if it's not an ApiError
        throw new ApiError(500, "Internal server error", [errorMessage]);
    }
})

/*
 * Get conversation by conversationId
 */

export const GetConversationBYId = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.params.conversationId

        //validate the Id
        if (!userId) {
            throw new ApiError(400, "Conversation Id is required")
        }

        //fetch converstaion
        const conversation = await Conversation.findById(userId).populate({
            path: "participants.userId",
            select: "username avatar email"
        })

        if (!conversation) {
            throw new ApiError(404, "Conversation not found")
        }

        // Return the conversation
        return res.status(200).json(
            new ApiResponse(200, { data: conversation }, "Conversation fetched successfully")
        );

    } catch (error: any) {
        console.error("Error while fetching conversation:", error);
        throw new ApiError(500, "Internal server error", error.message);
    }
})


/*
 * Rename the group
 * To Rename the group user need to be admin
 */

export const renameGroup = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const userId = req.params.userId // user who will gonna rename the group
        const { newName, conversationId } = req.body // grab the new_group_name and Group_id{conversationId}

        if (!userId || !newName) {
            throw new ApiError(404, "userId and newName is required")
        }

        //check user is admin or not
        //const user = await Conversation.findbyId(userId)
        //find the groub{conversationId} ID by conversationId
        const conversation = await Conversation.findOne({ _id: conversationId, isGroupChat: true })
        console.log("means converstiaon found: ", conversation)

        if (!conversation) {
            throw new ApiError(404, "group not exist")
        }

        //Here need to chekc user id admin or not
        const isAdmin = conversation.participants.some(
            (participant) => participant.userId.toString() === userId.toString() && participant.isAdmin
        )
        if (!isAdmin) {
            throw new ApiError(403, "You are not authorized to rename this group")
        }

        //Check if the new grop name is already in use 
        const existingGroup = await Conversation.findOne({
            groupName: newName.trim(),
            isGroupChat: true
        })

        if (existingGroup) {
            throw new ApiError(400, "A group with this name already exist")
        }

        //Update the group name
        conversation.groupName = newName.trim()
        await conversation.save()

        //Return Response
        return res.json(
            new ApiResponse(200, { conversation }, "Group renamed successfully")
        )

    } catch (error) {

        console.error("Error while fetching conversations:", error);

        // Safely extract error message
        let errorMessage = "An unknown error occurred";
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
        }

        // Throw a generic API error if it's not an ApiError
        throw new ApiError(500, "Internal server error", [errorMessage]);
    }

})


/*
 * Delete the group
 * Only the admin will delete the group
 */

export const deleteGroup = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const userId = req.params.userId
        const { groupId } = req.body

        //Find the group Id
        const groupConversation = await Conversation.findOne({
            _id: groupId, isGroupChat: true
        })

        if (!groupConversation) {
            throw new ApiError(404, "group not found")
        }

        //Check user admin or not
        const isAdmin = groupConversation.participants.some(
            (participant) => participant.userId.toString() === userId.toString() && participant.isAdmin
        )

        if (!isAdmin) {
            throw new ApiError(403, "You are not authorized to delete this group")
        }

        //Delete the group
        await groupConversation.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, {}, "group deleted successfully")
        )

    } catch (error) {
        console.error("Error while fetching conversations:", error);

        // Safely extract error message
        let errorMessage = "An unknown error occurred";
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
        }

        // Throw a generic API error if it's not an ApiError
        throw new ApiError(500, "Internal server error", [errorMessage]);
    }
})


/*
 * Remove the member from  the group
 */

export const removeMember = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        const userId = req.params.userId
        const { groupId, memberId } = req.body

        //Find the group Id
        const groupConversation = await Conversation.findOne({
            _id: groupId, isGroupChat: true
        })

        if (!groupConversation) {
            throw new ApiError(404, "group not found")
        }

        //Check user admin or not
        const isAdmin = groupConversation.participants.some(
            (participant) => participant.userId.toString() === userId.toString() && participant.isAdmin
        )

        if (!isAdmin) {
            throw new ApiError(403, "You are not authorized to delete this group")
        }

        //Check if the member exist in the group
        const memberIndex = groupConversation.participants.findIndex(
            (participant) => participant.userId.toString() === memberId.toString()
        )

        if (memberIndex === -1) {
            throw new ApiError(404, "Member not found in this group")
        }

        //Here remove the member 
        groupConversation.participants.splice(memberIndex, 1)

        //save the updated group
        await groupConversation.save()


        return res.status(200).json(
            new ApiResponse(200, { groupId, removedMemberId: memberId }, "Member removed successfully"))

    } catch (error) {
        console.error("Error while fetching conversations:", error);

        // Safely extract error message
        let errorMessage = "An unknown error occurred";
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
        }

        // Throw a generic API error if it's not an ApiError
        throw new ApiError(500, "Internal server error", [errorMessage]);
    }
})


/*
 * Remove the member from  the group
 */

export const addGroupMember = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.params.userId
        const { groupId, newMemberId } = req.body

        //Find the group
        const groupConversation = await Conversation.findOne({
            _id: groupId,
            isGroupChat: true
        })

        if (!groupConversation) {
            throw new ApiError(404, "Group not found")
        }

        //Check the reqesting user is admin
        // Check if the requesting user is an admin
        const isAdmin = groupConversation.participants.some(
            (participant) => participant.userId.toString() === userId.toString() && participant.isAdmin
        );

        // If the user is not an admin, return a 403 error
        if (!isAdmin) {
            throw new ApiError(403, "You are not authorized to add a member to this group");
        }

        // Check if the new member is already in the group
        const isAlreadyMember = groupConversation.participants.some(
            (participant) => participant.userId.toString() === newMemberId.toString()
        );

        if (isAlreadyMember) {
            throw new ApiError(400, "This user is already a member of the group");
        }
        //Add the member to the group
        groupConversation.participants.push({
            userId: newMemberId,
            isAdmin: false,
            role: "member"
        })

        //saved the updated grop
        await groupConversation.save()

        // Return success response
        return res.status(200).json(
            new ApiResponse(200, { groupId, addedMemberId: newMemberId }, "Member added successfully")
        );

    } catch (error: any) {
        console.error("Error adding member to group:", error);
        throw new ApiError(500, "Internal server error", [error.message || error.toString()]);
    }
})
