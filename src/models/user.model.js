const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { type } = require('node:os');
const { isModuleNamespaceObject } = require('node:util/types');
const userSchema = new mongoose.Schema({
    email:{
        type:String,required:[true,"Email is required for creating a user"],
        trim:true,lowercase:true,unique:[true,"Email already exists"],match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please provide a valid email address"]
    },
    name:{
        type:String , required:[true,"Name is required for creating a user"],
        trim:true,lowercase:true
    },
    password:{
        type:String , required:[true,"Password is required for creating a user"],
        minlength:[6,"Password should contain more than 6 characters"],
        select: false
    },
    emailVerificationOtp:{
        type:String,
        select:false
    },
    emailVerificationOtpExpires:{
        type:Date,
        select:false
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        select:false
    },
   
}, {
        timestamps:true
})
userSchema.pre("save", async function() {  // checks for any password update and hashes before save
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);

});
userSchema.methods.comparePassword = async function(password){ //use to comapre the passeod dprovided by the user and earl;ier stored passwprd          
    return await bcrypt.compare(password,this.password);
}
const userModel  = mongoose.model("User",userSchema);
module.exports = userModel;