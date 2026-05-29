const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const ledgerController = require('../controllers/ledger.controller');

const router = express.Router();

router.get('/me', authMiddleware.authMiddleware, ledgerController.getMyLedgerEntries);
router.get('/:ledgerId', authMiddleware.authMiddleware, ledgerController.getLedgerEntryById);

module.exports = router;