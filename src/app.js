const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
//header security
app.use(helmet());

//Rate limit
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100}));


//connect to mongodb
mongoose.connect( process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
    res.send('API is running...');
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});