import { Request, Response } from "express"
import { User } from "../../models/user.Model"
import { asyncHandler } from "../../utils/asyncHandler"

const changed_password = asyncHandler(async (req: Request, res: Response) => {
    try {

        const { email, oldPassword, newPassword } = req.body

        //validate
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                message: "All fiends are required"
            })
        }

        //Find the email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Email not found" })
        }

        //verify old passoword
        const isOldPassowrdValid = await user.isPasswordCorrect(oldPassword)
        if (!isOldPassowrdValid) {
            return res.status(400).json({
                message: "Old password is incorrect"
            })
        }

        //save the new password
        user.password = newPassword
        await user.save()

        return res.status(200).json({ message: "Password changed successfully" })

    } catch (error) {
        console.error("Error changing password: ", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export { changed_password }
