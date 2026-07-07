const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.deposit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { accountId, amount } = req.body;

        if (amount <= 0) return res.status(400).json({ msg: 'Amount must be greater than 0' });

        const account = await Account.findOne({ _id: accountId, user: req.user.id }).session(session);
        if (!account) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Account not found or unauthorized' });
        }

        if (account.status !== 'active') {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Account is blocked and cannot perform transactions' });
         }

        account.balance += amount;
        await account.save({ session });

        const transaction = new Transaction({
            toAccount: account._id,
            amount,
            type: 'deposit'
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Deposit successful', balance: account.balance, transaction });
    } catch (err) {
        await session.abortTransaction();
        console.error('Error occurred while processing deposit:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        await session.endSession();
    }
}

exports.withdraw = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { accountId, amount } = req.body;

        if (amount <= 0) return res.status(400).json({ msg: 'Amount must be greater than 0' });

        const account = await Account.findOne({ _id: accountId, user: req.user.id }).session(session);
        if (!account) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Account not found or unauthorized' });
        }

        if (account.status !== 'active') {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Account is blocked and cannot perform transactions' });
         }

        account.balance -= amount;
        await account.save({ session });

        const transaction = new Transaction({
            toAccount: account._id,
            amount,
            type: 'withdraw'
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Withdrawal successful', balance: account.balance, transaction });
    } catch (err) {
        await session.abortTransaction();
        console.error('Error occurred while processing withdrawal:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        await session.endSession();
    }
}