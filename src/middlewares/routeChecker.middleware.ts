import { Request, Response, NextFunction } from "express";

// Route checker middleware
// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
    console.error(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: "Route not found!" });
};
// Error handling middleware (used after routes)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        console.error(`Error: ${err.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        next(err);
    }
};

