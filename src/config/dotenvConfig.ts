import * as dotenv from "dotenv";
dotenv.config();

// interface for env variable
interface envVars {
    PORT: number;
    NODE_ENV: "development" | "production";
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY: string;
    ORIGIN: string;

    MAIL_EMAIL: string
    MAIL_PASSWORD: string

    CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string

}

//function to get and parse env variable
function getEnvVar(
    key: keyof envVars,
    defaultValue?: string | number,
): string | number {
    const value = process.env[key as string];
    if (!value && defaultValue === undefined) {
        throw new Error(`Environment variable ${key} is missing`);
    }
    return value || defaultValue!;
}

//For NODE_ENV
const NODE_ENV =
    (process.env.NODE_ENV as "development" | "production") || "development";

//create a configuration object that holds the env variables
const env: envVars = {
    PORT: parseInt(getEnvVar("PORT", 8000) as string, 10),
    NODE_ENV,
    ACCESS_TOKEN_SECRET: getEnvVar("ACCESS_TOKEN_SECRET") as string,
    ACCESS_TOKEN_EXPIRY: getEnvVar("ACCESS_TOKEN_EXPIRY") as string,
    REFRESH_TOKEN_SECRET: getEnvVar("REFRESH_TOKEN_SECRET") as string,
    REFRESH_TOKEN_EXPIRY: getEnvVar("REFRESH_TOKEN_EXPIRY") as string,
    DATABASE_URL: getEnvVar("DATABASE_URL") as string,
    ORIGIN: getEnvVar("ORIGIN") as string,
    MAIL_EMAIL: getEnvVar("MAIL_EMAIL") as string,
    MAIL_PASSWORD: getEnvVar("MAIL_PASSWORD") as string,
    CLOUDINARY_CLOUD_NAME: getEnvVar("CLOUDINARY_CLOUD_NAME") as string,
    CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET") as string,
    CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY") as string
};

export default env;
