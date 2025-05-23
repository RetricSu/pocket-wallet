// craco.config.js
const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // 添加扩展名解析，以解决没有写完整扩展名的问题
            webpackConfig.resolve.extensions = [
                ...(webpackConfig.resolve.extensions || []),
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
                ".toml"
            ];

            // 针对 'stream' 的 fallback 配置
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                "stream": require.resolve("stream-browserify"),
            };

            // Use the proper webpack module type for TOML files
            webpackConfig.module.rules.push({
                test: /\.toml$/,
                type: 'asset/source',
            });

            return webpackConfig;
        },
        plugins: {
            add: [
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                }),
            ],
        },
    },
    // Add devServer configuration with required headers for SharedArrayBuffer
    devServer: {
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        },
    },
};
