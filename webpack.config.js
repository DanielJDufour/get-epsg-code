const path = require('path');
const { DEFAULT_HASHED_FIELDS, HASHED_FIELDS } = require('./globals.js');

// executes create.js
require('./create.js');

module.exports = (env, argv) => {
  console.log('mode:', argv.mode);
  console.log('target:', argv.target);
  const {mode, target} = argv;
  let part;
  if (HASHED_FIELDS.length === DEFAULT_HASHED_FIELDS.length) {
    part = 'all';
  } else {
    const excludedFields = [];
    if (!HASHED_FIELDS.includes('esriwkt')) excludedFields.push('esriwkt');
    if (!HASHED_FIELDS.includes('mapfile')) excludedFields.push('mapfile');
    if (!HASHED_FIELDS.includes('proj4')) {
      excludedFields.push('mapnik'); // mapnik parsing depends on proj4
      excludedFields.push('proj4');
    }
    part = 'excluding-' + excludedFields.join('-');
  }
  return {
    entry: './src/index.js',
    devtool: 'source-map',
    mode,
    target: target,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: mode === 'production' ? `get-epsg-code-${part}.${target}.min.js` : `get-epsg-code-${part}.${target}.js`,
      globalObject: 'typeof self !== \'undefined\' ? self : this',
      library: 'get-epsg-code',
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: []
            },
          },
        },
        {
          test: /\.dat$/,
          loaders: ['arraybuffer-loader'],
        },
      ],
    },
    node: {},
    externals: {}
  };
};
