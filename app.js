require( './db' );




var express = require('express');
var app = express();
//var server = require('http').createServer(app);
//var io = require('socket.io').listen(server);
var routes  = require( './routes' );
var http    = require( 'http' );
var path    = require( 'path' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'UserSchema' );
var  hash = require('./pass').hash;
var ejs = require('ejs');
//server.listen(3001);
app.set( 'port',3001 );
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');// app.set('view engine', 'ejs');
app.use( express.favicon());
app.use( express.logger( 'dev' ));
app.use( express.cookieParser());
app.use( express.bodyParser());
app.use( express.json());
app.use( express.urlencoded());
app.use( express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({secret: "This is a secret"}));
//app.use("/", express.static(__dirname + '/views'));
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
app.use( app.router );
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
        username: name
    },

    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });

}

function requiredAuthentication(req, res, next) {
	console.log(req.session.user);
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}
function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/");
        }
    });
}

function authentication(req, res, next) {
	console.log(req.session.user);
  if (!req.session.user) {
    req.session.error='請先登入';
    return res.redirect('/');
  }
  next();
}
app.get('/', routes.login);
app.get('/state/:state',routes.login);
app.get('/mapchat',authentication);
app.get('/mapchat', routes.mapchat);

app.get("/signup", function (req, res) {
		res.render('signup');
});
app.post("/signup", userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;
	var role = req.body.role;
    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            salt: salt,
            hash: hash,
            role:role
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                       // req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
                }
            });
        });
    });
});


app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
        	console.log(user);
            req.session.regenerate(function () {

                req.session.user = user;
               // req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/mapchat');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            console.log(req.session.error);
            res.redirect('/');
        }
    });
});

app.get('/logout', function (req, res) {
	console.log(req.session.user.username);
    req.session.destroy(function () {

        res.redirect('/');
    });
});


app.post( '/create',routes.create );
app.get( '/RoutePointcreate',routes.RoutePointcreate );
app.get( '/logout',routes.logout );
app.get('/getALLRoute',routes.getALLRoute);
app.get('/getRoutePoint',routes.getRoutePoint);
app.get('/deleteRoute/:id',routes.deleteRoute);
app.get('/getScene',routes.SceneJson);

var server = http.createServer( app ).listen( app.get( 'port' ), function (){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('msg', function (data) {
  	console.log(data);
    io.sockets.emit('new', data);
  });
  socket.on('latlng', function (data) {
  	console.log(data);
    io.sockets.emit('Latlngnew', data);
  });
   socket.on('zoom', function (data) {
  	console.log(data);
    io.sockets.emit('zooming', data);
  });
     socket.on('plan', function (data) {
  	console.log(data);
    io.sockets.emit('routeAdd', data);
  });
      socket.on('updateRoute', function (data) {
  	console.log(data);
    io.sockets.emit('updateRouteIng', data);
  });
   	 socket.on('firstlogin', function (data) {
  	console.log(data);
    io.sockets.emit('showLoginName', data);
  });
   	 socket.on('selfPosition', function (data) {
  	console.log(data);
    io.sockets.emit('selfPositionBroadcast', data);
  });
});