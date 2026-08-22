/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/api-docs": ["./node_modules/swagger-ui-dist/**/*"]
    },
    serverComponentsExternalPackages: [
      "express",
      "bullmq",
      "ioredis",
      "bcryptjs",
      "helmet",
      "multer",
      "swagger-ui-dist",
      "swagger-ui-express"
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api-docs",
        destination: "/api/api-docs"
      },
      {
        source: "/api-docs/:path*",
        destination: "/api/api-docs/:path*"
      }
    ];
  }
};

module.exports = nextConfig;
