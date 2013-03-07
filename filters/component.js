var debug = require('debug')('jproxy:component');
var join = require('path').join;
var dirname = require('path').dirname;
var fs = require('fs');
var spawn = require('win-spawn');
var install = require.resolve('component/bin/component-install');
var Builder = require('component-builder');

exports = module.exports = apply;
exports.include = ['*/build/build.js', '*/build/build.css'];
exports.exclude = '';

function apply(directory, filePath, options, res, next) {
  debug('%j -> %j using %j', directory, filePath, options);
  var dir = filePath.replace(/\/[^\/]+$/g, '/');
  debug('dir %j', dir);
  var componentPath = join(directory, dir, options.component || '../component.json');
  debug('component path %j', componentPath);
  var componentDir = dirname(componentPath);
  debug('component dir %j', componentDir);
  fs.stat(componentPath, function (err) {
    if (err) {
      debug('no component.json');
      return next(err);
    }
    fs.stat(join(componentDir, 'components'), function (err) {
      if (err) {
        debug('installing');
        spawn(install, options.dev !== false ? ['--dev'] : [], {cwd: componentDir})
          .on('exit', function () {
            installed();
          });
      } else {
        installed();
      }
    });
  });
  function installed() {
    debug('installed');
    var builder = new Builder(componentDir);
    builder.addLookup(join(componentDir, 'components'));
    if (options.dev !== false && options.srcURLs !== false) builder.addSourceURLs();
    if (options.dev !== false) builder.development();
    builder
      .build(function (err, result) {
        if (err) return next(err);
        if (/\.js$/.test(filePath)) {
          res.setHeader('Content-Type', 'application/javascript');
          res.send(result.require + '\n' + result.js);
        } else if (/\.css$/.test(filePath)) {
          res.setHeader('Content-Type', 'text/css');
          res.send(result.css);
        } else {
          return next();
        }
      });
  }
};