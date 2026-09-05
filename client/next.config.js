/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "express",
      "bullmq",
      "ioredis",
      "bcryptjs",
      "helmet",
      "multer"
    ]
  }
};

module.exports = nextConfig;
