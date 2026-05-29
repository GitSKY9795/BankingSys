const express = require('express');
const authRouter = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const accountRouter = require('./routes/account.routes');
const app = express();
const transactionRouter = require('./routes/transaction.routes');
const ledgerRouter = require('./routes/ledger.routes');
app.disable('x-powered-by');
app.use(express.json({ type: ['application/json', 'application/*+json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/account',accountRouter);
app.use('/api/transaction',transactionRouter)
app.use('/api/ledger', ledgerRouter)
 // Root health check for Render and general availability
 app.get('/', (req, res) => {
	 res.send("the api's are healthy and are working fine");
 });
module.exports = app;