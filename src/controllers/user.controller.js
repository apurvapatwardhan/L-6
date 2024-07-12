import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
//import { use } from "express/lib/application.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Something went wrong");
  }
};

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
  const existedUser = await User.findOne({
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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //remove password and refresh token from response

  //check for user createion
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }
  //return res
  console.log("coming");
  return res
    .status(201)
    .json(new ApiResponse(createdUser, 201, "User created succesfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  //get username and password from frontend
  const { username, password, email } = req.body;
  //validate username and password input
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  //check in database, whether the user exists
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  //check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "username or password incorrect");
  }

  //create a jwt access token
  //create a refresh token from it
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedinUser = await User.findOne({ _id: user._id }).select(
    "-password -refreshToken"
  );

  //send tokens in cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse({
        user: loggedinUser,
        refreshToken, accessToken
    }, 200, "logged in Successfully"));
});


export const logoutUser = asyncHandler(async(req, res) => {
    const user = req.user;
    await User.findByIdAndUpdate({_id: user._id}, {
        $set: {
            'refreshToken': undefined
        }
    })

    const options = {
        httpOnly: true,
        secure: true,
      };

    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).json(new ApiResponse({}, 200, "User logged out"))
} )