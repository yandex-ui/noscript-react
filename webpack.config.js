module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'noscript-react.js',
        library: 'ns',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};
