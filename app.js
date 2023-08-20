const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const https = require('https');
const fs = require('fs');

const registerRouter = require('./src/routes/register');
const loginRouter = require('./src/routes/login');
const logoutRouter = require('./src/routes/logout');
const {ensureAuthenticated} = require("./src/auth/middleware");

const app = express();
const port = 443;
const hostname = 'desktop-iet34cq.local';

const options = {
    key: fs.readFileSync('./config/key.pem'),
    cert: fs.readFileSync('./config/certificate.pem')
};

// Register middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'khiu6dEHGIHIUz)U2h7zt7tv$a4dt5e5tzh',
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'lax'
    }
}));
app.use(ensureAuthenticated);

// Register routes
app.use('/rest/register', registerRouter);
app.use('/rest/login', loginRouter);
app.use('/logout', logoutRouter);
app.use(express.static(path.join(__dirname, 'public')));

const server = https.createServer(options, app)

server.listen(port, () => {
    console.log(`Server running on port ${port}: https://${hostname}`);
});