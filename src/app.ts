import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import env from "./config/dotenvConfig";
import { createServer } from "http";
import { Server } from "socket.io";
import authRouter from "./routes/auth.Routes";
import userRouter from "./routes/user.Routes";
import friendRouter from "./routes/friend.Routes";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import { ApiError } from "./utils/ApiError";
import { handleUserStatus } from "./socket/userStatusHandler";
import { errorHandler, notFoundHandler } from "./middlewares/routeChecker.middleware";

const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// inject ip-address to middleware
app.use(requestIp.mw());

//Rate limiter for request

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Limit each IP to 5000 requests per windowMs
    skipSuccessfulRequests: true, // Skip counting successful (status < 400) requests towards rate limiting
    keyGenerator: async (req: Request) => {
        // Using client IP as the rate limit key
        const clientIp = (req.clientIp as string) || undefined;
        if (!clientIp) {
            throw new ApiError(500, "Unable to determine client IP ");
        }
        return clientIp;
    },
    handler: (req, res, next, options) => {
        throw new ApiError(
            options.statusCode || 429, // 429 for Too Many Requests
            `Too many requests. You are only allowed ${options.max} requests per ${options.windowMs / 60000} minutes.`,
        );
    },
});

app.use(limiter);
//app.use(routeChecker)
// if * in the origin then allow all site
// if , serated mean there is mutltiple site then alow this specific site only and make the credentials true
app.use(
    cors({
        origin: env.ORIGIN === "*" ? "*" : env.ORIGIN?.split(","),
        credentials: true,
    }),
);

//for testing
app.get("/", (req, res) => {
    res.send("working..");
});

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: env.ORIGIN,
        credentials: true,
    },
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/friend", friendRouter);

// 404 handler for invalid routes
app.use(notFoundHandler)

// Error handling middleware (place it after all routes)
app.use(errorHandler)

handleUserStatus(io)

export { httpServer, io };
