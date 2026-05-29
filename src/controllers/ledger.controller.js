const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');

async function getMyLedgerEntries(req, res) {
  try {
    const { accountId, type, from, to, search, limit = 250 } = req.query;
    const userAccounts = await accountModel.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map((account) => account._id);

    if (!accountIds.length) {
      return res.status(200).json({ entries: [] });
    }

    const filters = {
      account: { $in: accountIds },
    };

    if (accountId) {
      filters.account = accountId;
    }

    if (type) {
      filters.type = type.toUpperCase();
    }

    if (from || to) {
      filters.createdAt = {};
      if (from) {
        filters.createdAt.$gte = new Date(from);
      }
      if (to) {
        filters.createdAt.$lte = new Date(to);
      }
    }

    const entries = await ledgerModel
      .find(filters)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 250, 1000))
      .populate('account')
      .populate('transaction');

    const filteredEntries = search
      ? entries.filter((entry) => {
          const value = String(search).toLowerCase();
          return (
            String(entry._id).toLowerCase().includes(value) ||
            String(entry.transaction?._id || entry.transaction).toLowerCase().includes(value) ||
            String(entry.account?._id || entry.account).toLowerCase().includes(value)
          );
        })
      : entries;

    return res.status(200).json({ entries: filteredEntries });
  } catch (error) {
    console.error('getMyLedgerEntries error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getLedgerEntryById(req, res) {
  try {
    const { ledgerId } = req.params;
    const userAccounts = await accountModel.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map((account) => account._id);

    const entry = await ledgerModel
      .findOne({ _id: ledgerId, account: { $in: accountIds } })
      .populate('account')
      .populate('transaction');

    if (!entry) {
      return res.status(404).json({ message: 'Ledger entry not found' });
    }

    return res.status(200).json({ entry });
  } catch (error) {
    console.error('getLedgerEntryById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getMyLedgerEntries, getLedgerEntryById };