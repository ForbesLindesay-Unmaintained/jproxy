var join = require('path').join;
var fs = require('fs');
var browserify = require('browserify');

exports = module.exports = apply;
exports.include = '*.js';
exports.exclude = '';

function apply(directory, path, options, res, next) {
  next = guard(next);
  var b = browserify([join(directory, path)]);
  b.bundle(function (err, text) {
    if (err) return next(err);
    res.set('Content-Type', 'application/javascript');
    res.send(text);
  });
};

function guard(next) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    next.apply(this, arguments);
  }
}