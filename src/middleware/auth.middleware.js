const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account.model")

async function authMiddleware(req,res,next){
const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
if(!token){
    return res.status(401).json({
        message:"Unauthorized or user not logged in . Please login to continue"
    })
}
try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET || process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }
   req.user = user; //keeping the user information that wethre he is logged in or not and to pass it to the other functions for their working
  return next();
} catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
}
}
module.exports = {authMiddleware};