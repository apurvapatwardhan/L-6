import asyncHandler from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
    console.log("Hi")
    return res.status(200).json({
        message: "OK"
    });
});
