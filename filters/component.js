var debug = require('debug')('jproxy:component');
var join = require('path').join;
var dirname = require('path').dirname;
var fs = require('fs');
var wSpawn = require('win-spawn');
var install = require.resolve('component/bin/component-install');
var Builder = require('component-builder');

var Q = require('q');
var stat = Q.nfbind(fs.stat);
function spawn(path, args, options) {
  return Q.promise(function (resolve, reject) {
    wSpawn(path, args, options)
      .on('exit', function () {
        resolve(null);
      });
  });
}

exports = module.exports = apply;
exports.include = ['*/build/build.js', '*/build/build.css'];
exports.exclude = '';

function apply(directory, filePath, options, res, next) {
  //debug('%j -> %j using %j', directory, filePath, options);
  var dir = filePath.replace(/\/[^\/]+$/g, '/');
  //debug('dir %j', dir);
  var componentPath = join(directory, dir, options.component || '../component.json');
  //debug('component path %j', componentPath);
  var componentDir = dirname(componentPath);
  //debug('component dir %j', componentDir);
  stat(componentPath)
    .then(function () {
      return stat(join(componentDir, 'components'))
        .fail(function () {
          return spawn(install, options.dev !== false ? ['--dev'] : [], {cwd: componentDir});
        });
    })
    .then(function () {
      debug('installed');
      var builder = new Builder(componentDir);
      builder.addLookup(join(componentDir, 'components'));
      if (options.dev !== false && options.srcURLs !== false) builder.addSourceURLs();
      if (options.dev !== false) builder.development();
      return Q.nfbind(builder
        .build.bind(builder))()
        .then(function (result) {
          debug('built');
          if (/\.js$/.test(filePath)) {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(result.require + '\n' + result.js);
          } else if (/\.css$/.test(filePath)) {
            res.setHeader('Content-Type', 'text/css');
            res.send(result.css);
          } else {
            return next();
          }
          debug('sent');
        });
    }, function () { return next(); })
    .done(null, next);
};