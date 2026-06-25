import {asyncHandler} from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js";
import { User } from '../models/user.model.js'
import { uploadOnCloud } from '../utils/cloudinary.js';
import { APIResponse } from "../utils/APIResponse.js";

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

    if(!username || !email)
        throw new APIError(400, "userName or Password is required");

    const user = await User.findOne({
        $or:[{username}, {email}]
    })

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


export {
    registerUses,
    loginUser,
    logoutUser
} 