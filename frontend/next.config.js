/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    // sdk-dapp uses dynamic imports with webpackIgnore — no transpilation needed
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
                crypto: false,
                stream: false,
                buffer: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
