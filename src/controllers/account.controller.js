const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
async function createAccount(req,res){
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  return res.status(201).json({
 account
  })
}

async function getMyAccounts(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  const accountsWithBalance = await Promise.all(
    accounts.map(async (account) => {
      const balance = await account.getBalance();
      return {
        ...account.toObject(),
        balance,
      };
    })
  );

  return res.status(200).json({
    accounts: accountsWithBalance,
  });
}
async function getAccountBalanceController(req,res){
  const accountId = req.params.account_id;
  const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
  if(!account){
    return res.status(404).json({
      message: "Account not found"
    })

  }
  const balance = await account.getBalance();
  return res.status(200).json({
    balance
  })

}

async function getAccountDetailsController(req, res) {
  const accountId = req.params.account_id;
  const account = await accountModel.findOne({ _id: accountId, user: req.user._id });

  if (!account) {
    return res.status(404).json({
      message: 'Account not found',
    });
  }

  const balance = await account.getBalance();
  const recentLedgerEntries = await ledgerModel
    .find({ account: account._id })
    .sort({ createdAt: -1 })
    .limit(25)
    .populate('transaction');

  return res.status(200).json({
    account: {
      ...account.toObject(),
      balance,
    },
    recentLedgerEntries,
  });
}



async function getAllAccounts(req, res) {
  try {
    const accounts = await accountModel.find().populate('user', 'name email');
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await account.getBalance();
        return {
          ...account.toObject(),
          balance,
        };
      })
    );

    return res.status(200).json({ accounts: accountsWithBalance });
  } catch (err) {
    console.error('getAllAccounts error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getOtherAccounts(req, res) {
  try {
    const userId = req.user._id;
    const accounts = await accountModel
      .find({ user: { $ne: userId }, status: 'ACTIVE' })
      .populate('user', 'name email');

    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await account.getBalance();
        return {
          ...account.toObject(),
          balance,
        };
      })
    );

    return res.status(200).json({ accounts: accountsWithBalance });
  } catch (err) {
    console.error('getOtherAccounts error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { createAccount, getMyAccounts, getAccountBalanceController, getAccountDetailsController, getAllAccounts, getOtherAccounts };
