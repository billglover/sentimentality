var util       = require('util'),
    twitter    = require('twitter'),
    http       = require('http'),
    fs         = require('fs'),
    nconf      = require('nconf'),
    fa         = require("fixed-array"),
    analyze    = require('Sentimental').analyze,
    positivity = require('Sentimental').positivity,
    negativity = require('Sentimental').negativity;

// use configuration from: parameters, environment variables, and then config.json
nconf.argv()
     .env()
     .file({ file: 'config.json' });

// set up an array to store the last 'n' scores for a rolling average
var lastn = fa.newFixedValueHistory(100);

// set up the lights
var setLights = function setLights(lights) {
  url = "http://" 
    + nconf.get('lights:user') 
    + ":" + nconf.get('lights:password') 
    + "@" + nconf.get('lights:hostname')
    + "/Set.cmd?CMD=SetPower+p61=" + lights.red 
    + "+p62=" + lights.green 
    + "+p63=0+p64=0";
  //console.log(url);

  http.get(url, function(res) {
    //console.log("Got result: " + res);  
  }).on('error', function(e) {
    //console.log("Got error: " + e.message);
  });
};

// some helpful light control functions
var toggleRed = function toggleRed(lights) {
  lights.red = (lights.red == 0 ? 1 : 0);
  setLights(lights);
};

var toggleGreen = function toggleRed(lights) {
  lights.green = (lights.green == 0 ? 1 : 0);
  setLights(lights);
};

var toggleBoth = function toggleRed(lights) {
  lights.red = (lights.red == 0 ? 1 : 0);
  lights.green = (lights.green == 0 ? 1 : 0);
  setLights(lights);
};

// turn the lights off initially
var lights = {red: 0, green: 0};
setLights(lights);

// Set up Twitter client
var twit = new twitter({
  consumer_key: nconf.get('oauth:consumer_key'),
  consumer_secret: nconf.get('oauth:consumer_secret'),
  access_token_key: nconf.get('oauth:access_token_key'),
  access_token_secret: nconf.get('oauth:access_token_secret')
});

// Handle each tweet as it is received
var processTweet = function processTweet(tweet) {

  // We only handle English tweets at the moment
  if(tweet.lang === 'en') {
    var score = analyze(tweet.text).comparative;
    lastn.push(score);

    console.log();
    console.log(tweet.user.name + ': ' + tweet.text );
    console.log('score: ' + score);
    console.log('rolling avg: ' + lastn.mean());

    // toggle green for positive, red for negative, or both for indiference
    if ( score > 0 ) {
        toggleGreen(lights);
    } else if ( score < 0 ) {
        toggleRed(lights);
    } else {
        toggleBoth(lights);
    }
  };
};

// Start listening to Streaming API
twit.stream('filter', {track: nconf.get('track')}, function(stream) {
  stream.on('data', processTweet);

  // If `duration` is set then set the timeout
  if(nconf.get('duration')) {
    setTimeout(stream.destroy, nconf.get('duration'));
  };
});
