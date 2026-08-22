/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api-docs": ["./node_modules/swagger-ui-dist/**/*"]
  }
};

module.exports = nextConfig;
