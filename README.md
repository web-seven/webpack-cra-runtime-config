<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

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
Plugin will generate `config.js` module and include it as first entry of application.
On server side in this module replaced by `config.js.dist` where integrated environment variables with prefix `REACT_` 
by `entrypoint.sh` script, which also generated and placed in `build` directory.

## Dockerfile

```bash
COPY ./build/entrypoint.sh /working-directory/entrypoint.sh
RUN chmod -x /working-directory/entrypoint.sh
ENTRYPOINT ['/working-directory/entrypoint.sh']
```

## License

[MIT](./LICENSE)