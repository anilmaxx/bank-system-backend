const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const transactionController = require('../controllers/transactionController');

//POST /api/transactions/deposit = (user)
router.post('/deposit', auth, transactionController.deposit);

//POST /api/transactions/withdraw = (user)
router.post('/withdraw', auth, transactionController.withdraw);

//POST /api/transactions/transfer = (user)
router.post('/transfer', auth, transactionController.transfer);
module.exports = router;