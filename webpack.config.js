module.exports = {
  entry: {
    example: './example.js',
  },
  output: {
    filename: 'output.js',
  },
  module: {
    rules: [{
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            require('/home/marcel/code/babel-plugin-rxjs/index.js'),
          ],
        },
      },
    }],
  },
}

