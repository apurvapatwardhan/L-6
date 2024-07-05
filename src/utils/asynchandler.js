

// const asynHandler = (fn) => {
//     const cb = async (req, res, next) => {
//         try {
//             await fn(req, res, next);
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
//     return cb
// }

const asyncHandler = (routeHandler) => async (req, res, next) => {
 try {
    await routeHandler(req, res, next);
 } catch (error) {
    console.log("ERROR !!!", error);
 }
}

export default asyncHandler;