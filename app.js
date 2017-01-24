var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var crypto = require('crypto'),
    algorithm = 'aes256',
    password = new Buffer('asaadsaad');
var mongo = require('mongoskin');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.get('/message', function(request, response){
  let db = mongo.db('mongodb://localhost:27017/homework6');
  let text;
  var readMongoPromise = function(){
    return new Promise(function (resolve, reject){
          db.collection('myhomework6').findOne(function (err, result){
          if (err){
            reject(err);
          }
          else{
            resolve(result);
          }
        });
      }
    );
  };
  readMongoPromise().then(result=>{
    text = result.message;
    let decryptMsg = decrypt(text);
    response.write(decryptMsg);
    response.end();
  }).catch(err=>{
    console.error(err);
    response.write(err);
    response.end();
    });
  
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function decrypt(text){
  const decipher = crypto.createDecipher(algorithm, password);
  var encrypted = text;
  var decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = app.listen(1000);