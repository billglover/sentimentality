# Sentimentality

Sentimental Christmas Lighting - Why? Because we can.

## The Software

You need to create a configuration file. The easiest way to do this is to copy the sample provided and then modify it with your API key and search terms.

    cp config.sample.json config.json

If you don't have an API key, you can get one by following the instructions on Twitter: https://dev.twitter.com/apps/new

The `duration` property	is optional and specifies the duration in miliseconds that you want the program to run for.

To install all dependencies:

    npm install

And then run the app with:

    node app.js

You will see output similar to the following:

    Danielle Sorrells: This is Christmas Break at its finest, people #cb13 http://t.co/GUFpw3Ku1g
    score: 0
    rolling avg: 0.0804892996683543

    Jennie Barr: Christmas time .. http://t.co/IkdG3MkT1P
    score: 0
    rolling avg: 0.0804892996683543

    Marie Levesque: Our pitiful Christmas Tree&lt;3 @loveyourself321 http://t.co/MBk8IxQufK
    score: 0
    rolling avg: 0.08013215681121144

And, unless you've chagned the defaults, the app will run for 30s and then terminate.

## The Hardware

