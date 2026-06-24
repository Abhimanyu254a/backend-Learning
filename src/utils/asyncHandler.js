const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((e) => next(e))
    }
}


export {asyncHandler};

// const asyncHandler = (fn) => async (req, res,next) =>{
//     try{
//         await fn(req,res,nex)
//     }catch(e)
//     {
//         res.status(err.code || 500).json({
//             success:false,
//             messages:e.messages
//         })
//     }
// }