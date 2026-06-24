import {asyncHandler} from "../utils/asyncHandler.js"

const registerUses = asyncHandler(async (req, res) =>{
    res.status(200).json({
        message:"hello World"
    })
})



export {registerUses}