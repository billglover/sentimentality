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

// Set up Twitter client
console.log();
console.log('# oAuth Configuration');
console.log('oauth:consumer_key ' + nconf.get('oauth:consumer_key'));
console.log('oauth:consumer_secret ' + nconf.get('oauth:consumer_secret'));
console.log('oauth:access_token_key ' + nconf.get('oauth:access_token_key'));
console.log('oauth:access_token_secret ' + nconf.get('oauth:access_token_secret'));

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
    };
};

// Start listening to Streaming API
console.log();
console.log('# Stream Filters');
console.log('track ' + nconf.get('track'));

twit.stream('filter', {track: nconf.get('track')}, function(stream) {
    stream.on('data', processTweet);

    // If `duration` is set then set the timeout
    if(nconf.get('duration')) {
        setTimeout(stream.destroy, nconf.get('duration'));
    };
});
