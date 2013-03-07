var mime = require('mime');
var fs = require('fs');
var join = require('path').join;

var allFilters = {
  component: require('./filters/component'),
  browserify: require('./filters/browserify')
};

function match(path, pattern) {
  if (typeof pattern === 'string') {
    return path.test(regexpify(pattern));
  } else if (Array.isArray(pattern)) {
    for (var i = 0; i < pattern.length; i++) {
      if (match(path, pattern[i])) return true;
    }
    return false;
  } else {
    throw new TypeError('Patterns must be strings or an array of strings');
  }
}
module.exports = function (directory, options) {
  var handle = parseConfig(options);
  return function (path, res, next) {
    if (typeof path != 'string') path = path.path;
    handle(directory, path, res, function (err) {
      if (err) return next(err);
      fs.stat(join(directory, path), function (err) {
        if (err) return next();
        else res.sendfile(join(directory, path));
      });
    });
  };
};

function parseConfig(config) {
  var filters = Object.keys(config)
    .map(function (name) {
      if (name in allFilters && (typeof config[name] === 'object' || config[name] === true)) {
        var configs = (Array.isArray(config[name]) ? config[name] : [config[name]])
          .map(function (config) {
            var include = config.include || allFilters[name].include || '*';
            var exclude = config.exclude || allFilters[name].exclude || '';
            if (!Array.isArray(include)) include = [include];
            if (!Array.isArray(exclude)) exclude = [exclude];
            include = include.map(regexpify);
            exclude = exclude.map(regexpify);
            return function (path) {
              if (include.some(function (pattern) { return pattern.test(path); }) &&
                  !exclude.some(function (pattern) { return pattern.test(path); })) {
                return function (directory, res, next) {
                  allFilters[name](directory, path, config.options || {}, res, next);
                }
              } else {
                return false;
              }
            }
          });
        return function (path) {
          var match;
          for (var i = 0; i < configs.length; i++) {
            if (match = configs[i](path)) return match;
          }
          return false;
        }
      } else if (typeof config[name] === 'object') {
        throw new Error('unrecognised filter ' + JSON.stringify(name));
      } else {
        throw new Error('the config for ' + JSON.stringify(name) + ' should be an object');
      }
    });
  return function (directory, path, res, next) {
    var matches = [];
    for (var i = 0; i < filters.length; i++) {
      var match = filters[i](path);
      if (match) matches.push(match);
    }
    if (matches.length > 1) return next(new Error('Matched more than one filter, this is not valid'));
    else if (matches.length === 0) return next();
    else return matches[0](directory, res, next);
  }
}
function regexpify(string) {
  return new RegExp('^' +
    string
      .toLowerCase()
      .replace(/([(){}\[\].+?|\\])/g, '\\$1')//escape everything but `*`
      .replace(/\*/g, '.*') + '$', 'i');
}

module.exports.config = asyncLookup;
function asyncLookup(directory, cb) {
  var config;
  fs.readFile(join(directory, '.jproxy.json'), function (err, res) {
    if (err) {
      fs.readFile(join(directory, 'package.json'), function (ex, res) {
        if (!ex) {
          try {
            config = JSON.parse(res.toString());
          } catch (ex) {
            return cb(ex);
          }
          if (config.jproxy) return cb(null, config.jproxy);
        }
        fs.readFile(join(directory, 'component.json'), function (ex, res) {
          if (!ex) {
            try {
              config = JSON.parse(res.toString());
            } catch (ex) {
              return cb(ex);
            }
            if (config.jproxy) return cb(null, config.jproxy);
          }
          return cb(err);
        })
      });
    } else {
      try {
        config = JSON.parse(res.toString());
      } catch (ex) {
        return cb(ex);
      }
      cb(null, config);
    }
  });
}