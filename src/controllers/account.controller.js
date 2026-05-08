const accountModel = require("../models/account.model");
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

module.exports = { createAccount, getMyAccounts , getAccountBalanceController };
