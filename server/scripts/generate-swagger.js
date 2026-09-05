const fs = require("fs");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Email SaaS API",
      version: "1.0.0",
      description: "Multi-tenant email automation SaaS API"
    },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        apiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" }
      },
      schemas: {
        AdminLoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }
          }
        },
        Organization: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            apiKey: { type: "string" },
            dailyLimit: { type: "integer" },
            status: { type: "string", enum: ["active", "inactive"] }
          }
        },
        SendEmailRequest: {
          type: "object",
          properties: {
            to: { type: "string", format: "email" },
            subject: { type: "string" },
            html: { type: "string" },
            attachments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  content: { type: "string" },
                  encoding: { type: "string", example: "base64" },
                  contentType: { type: "string" }
                }
              }
            },
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  to: { type: "string", format: "email" },
                  subject: { type: "string" },
                  html: { type: "string" },
                  attachments: { type: "array", items: { type: "object" } }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.resolve(__dirname, "../src/modules/**/*.js")]
};

const specs = swaggerJsdoc(options);
const outputPath = path.resolve(__dirname, "../../client/public/swagger.json");
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
console.log("Swagger JSON generated successfully at " + outputPath);

