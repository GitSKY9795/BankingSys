const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Account must be associated with a user"],
        index: true,
    },
    status:{
        type:String,
        enum:{
            values: ["ACTIVE","FROZEN","CLOSED"],
            message: "Staus can be either ACTIVE ,FROZEN , CLOSED"
        },
        default : "ACTIVE",
    },
    currency:{
        type:String,
        require:[true,"Currency is required for creating an account"],
        default: "INR"
    },
}, {
    timestamps: true
});
accountSchema.index({user: 1,status: 1}) //compound index
 const accountModel = mongoose.model("account",accountSchema);
 module.exports = accountModel;