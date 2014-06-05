var mongoose = require( 'mongoose' );
var Plans     = mongoose.model( 'Plans' );
var request = require('request');
var routePoint = mongoose.model( 'routePoint');

//console.log(Plans);

exports.login = function(req, res){

  res.render('login');

};
exports.create = function ( req, res, next ){
  // console.log( 'req:' + req.query.start);
  new Plans({
      Start    : req.query.start,
      End    : req.query.end,
      Mode : req.query.mode
  }).save( function ( err, Plans, count ){
    if( err ) return next( err );
      res.send(Plans) ;
   // res.redirect( '/' );
  });
};



exports.getALLRoute = function ( req, res, next ){
     Plans.find({}, function(err, obj) {
  if (err) { throw err; }
  else { res.send(obj) ;}
});
};
exports.getRoutePoint = function ( req, res, next ){
     routePoint.find({}, function(err, obj) {
  if (err) { throw err; }
  else { res.send(obj) ;}
});
};
exports.RoutePointcreate = function ( req, res, next ){
  // console.log( 'req:' + req.query.start);
  new routePoint({
      lat    : req.query.lat,
      lng    : req.query.lng,
      ofDates : new Date()
  }).save( function ( err, routePoint, count ){
    if( err ) return next( err );
      res.send(routePoint) ;
   // res.redirect( '/' );
  });
};
exports.deleteRoute = function ( req, res, next ){
  Plans.findById( req.params.id, function ( err, routes ){

    routes.remove( function ( err, route ){
      if( err ) return next( err );
        res.send(route) ;
     // res.redirect( '/' );
    });
  });
};

exports.SceneJson = function(req, res){


var url = "http://data.kaohsiung.gov.tw/Opendata/DownLoad.aspx?Type=2&CaseNo1=AV&CaseNo2=1&FileType=1&Lang=C";

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      res.send(body) ; // Print the json response
    }
})
};

exports.logout = function(req, res){
  req.session.user=null;
  res.redirect('/');
};

exports.mapchat = function(req, res){
  res.render('Map',{username:req.session.user.username,
                    role:'<input id="roleid" type="hidden" value="'+req.session.user.role+'">',
                    uname:'<input id="username" type="hidden" value="'+req.session.user.username+'">'
                  });


};