const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })

        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    let transaction;
    try {


        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        await ledgerModel.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        transaction = await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session, new: true }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        console.error('createTransaction error:', error);
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }
    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        fromAccount,
        toAccount,
        transaction._id
    )

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    if (!mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({
            message: "Invalid toAccount: please provide a valid account _id"
        })
    }

    let toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        toUserAccount = await accountModel.findOne({
            user: toAccount,
        })
    }

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount: account not found. Send an account _id, or send a user _id that already has an account."
        })
    }

    if (toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "toAccount must be ACTIVE to receive initial funds"
        })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        return res.status(200).json({
            message: "Initial funds transaction already processed",
            transaction: isTransactionAlreadyExists
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found. Create an account for the logged-in system user first."
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        await ledgerModel.create([ {
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await ledgerModel.create([ {
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        })
    } catch (error) {
        await session.abortTransaction()

        return res.status(400).json({
            message: "Initial funds transaction failed",
            error: error.message
        })
    } finally {
        session.endSession()
    }


}

async function getMyTransactions(req, res) {
    try {
        const { accountId, type, from, to, limit = 200 } = req.query;
        const userAccounts = await accountModel.find({ user: req.user._id }).select('_id');
        const accountIds = userAccounts.map((account) => account._id);

        if (!accountIds.length) {
            return res.status(200).json({ transactions: [] });
        }

        const filters = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } },
            ],
        };

        if (accountId) {
            const selectedAccountId = new mongoose.Types.ObjectId(accountId);
            if (type === 'sent') {
                filters.$and = [{ fromAccount: selectedAccountId }];
            } else if (type === 'received') {
                filters.$and = [{ toAccount: selectedAccountId }];
            } else {
                filters.$and = [
                    {
                        $or: [
                            { fromAccount: selectedAccountId },
                            { toAccount: selectedAccountId },
                        ],
                    },
                ];
            }
            delete filters.$or;
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

        const transactions = await transactionModel
            .find(filters)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 200, 500))
            .populate('fromAccount')
            .populate('toAccount');

        return res.status(200).json({ transactions });
    } catch (error) {
        console.error('getMyTransactions error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getTransactionById(req, res) {
    try {
        const { transactionId } = req.params;
        const userAccounts = await accountModel.find({ user: req.user._id }).select('_id');
        const accountIds = userAccounts.map((account) => account._id);

        const transaction = await transactionModel
            .findOne({
                _id: transactionId,
                $or: [
                    { fromAccount: { $in: accountIds } },
                    { toAccount: { $in: accountIds } },
                ],
            })
            .populate('fromAccount')
            .populate('toAccount');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const ledgerEntries = await ledgerModel.find({ transaction: transaction._id }).populate('account');

        return res.status(200).json({ transaction, ledgerEntries });
    } catch (error) {
        console.error('getTransactionById error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function reverseTransaction(req, res) {
    try {
        const { transactionId } = req.params;

        const original = await transactionModel.findById(transactionId);
        if (!original) return res.status(404).json({ message: 'Transaction not found' });

        if (original.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Only completed transactions can be reversed' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // create reversal ledger entries
            await ledgerModel.create([
                {
                    account: original.toAccount,
                    amount: original.amount,
                    transaction: original._id,
                    type: 'DEBIT',
                },
                {
                    account: original.fromAccount,
                    amount: original.amount,
                    transaction: original._id,
                    type: 'CREDIT',
                },
            ], { session });

            original.status = 'REVERSED';
            await original.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: 'Transaction reversed', transaction: original });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error('reverseTransaction error:', err);
            return res.status(500).json({ message: 'Failed to reverse transaction' });
        }
    } catch (err) {
        console.error('reverseTransaction outer error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getMyTransactions,
    getTransactionById,
    reverseTransaction
}
