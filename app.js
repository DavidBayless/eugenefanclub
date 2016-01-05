var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var Knex = require('knex');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var knexOptions = {
  client: 'pg', //tell knex to use postgres driver module pg
  connection: {
    host: '127.0.0.1', //connect to local db
    port: 5432, //on the default postgres port
    user: 'davidbayless', //put your username here
    debug: false, //when facing issues can be nice to set to true
    database: 'eugenefanclub' //name of database
  }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var connection = Knex(knexOptions);

function User() {
  return connection('users');
}

function registerUser(user, callback) {
  if (callback) {
    console.log('I run once!');
    callback(user, registerUser);
  } else {
    User().insert({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      password: user.password
    })
    .then(function(res) {
      console.log('Successfully inserted');
    });
  }
}

function loginUser(user, callback){
  User().where('username', user.username)
  .then(function(res) {
    console.log(res);
    comparePassword('notverysecure', res, success);
  });
}

function success(res, user) {
  if (res) {
    console.log('Valid Password');
  } else {
    console.log(user.username + ' and password do not match');
  }
}

var testUser = {
  username: 'xoEugenexoxo',
  firstname: 'Logan',
  lastname: 'King',
  phone: '1234567890',
  email: 'number1eugenefanboy@hotmail.com',
  password: 'notverysecure'
};

function hashPassword(user, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash){
      user.password = hash;
      callback(user);
    });
  });
}

function comparePassword(password, user, callback) {
  bcrypt.compare(password, user[0].password, function(err, res){
    callback(res, user[0]);
  });
}

loginUser(testUser);

module.exports = app;
