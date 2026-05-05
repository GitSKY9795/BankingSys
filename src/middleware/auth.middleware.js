const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account.model")

async function authMiddleware(req,res){
const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
if(!token){
    return res.status(401).json({
        message:"Unauthorized or user not logged in"
    })
}
try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET || process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }
   req.user = user;
  return next();
} catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
}
}
