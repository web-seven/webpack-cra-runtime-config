<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# webpack-cra-runtime-plugin

Generate runtime configuration chunk, with .env file values as default and replaceable on server for runtime.

## Getting Started

To begin, you'll need to install `webpack-cra-runtime-plugin`:

```console
$ npm install webpack-cra-runtime-plugin --save-dev
```

Then add the plugin to your `react-app-rewired` config. For example:

**config-overrides.js**

```js
const { override } = require('customize-cra');
const webpack = require('webpack');
const CraRuntimeConfigPlugin = require('webpack-cra-runtime-plugin');

function overrides(config, env) {
    config.plugins.push(new CraRuntimeConfigPlugin(config))
    return config;
}

module.exports = {
    webpack: override(
        overrides,
    ),
}
```
## Result:

Placeholder file where by simple `sed` replacement posible to add values from enviroment variables of server, eg. Docker build, 
and dump into `build/static/js/config.js.{chunk-hash}.chunk.js` file.

**build/static/js/config.js.{chunk-hash}.chunk.js.dist**
```js
(this["webpackJsonp@owner/repo"]=this["webpackJsonp@owner/repo"]||[]).push([[0],{373:function(_,E,P){(function(_){_.env={NODE_ENV:"PLACEHOLDER_NODE_ENV",PUBLIC_URL:"PLACEHOLDER_PUBLIC_URL",WDS_SOCKET_HOST:"PLACEHOLDER_WDS_SOCKET_HOST",WDS_SOCKET_PATH:"PLACEHOLDER_WDS_SOCKET_PATH",WDS_SOCKET_PORT:"PLACEHOLDER_WDS_SOCKET_PORT",REACT_APP_GOOGLE_PLACES_API_KEY:"PLACEHOLDER_REACT_APP_GOOGLE_PLACES_API_KEY",REACT_APP_AUTH_SERVICE_URL:"PLACEHOLDER_REACT_APP_AUTH_SERVICE_URL",REACT_APP_API_HOST:"PLACEHOLDER_REACT_APP_API_HOST"}}).call(this,P(99))}}]);
//# sourceMappingURL=config.js.{hash}.chunk.js.map
```

Obligatory generated configuration chunk with default values.
**build/static/js/config.js.{chunk-hash}.chunk.js**
```js
(this["webpackJsonp@owner/repo"]=this["webpackJsonp@owner/repo"]||[]).push([[0],{373:function(_,E,P){(function(_){_.env={NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:undefined,WDS_SOCKET_PATH:undefined,WDS_SOCKET_PORT:undefined,REACT_APP_GOOGLE_PLACES_API_KEY:"AIzaSyCucrw8r1ZCaVU9rf69lkz4AHbz7_ossFI",REACT_APP_AUTH_SERVICE_URL:"http://id.digando:30021/",REACT_APP_API_HOST:"tenant-test.digando:30023"}}).call(this,P(99))}}]);
//# sourceMappingURL=config.js.{hash}.chunk.js.map
//# sourceMappingURL=config.js.{hash}.chunk.js.map
```

## Docker entrypoint example

```bash
#!/bin/bash
env_vars=
for var in "${!REACT_@}"; do
    env_vars+="$var=|"
done
env_vars=${env_vars%|}
export $(cat .env | grep -Ev "$env_vars" | xargs)
envsubst < ./build/static/js/config.js.{hasg}.chunk.js.dist > ./build/static/js/config.js.{hasg}.chunk.js
```

## License

[MIT](./LICENSE)