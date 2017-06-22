var express = require( 'express' );
var secrets = require( "./secrets.js" );
var app = express();

app.use( express.static( './' ) );

app.use( function ( req, res, next ) {
    console.log( req.url );
    next();
})


app.get( "/", function ( req, res ) {
    res.status( 200 );
    res.sendFile( "./mapTask.html", { "root": __dirname });
});

//The Google Maps API key is retrieved from the server to keep it out of source control and less accessible on the client side
app.get( "/googleMapsApiKey", function ( req, res ) {
    var googleMapsApiKey = secrets.googleMapsApiKey;
    res.status( 200 );
    res.send( googleMapsApiKey );
});


//TODO: Make a 404 route
//TODO: Make a 500 error route

app.listen( 80 );