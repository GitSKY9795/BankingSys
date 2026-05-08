const {Router} = require("express")
const auth = require("../middleware/auth.middleware");
const transactionRoutes = Router();
const transaction = require("../controllers/transaction.controller")

transactionRoutes.post("/",auth.authMiddleware,transaction.createTransaction)
transactionRoutes.post("/system/initial-funds",auth.authSysytemMiddleware,transaction.createInitialFundsTransaction)
module.exports = transactionRoutes;