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
    googleId: string
    username: string;
    email: string;
    avatar: userAvatar;
    bio: string;
    role: UserRoles;
    password: string;
    otp: number
    sentFriendReq: mongoose.Types.ObjectId[];
    incommingFriendReq: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[]
    refreshToken?: string;
    forgotPasswordToken?: string;
    forgotPasswordExpiry: Date;
    status: "online" | "offline";
    lastSeen?: Date;

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
    googleId: {
        type: String,
        default: null
    },
    avatar: {
        type: {
            url: String,
        },
        default: {
            url: `https://via.placeholder.com/200x200.png`,
        },
    },
    bio: {
        type: String,
        default: "Hi, i am using Tawk!"
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
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline"
    },
    lastSeen: {
        type: Date, default: Date.now
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
    friends: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
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
