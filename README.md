<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# webpack-cra-runtime-plugin
With this plugin you could still use `process.env` object in your production built application.
Used `process.env.EVN_VAR` values not replaced in production build, but keep clean `process.env` object.
For runtime configuration update, plugin generate configuration chunk `.dist` file with configuration values placeholders, which could be replaced on server side at runtime.

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
Next just call generated helper script `build/entrypoint.sh`, which will update `REACT_` configuration values from environment variables in configuration module. 
This is very useful when you use Docker containers, where posible just to call `entrypoint.sh` in ENTRYPOINT.

**Dockerfile**
```bash
COPY ./build/entrypoint.sh /working-directory/entrypoint.sh
RUN chmod -x /working-directory/entrypoint.sh
ENTRYPOINT ['/working-directory/entrypoint.sh']
```

## License

[MIT](./LICENSE)
