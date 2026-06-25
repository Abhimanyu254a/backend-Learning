import {asyncHandler} from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js";
import { User } from '../models/user.model.js'
import { uploadOnCloud } from '../utils/cloudinary.js';
import { APIResponse } from "../utils/APIResponse.js";

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



export {registerUses}