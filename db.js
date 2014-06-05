var mongoose = require( 'mongoose' );



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});


var Plans = mongoose.Schema({
    Start    : String,
    End    : String,
    Mode : String
});
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role:String,
    salt: String,
    hash: String
});

var routePoint = new mongoose.Schema({
    lat: String,
    lng: String,
    ofDates:Date
});

mongoose.model( 'Plans', Plans );
mongoose.model( 'UserSchema', UserSchema );
mongoose.model( 'routePoint', routePoint );

mongoose.connect( 'mongodb://localhost/MapChat' );
