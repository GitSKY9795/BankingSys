const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();


router.post('/register',authController.registerUser);
router.post('/login',authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/me', authMiddleware.authMiddleware, authController.getCurrentUser);
router.post('/logout',authController.userLogoutController)
module.exports = router;




