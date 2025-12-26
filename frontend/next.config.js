const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  },

  // Fix chunk loading issues
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // API rewrites for development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
      {
        source: "/socket.io/:path*", 
        destination: "http://localhost:4000/socket.io/:path*",
      },
    ];
  },

  // Remove invalid experimental options
  experimental: {
    // Remove appDir as it's now stable in Next.js 14
  },
};

module.exports = nextConfig;
