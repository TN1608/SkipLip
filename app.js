var createError = require('http-errors');
var express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();

// Load Swagger document
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));

// Kiểm tra biến môi trường
const requiredEnvVars = [
    'GEMINI_API_KEY',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Error: Missing environment variable ${varName}`);
        process.exit(1);
    }
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', authRouter);

// Route trang chính
app.get('/main', (req, res) => {
    res.send('Welcome to the main page of Skipli AI!');
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404, 'Not Found'));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (req.path.startsWith('/api')) {
        res.status(err.status || 500).json({
            message: err.message,
            error: req.app.get('env') === 'development' ? err : {}
        });
    } else {
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;