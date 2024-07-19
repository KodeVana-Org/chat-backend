import mongoose from "mongoose";
import env from "./dotenvConfig";

async function connectToDatabase(): Promise<void> {
  try {
    if (!env.DATABASE_URL) {
      throw new Error("DB_URI environment variable is not defined");
    }

    await mongoose.connect(env.DATABASE_URL);
    console.log(`DB Connected to ${env.DATABASE_URL}`);
  } catch (error: any) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1);
  }
}

export { connectToDatabase };
