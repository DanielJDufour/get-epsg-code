const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const {
  DEFAULT_HASHED_FIELDS,
  EXCLUDED_FORMATS,
  HASHED_FIELDS
} = require('./globals.js');

// executes create.js
require('./create.js');

const rules = [
  {
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ["@babel/preset-env"],
        plugins: ["@babel/plugin-proposal-optional-chaining"]
      },
    },
  },
  {
    test: /\.dat$/,
    loaders: ['arraybuffer-loader'],
  },  
];

if (EXCLUDED_FORMATS.includes('mapnik')) {
  rules.unshift({
    test: path.resolve(__dirname, 'node_modules/xml-utils/src/get-attribute.js'),
    use: 'null-loader'
  });
}

module.exports = (env, argv) => {
  console.log('mode:', argv.mode);
  console.log('target:', argv.target);
  const {mode, target} = argv;
  let part;
  if (HASHED_FIELDS.length === DEFAULT_HASHED_FIELDS.length) {
    part = 'all';
  } else {
    part = 'excluding-' + EXCLUDED_FORMATS.join('-');
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
    module: { rules },
    node: {
      // makes sure that arraybuffer-loader doesn't include Buffer polyfill in web version of builds      
      'Buffer': false
    },
    externals: {},
    plugins: [
      new EnvironmentPlugin([
        'EXCLUDED_FORMATS',
        'HASHED_FIELDS'
      ])
    ]
  };
};
