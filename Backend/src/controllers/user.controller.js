import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,error || "Something went wrong while generating access and refresh token!!")
    }
}

const registerUser = AsyncHandler(async(req,res)=>{
    const {fullName,email,username,password,role,phoneNumber} = req.body;
    if([fullName,email,username,password,role,phoneNumber].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required!!");
    }

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same username or email already exists!!");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        role,
        phoneNumber: phoneNumber?.trim()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User!!")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully!")
    )
})

const loginUser = AsyncHandler(async(req,res)=>{
    const [email,username,password] = req.body
    if(!username && !email){
        throw new ApiError(400,"Username or email is Required")
    }


    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found!!")
    }


    const isPasswordValid = await isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password!")
    }


    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200).cookie("accesstoken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user: loggedInUser,accessToken,refreshToken
        },"User Logged In Successfully")
    )
})

const logoutuser = AsyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{refreshToken:1}
        }
    )
    const options ={
        httpOnly:true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out!"))
})

