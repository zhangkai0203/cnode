var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
//ejs模板插件
var engine = require('ejs-mate');
//转换html插件
var MarkdownIt = require('markdown-it');
var md = new MarkdownIt();
//上传插件
var busboy = require('connect-busboy');

var routes = require('./routes/index');
var topic = require('./routes/topic');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));

//session
app.use(session({
  secret: '12345',
  name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {maxAge: 8000000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  resave: false,
  saveUninitialized: true,
}))

app.use(function(req, res, next){
   app.locals.user = req.session.user;
   next();
});

//上传插件
app.use(busboy());

app.locals.title = '仿cnode';
app.locals.md = md;

app.use('/', routes);
app.use('/topic', topic);

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


module.exports = app;
