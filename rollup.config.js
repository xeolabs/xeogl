
export default {
    input: 'src/xeogl.js',
    plugins: [
    ],
    // sourceMap: true,
    output: [
        {
            format: 'umd',
            name: 'xeogl',
            file: 'build/xeogl.js',
            indent: '\t'
        },
        {
            format: 'es',
            file: 'build/xeogl.module.js',
            indent: '\t'
        }
    ]
};
