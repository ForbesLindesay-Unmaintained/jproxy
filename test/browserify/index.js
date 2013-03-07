var join = require('path').join;
var rimraf = require('rimraf');
var express = require('express');
var port = require('../port')();
var jproxy = require('../../');

rimraf.sync(join(__dirname, 'fixture', 'build'));


var app = express();

app.use(jproxy(join(__dirname, 'fixture'), {browserify: true}))

app.listen(port);

console.warn('Test `browserify` support by going to "http://localhost:' + port + '/test.html"');