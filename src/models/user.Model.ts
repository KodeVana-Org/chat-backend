import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import {
    generateAccessToken,
    generateRefreshToken,
    generateTemperaryToken,
} from "../utils/authHelper";

export enum UserRoles {
    ADMIN = "ADMIN",
    USER = "USER",
}
export const AvailableUserRoles = Object.values(UserRoles);

interface userAvatar {
    url: string;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    avatar: userAvatar;
    role: UserRoles;
    password: string;
    otp: number
    sentFriendReq: mongoose.Types.ObjectId[];
    incommingFriendReq: mongoose.Types.ObjectId[];
    refreshToken?: string;
    forgotPasswordToken?: string;
    forgotPasswordExpiry: Date;

    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    generateTemperoryToken(): {
        unHashedToken: string;
        hashedToken: string;
        tokenExpiry: number;
    };
}

const userSchemaFields = {
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: {
            url: String,
        },
        default: {
            url: `https://via.placeholder.com/200x200.png`,
        },
    },
    role: {
        type: String,
        enum: UserRoles,
        default: UserRoles.USER,
    },
    otp: {
        type: Number,
        required: false
    },
    password: {
        type: String,
        required: [true, "password is required"],
        select: false,
    },
    sentFriendReq: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FriendRequest",
        },
    ],
    incommingFriendReq: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FriendRequest",
        },
    ],

    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
};
const userSchema = new Schema<IUser>(userSchemaFields as Record<string, any>, {
    timestamps: true,
});

//Whenever new user is saved or password is modified it will hash the password
userSchema.pre<IUser>("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(
    password: string,
): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);

    } catch (error) {
        return false;
    }
};

userSchema.methods.generateAccessToken = function(this: IUser): string {
    console.log("this:", this)
    console.log("output :", generateAccessToken(this))
    return generateAccessToken(this);
};

userSchema.methods.generateRefreshToken = function(this: IUser): string {
    return generateRefreshToken(this);
};
userSchema.methods.generateTemperaryToken = function(this: IUser): {
    unHashedToken: string;
    hashedToken: string;
    tokenExpiry: number;
} {
    const { unHashedToken, hashedToken, tokenExpiry } = generateTemperaryToken();
    return {
        unHashedToken,
        hashedToken,
        tokenExpiry,
    };
};

export const User: Model<IUser & Document> = mongoose.model<IUser>(
    "User",
    userSchema,
);
