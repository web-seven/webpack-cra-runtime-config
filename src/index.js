const fs = require('fs');
const tempdir = require('os').tmpdir();

class CraRuntimeConfigPlugin {

    constructor(config = {}) {
        this.config = config;
        config.plugins.forEach((plugin) => {
            if (plugin.constructor.name == 'DefinePlugin') {
                this.definitions = plugin.definitions['process.env'];
                plugin.definitions = {};
            }

            if (plugin.constructor.name == 'InterpolateHtmlPlugin') {
                let placeholders = {};
                this.replacements = plugin.replacements;
                Object.keys(this.replacements).forEach(key => {
                    placeholders[key] = 'PLACEHOLDER_' + key;
                })

                fs.writeFile(
                    tempdir + '/config.js',
                    `process.env = ${JSON.stringify(placeholders, function (k, v) { return v === undefined ? null : v; })};`,
                    () => { }
                );
                config.entry.unshift(tempdir + '/config.js')
            }
        });
    }

    apply(compiler) {

        this.config.optimization.splitChunks = {
            chunks: 'all',
            cacheGroups: {
                chunks: 'all',
                config: {
                    test: /config\.js/,
                    name(module, chunks, cacheGroupKey) {
                        return `config.js`;
                    },
                    enforce: true,
                    chunks: 'initial',
                }
            }
        }

        compiler.hooks.emit.tapAsync('CraRuntimeConfigPlugin', (compilation, callback) => {
            compilation.chunks.forEach(chunk => {
                if (chunk.name == 'config.js') {

                    chunk.files.forEach(filename => {
                        let source = compilation.assets[filename].source();
                        const originalSource = source.slice();
                        compilation.assets[filename + '.dist'] = {
                            source: function () {
                                return originalSource
                            },
                            size: function () {
                                return originalSource.length;
                            }
                        };

                        if (Object.keys(compilation.assets[filename]).includes('children')) {
                            Object.keys(this.replacements).forEach(key => {
                                source = source.replace('\"PLACEHOLDER_' + key + '\"', this.definitions[key]);
                            })
                            compilation.assets[filename].children[0]._value = source;
                        }

                        if (Object.keys(compilation.assets[filename]).includes('_value')) {
                            Object.keys(this.replacements).forEach(key => {
                                let value = this.definitions[key];
                                if (typeof value == 'string') {
                                    value = value.replace(/"/gi, '\\"')
                                }
                                source = source.replace('\\"PLACEHOLDER_' + key + '\\"', value);
                            })
                            compilation.assets[filename]._value = source;
                        }


                    });
                }

            });

            callback();
        });
    }
}

export default CraRuntimeConfigPlugin;