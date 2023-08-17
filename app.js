const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const registerRouter = require('./routes/register');

const app = express();

app.use(bodyParser.json());
app.use(session({
    secret: 'khiu6dEHGIHIUz)U2h7zt7tv$a4dt5e5tzh',
    resave: false,
    saveUninitialized: true
}));

app.use('/register', registerRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server running on port 3000: http://localhost:3000');
});