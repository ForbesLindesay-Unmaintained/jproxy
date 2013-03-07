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
  var dir = filePath.replace(/\/[^\/]+$/g, '/');
  console.warn('attempting to build ' + JSON.stringify(dir) + ' in ' + directory);
  var componentPath = join(directory, dir, options.component || '../component.json');
  var componentDir = dirname(componentPath);
  fs.stat(componentPath, function (err) {
    if (err) return next(err);
    spawn(install, options.dev !== false ? ['--dev'] : [], {cwd: componentDir})
      .on('exit', function () {
        var builder = new Builder(directory);
        builder.addLookup(join(componentDir, 'components'));
        if (options.dev !== false && options.srcURLs !== false) builder.addSourceURLs();
        if (options.dev !== false) builder.development();
        builder
          .build(function (err, result) {
            if (err) return next(err);
            if (filePath === '/build/build.js') {
              res.setHeader('Content-Type', 'application/javascript');
              res.send(result.require + '\n' + result.js);
            } else {
              res.setHeader('Content-Type', 'text/css');
              res.send(result.css);
            }
          });
      });
  })
};