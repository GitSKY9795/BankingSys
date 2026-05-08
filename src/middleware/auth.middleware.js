const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account.model")
const tokenBlacklist = require("../models/tokenBlacklist.model")
function isSystemUserEmail(email) {
    const systemUserEmails = (process.env.SYSTEM_USER_EMAILS || process.env.SYSTEM_USER_EMAIL || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    return systemUserEmails.includes(email?.toLowerCase());
}

async function authMiddleware(req,res,next){
const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
if(!token){
    return res.status(401).json({
        message:"Unauthorized or user not logged in . Please login to continue"
    })
}
const isTokenBlacklisted = await tokenBlacklist.findOne({token}); 
if(isTokenBlacklisted){
    return res.staus(401).json({
        message:"Token is blacklisted"
    })
}  
try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET || process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(401).json({
            message: "Token user not found. Please login again with an existing user.",
            userId: decoded.id,
        });
    }
   req.user = user; //keeping the user information that wethre he is logged in or not and to pass it to the other functions for their working
  return next();
} catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
}
}
async function authSysytemMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
            return res.status(401).json({
            message: "Unauthorized access , token is missing"
            })
    }
    const isTokenBlacklisted = await tokenBlacklist.findOne({ token });
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "Token is blacklisted",
        });
    }
    try{
       const decoded = jwt.verify(token,process.env.JWT_SECRET || process.env.JWT_SECRET_KEY)
       const user = await userModel.findById(decoded.id).select("-password").select("+systemUser");
                 if (!user) {
                    return res.status(401).json({
                        message: "Token user not found. Please login again with an existing system user.",
                        userId: decoded.id,
                    });
                 }
                 if (!user.systemUser && isSystemUserEmail(user.email)) {
                    user.systemUser = true;
                    await user.save();
                 }
                 if (!user.systemUser) {
                    return res.status(403).json({
                        message: "Forbidden access: not an admin user",
                        email: user.email,
                    });
         }
         req.user = user;
         return next();
     } catch (err) {
         console.error("Token verification error:", err);
         return res.status(401).json({ message: "Invalid or expired token" });
    }
}
module.exports = {authMiddleware,authSysytemMiddleware};
