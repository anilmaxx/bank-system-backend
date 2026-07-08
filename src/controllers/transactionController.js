const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.deposit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { accountId, amount } = req.body;

         if (!mongoose.Types.ObjectId.isValid(accountId)) {
          return res.status(400).json({ msg: 'Invalid Account ID format' });
        }

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

         if (!mongoose.Types.ObjectId.isValid(accountId)) {
          return res.status(400).json({ msg: 'Invalid Account ID format' });
        }

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

exports.transfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fromAccountId, toAccountId, amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fromAccountId)) {
          return res.status(400).json({ msg: 'Invalid Source Account ID format' });
        }

        if (!mongoose.Types.ObjectId.isValid(toAccountId)) {
          return res.status(400).json({ msg: 'Invalid Destination Account ID format' });
        }

        if (amount <= 0) return res.status(400).json({ msg: 'Amount must be greater than 0' });
        if (fromAccountId === toAccountId) return res.status(400).json({ msg: 'Cannot transfer to the same account' });

        const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user.id }).session(session);
        if (!fromAccount) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Source account not found or unauthorized' });
        }

        if (fromAccount.status !== 'active') {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Source account is blocked and cannot perform transactions' });
        }

        const toAccount = await Account.findOne({ _id: toAccountId }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Destination account not found' });  
        }

        if (toAccount.status !== 'active') {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Destination account is blocked and cannot receive transfers' });
        }

        if (fromAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Insufficient balance for transfer' });
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save({ session });
        await toAccount.save({ session });

        const transaction = new Transaction({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            type: 'transfer'
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Transfer successful', balance: fromAccount.balance, transaction });
  } catch (err) {
        await session.abortTransaction();
        console.error('Error occurred while processing transfer:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        await session.endSession();
    }
}