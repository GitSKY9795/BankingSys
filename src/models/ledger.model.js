const mongoose = require("mongoose")
 const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true,"Ledger must be associated with an account"],
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: [true,"Amount is required for creating a ledger"],
        immutable: true,
        index: true
    }, 
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",
            required: [true, "Ledger must be associated with a transaction"],
        },
        type: {
            type: String,
            enum: {
                values: ["CREDIT", "DEBIT"],
                message: "Type can be either CREDIT or DEBIT",
            },
            required: [true, "Type is required for creating a ledger"],
            immutable: true,
        }
 })
 function preventModification(){
    throw new Error("Ledger cannot be modified");
 }
ledgerSchema.pre('findOneAndUpdate',preventModification);
ledgerSchema.pre('updateOne',preventModification);
ledgerSchema.pre('deleteOne',preventModification);
ledgerSchema.pre('remove',preventModification);
ledgerSchema.pre('deleteMany',preventModification);
ledgerSchema.pre('updateMany',preventModification);
ledgerSchema.pre("findOneAndDelete",preventModification);
ledgerSchema.pre("findOneAndReplace",preventModification);
 const ledgerModel = mongoose.model("ledger",ledgerSchema);
 module.exports= ledgerModel;