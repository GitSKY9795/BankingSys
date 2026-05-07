const express = require('express');
const authRouter = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const accountRouter = require('./routes/account.routes');
const app = express();

app.use(express.json({ type: ['application/json', 'application/*+json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/account',accountRouter);

module.exports = app;