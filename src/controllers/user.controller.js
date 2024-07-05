import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  //get user detail from frontend
  const { username, fullName, email, password } = req.body;
  console.log(username, fullName, email, password);
  //validation of user details
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //check if user already exits: username, email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User Already exists");
  }
  //check if avatar present, check for avatar
  const avatartLocalPath = req?.files.avatar[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage[0]?.path;

  if (!avatartLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  //upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatartLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  //create user object- create entry in db
  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');
  //remove password and refresh token from response

  //check for user createion
  if(createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }
  //return res
  return res.status(201).json(new ApiResponse(createdUser, 201, "User created succesfully"));
});
