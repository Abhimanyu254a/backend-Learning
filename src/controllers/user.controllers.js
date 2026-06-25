import {asyncHandler} from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js";
import { User } from '../models/user.model.js'
import { uploadOnCloud } from '../utils/cloudinary.js';
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
    
        return {accessToken, refreshToken};
    }
    catch(e)
    {
        throw new APIError(500, "Something went wrong");
    }
}

const registerUses = asyncHandler(async (req, res) =>{
    // S1 get user details from forntend
    // S2 validation of the input
    // check if user already exists : username, email
    //check for images, check for avatar
    //upload them to cloud
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname, email, username, password} = req.body;
    console.log("email :", email);

    if( 
        //advance code
        [fullname, email, username, password].some((field) => field?.trim() === "")
    )
    {
        throw new APIError(400, "All fields are requireds");
    }

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    
    if(existedUser)
    {
        throw new APIError(409, "User with email or userName already exists")
    }

    const avataLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

    if(!avataLocalPath){
        throw new APIError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloud(avataLocalPath);
    const coverImage = await uploadOnCloud(coverImageLocalpath);

    if (!avatar) {
        throw new APIError(500, "Avatar upload to Cloudinary failed");
    }


    const user = await User.create({
        fullname:fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email:email,
        password:password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser)
    {
        throw new APIError(500, "Something went wrong whiele registing")
    }

    return res.status(201).json(
        new APIResponse(200,createdUser,"User Register Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and referesh token
    // send cookie

    const {email, username, password} = req.body;

    if(!username && !email)
        throw new APIError(400, "userName or Password is required");

    const user = await User.findOne({
        $or:[{username}, {email}]
    })
    
    console.log("The use is coming ------>", user);
    

    if(!user)
        throw new APIError(404, "user doesn't exists");

    const ispasswordVaild = await user.isPasswordCorrect(password);

    if(!ispasswordVaild)
        throw new APIError(401, "Please fill up the password");

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new APIResponse(
            200,
            {
                user:loggedInUser, accessToken,
                refreshToken
            },
            "user logged In Successfully"
        )
    )



})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly:true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options )
    .json(new APIResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new APIError(401, "unauthorized request")
    }
    try {
        
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            ) 
        
            User.findById(decodedToken?._id)
        
            if(!user)
                throw new APIError(401, "Invalid refresh Token")
        
            if(incomingRefreshToken !== user?.refreshToken)
                throw new APIError(401, "Refresh Token is Expired or used")
        
            const options = {
                httpOnly:true,
                secure:true,
            }
            const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);
            
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access Token Refreshed",
                ));
    } catch (e) {
        throw new APIError(401, e?.message|| "Invalid Token");
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) =>{
    const {oldPassword, newPassword} = req.body;


    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect)
        throw new APIError(400, "invalid password");

    user.password = newPassword;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new APIResponse(200, {}, "password Changed")) 
    
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched succesfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email)
    {
        throw new APIError(400, "ALL field are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email,
            }
        },
        {new:true}
    ).select('-password')


    return res
    .status(200)
    .json(
        new APIResponse(201, "It is updated")
    );
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avataLocalPath = req.file?.path

    if(!avataLocalPath)
        throw new APIError(400, "Avatar file is missing")

    const avatar = await uploadOnCloud(avataLocalPath);

    if(!avatar.url)
        throw new APIError(400, "error while uploading on avatar");

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select('-password')
})


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalpath = req.file?.path

    if(!coverImageLocalpath)
        throw new APIError(400, "coverImage file is missing")

    const coverImage = await uploadOnCloud(coverImageLocalpath);

    if(!coverImage.url)
        throw new APIError(400, "error while uploading on coverImage");

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select('-password')


    return res
    .status(200)
    .json(
        new APIResponse(201, "The Cover Image is successfully Update")
    );
})

export {
    registerUses,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
} 