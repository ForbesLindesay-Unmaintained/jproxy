# jproxy

Proxy while applying amazing transformations

## Usage

### Command Line

  Installation:

    $ npm install jproxy -g
  
  Usage:

    $ jproxy

  Configuration:

  See "Proxy Configuration"

### API

  Installation:

    $ npm install jproxy

  Usage:

```js
var jproxy = require('jproxy');
var express = require('express');
var app = express();

var config = {browserify: true};//see "Proxy Configuration" for more info
app.use(jproxy(__dirname, config));

app.listen(3000);
```

## Proxy Configuration

  The Proxy Configuration must be a JSON object.

### Where can I put the proxy configuration?

  If you're using the API you pass it in: `jproxy(dirname, config)`.  If you're using the command line you can put it in one of three places.

  If you're using the command line interface you can put it in any of the following locations (in this order of precedence).

  1. `.jproxy.json`
  2. `"jproxy"` property in `package.json`
  3. `"jproxy"` property in `component.json`

  If you're using this in jepso-ci you can put it in any of the 3 locations above, or you can put it in any of the 3 locations below.  The ones below take precence:

  1. `"proxy"` property in `.jepxo-ci.json`
  2. `"proxy"` property in `"jepso-ci"` object in `package.json`
  2. `"proxy"` property in `"jepso-ci"` object in `component.json`

### What does a configuration look like

Each property of the object must correspond to one of the possible jproxy filters.  The value of such a proxy must be a `FilterConfiguration` or array of `FilterConfiguration`s.  e.g.

```javascript
{
  "browserify": {
    "include": "*.js",
    "exclude": "*mocha.js",
    "options" {
      "transform": ["coffeeify"]
    }
  },
  "uglify-js": [
    {
      "include": "*.js",
      "exclude": "*.min.js",
      "options" {
        "beautify": true
      }
    },
    {
      "include": "*.min.js",
      "options" {
        "beautify": false
      }
    }
  ]
}
```

### Filter Configuration

  The filter configuration is an object which defines when the filter is applied, and how it is applied.

  The Filter Configuration consists of the following 3 properties.

   - include
   - exclude
   - options

#### include

  Include specifies which files to filter.  It can be a string, or an array of strings.  If the path contains a `*` it is treated as "any character one or more times".  If the path begins with a `/` character, the whole path is required to match.  If it begins with anything else it is assumed to just require the end of the path to match.

  The filter may define a default `include` pattern.  If it doesn't, the default will simply be "*".

  e.g.

<table>
  <thead>
    <tr>
      <th>Pattern</th>
      <th>Value</th>
      <th>Matches</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>"/build/build.js"</td>
      <td>"/build/build.js"</td>
      <td>TRUE</td>
    </tr>
    <tr>
      <td>"/build/build.js"</td>
      <td>"/lib/build/build.js"</td>
      <td>FALSE</td>
    </tr>
    <tr>
      <td>"build/build.js"</td>
      <td>"/build/build.js"</td>
      <td>TRUE</td>
    </tr>
    <tr>
      <td>"build/build.js"</td>
      <td>"/lib/build/build.js"</td>
      <td>TRUE</td>
    </tr>
    <tr>
      <td>"/build/build.js"</td>
      <td>"/build/foo.js"</td>
      <td>FALSE</td>
    </tr>
    <tr>
      <td>"/build/*.js"</td>
      <td>"/lib/build/foo.js"</td>
      <td>TRUE</td>
    </tr>
  </tbody>
<table>

#### exclude

  Exclude can again be a string, or an array of strings.  It overrides `include` so if a path matches `exclude` it won't be filtered even if it matches `include`.  By default, everything is excluded.

#### options

  Options is a JSON object, it's meaning is specific to the individual filter.  If omitted the filter will define defaults.

