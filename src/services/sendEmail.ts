import nodemailer from "nodemailer"
import env from "../config/dotenvConfig";
import { sendOTP } from "../template/verify.OTP.Template"

const transporter = nodemailer.createTransport({
    //host: "smtp.ethereal.email",
    //port: 587,
    service: "Gmail",
    //secure: false, // true for port 465, false for other ports
    auth: {
        //user: "maddison53@ethereal.email", // Ethereal email user
        //pass: "jn7jnAPss4f63QBp6D", // Ethereal email password
        user: env.MAIL_EMAIL,
        pass: env.MAIL_PASSWORD

    },
});


export async function sendOtp(email: string, otp: number): Promise<void> {
    try {
        const info = await transporter.sendMail({
            from: " my email ",
            to: email,
            subject: "otp",
            text: `you top is ${otp}`,
            //html: `<p>Your OTP is: <strong>${otp}</strong></p>`
            html: sendOTP(email, otp)


        })
        //console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error while second email", error)
        throw error;

    }
}
