module.exports = {
  entry: './worker.js',
  output: {
    filename: 'bundled-worker.js'
  },
  target: 'webworker',
  mode: 'production'
};