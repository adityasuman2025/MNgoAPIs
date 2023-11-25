/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        apiPayloadLimit: '100mb',
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        apiPayloadLimit: '100mb',
    },
}

module.exports = nextConfig
