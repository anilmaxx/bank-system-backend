const Account = require('../models/Account');

//generate unique account number
const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
exports.createAccount = async (req, res) => {
    try {
        const { accountType } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        //check if user already has an account of the same type
        const existingAccount = await Account.findOne({ user: userId, accountType });
        if (existingAccount) {
            return res.status(400).json({ message: 'You already have an account of this type' });

        }
        const newAccount = new Account({
            user: userId,
            accountNumber: generateAccountNumber(),
            accountType
        });
        await newAccount.save();
        res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating account', error });
    }
}

exports.getMyAccounts = async (req, res) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const accounts = await Account.find({ user: userId }).populate('user', ['name', 'email']);
        if (!accounts || accounts.length === 0) {
            return res.status(404).json({ msg: 'No accounts found for this user' });
        }
        res.json(accounts);

    } catch (error) {
        console.error(err.message);
       res.status(500).send('Server Error');
    }
}

exports.getAccountById = async (req, res) => {
    try{
        const account = await Account.findById(req.params.id).populate('user', ['name', 'email']);
        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }
        res.json(account);
    } catch (error) {
        console.error(err.message);
        
  }
    
}

exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().populate('user', ['name', 'email']);
        res.json(accounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
  }
}

exports.updateAccountStatus = async (req, res) => {
    try{
        const { status } = req.body;
        if(!['active', 'blocked'].includes(status)){
            return res.status(400).json({ msg: 'Invalid status value' });
        }
        const account = await Account.findById(req.params.id);
        if (!account) {
           return res.status(404).json({ msg: 'Account not found' });
        }
        account.status = status;
        await account.save();
        res.json({ msg: `Account status updated to ${status}`, account });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}
