export function generate_otp(digit: number): number {
    if (digit <= 3) {
        throw new Error("please enter large number")
    }

    const min = Math.pow(10, digit) - 1
    const max = Math.pow(10, digit - 1)


    return Math.floor(Math.random() * (max - min + 1)) + min
} 
