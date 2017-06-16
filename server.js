var express = require( 'express' );
var app = express();

app.use( express.static( './' ) );


//TODO: Make a 404 route
//TODO: Make a 500 error route

app.listen( 3000 );