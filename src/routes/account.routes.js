const express = require('express');
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * -POST /api/accounts/
 */
router.post('/', authMiddleware.authMiddleware, accountController.createAccount);



module.exports = router;