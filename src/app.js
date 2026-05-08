const express = require('express');
const authRouter = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const accountRouter = require('./routes/account.routes');
const app = express();
const transactionRouter = require('./routes/transaction.routes');
app.use(express.json({ type: ['application/json', 'application/*+json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/account',accountRouter);
app.use('/api/transaction',transactionRouter)
module.exports = app;