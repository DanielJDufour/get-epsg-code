const path = require('path');
const { HASHED_FIELDS } = require('./globals.js');

// executes create.js
require('./create.js');

module.exports = (env, argv) => {
  console.log('mode:', argv.mode);
  console.log('target:', argv.target);
  const {mode, target} = argv;
  let part;
  if (HASHED_FIELDS.length === 4) {
    part = 'all';
  } else {
    const excludedFields = ['esriwkt', 'mapfile', 'mapnik', 'proj4'].filter(f => !HASHED_FIELDS.includes(f));
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
