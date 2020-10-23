const fs = require('fs');
const { dirname } = require('path');
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
                    if(key.includes('REACT_')) {
                        placeholders[key] = '$' + key;
                    } else {
                        placeholders[key] = plugin.replacements[key];
                    }
                })

                fs.writeFile(
                    tempdir + '/config.js',
                    `process.env = ${JSON.stringify(placeholders, function (k, v) { return v === undefined ? null : v; })};`,
                    () => { }
                );
                config.entry.unshift(tempdir + '/config.js')
            }
        });

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
    }

    apply(compiler) {

        compiler.hooks.emit.tapAsync('CraRuntimeConfigPlugin', (compilation, callback) => {
            compilation.chunks.forEach(chunk => {
                if (chunk.name == 'config.js') {
                    let entrypoint = fs.readFileSync(dirname(__filename) + '/entrypoint.sh').toString();
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
                                source = source.replace('$' + key, this.replacements[key]);
                            })
                            compilation.assets[filename].children[0]._value = source;
                            entrypoint = entrypoint
                                .replace('PLACEHOLDER_JS_DIST', filename+'.dist')
                                .replace('PLACEHOLDER_JS', filename);
                        }

                        if (Object.keys(compilation.assets[filename]).includes('_value')) {
                            Object.keys(this.replacements).forEach(key => {
                                let value = this.replacements[key];
                                source = source.replace('$'+key, value);
                            })
                            compilation.assets[filename]._value = source;
                            entrypoint = entrypoint
                                .replace('PLACEHOLDER_MAP_DIST', filename+'.dist')
                                .replace('PLACEHOLDER_MAP', filename);
                        }

                    });

                    let dotEnvContent = '';

                    Object.keys(this.replacements).forEach(key=>{
                        if(key.includes('REACT_')) {
                            dotEnvContent += `${key}=${this.replacements[key]}\n`;
                        }
                    })

                    compilation.assets['.env'] = {
                        source: function () {
                            return dotEnvContent
                        },
                        size: function () {
                            return dotEnvContent.length;
                        }
                    }
                    
                    compilation.assets['entrypoint.sh'] = {
                        source: function () {
                            return entrypoint
                        },
                        size: function () {
                            return entrypoint.length;
                        }
                    }
                     
                }

            });

            callback();
        });
    }
}

module.exports = CraRuntimeConfigPlugin;