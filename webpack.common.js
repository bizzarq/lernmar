const path = require('path');

module.exports = {
  entry: {
    'composite/js/main': './src/composite/main.ts',
    'player/js/main': './src/player/main.ts',
    'wrapper/js/main': './src/wrapper/main.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: {
      keep: /^(composite|player|wrapper)\/(?!js).+$/
    },
  },
};