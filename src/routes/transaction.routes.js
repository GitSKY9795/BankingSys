const {Router} = require("express")
const auth = require("../middleware/auth.middleware");
const transactionRoutes = Router();
const transaction = require("../controllers/transaction.controller")

transactionRoutes.post("/",auth.authMiddleware,transaction.createTransaction)
transactionRoutes.post("/system/initial-funds",auth.authSysytemMiddleware,transaction.createInitialFundsTransaction)
transactionRoutes.post("/:transactionId/reverse", auth.authSysytemMiddleware, transaction.reverseTransaction)
transactionRoutes.get("/me", auth.authMiddleware, transaction.getMyTransactions)
transactionRoutes.get("/:transactionId", auth.authMiddleware, transaction.getTransactionById)
module.exports = transactionRoutes;