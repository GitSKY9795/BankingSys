const express = require('express');
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * -POST /api/accounts/
 */
router.post('/', authMiddleware.authMiddleware, accountController.createAccount);
router.get('/all', authMiddleware.authSysytemMiddleware, accountController.getAllAccounts);
router.get('/me', authMiddleware.authMiddleware, accountController.getMyAccounts);
router.get('/others', authMiddleware.authMiddleware, accountController.getOtherAccounts);
router.get('/:account_id', authMiddleware.authMiddleware, accountController.getAccountDetailsController);
router.get('/balance/:account_id',authMiddleware.authMiddleware,accountController.getAccountBalanceController)


module.exports = router;
