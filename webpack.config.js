const fs = require('fs');
const webpack = require('webpack');

const VERSION = JSON.stringify(
    JSON.parse(fs.readFileSync('package.json', 'utf8')).version
);

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'noscript-react.js',
        library: 'ns',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DefinePlugin({ VERSION })
    ]
};
