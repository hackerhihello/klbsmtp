const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

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
  apis: [path.join(__dirname, "../modules/**/*.js")]
};

const specs = swaggerJsdoc(options);

const express = require("express");
const swaggerUiDist = require("swagger-ui-dist");

function mountSwagger(app) {
  const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
  
  // Expose the JSON spec directly (handles trailing slash from Next.js config)
  app.get(["/api/v1/docs", "/api/v1/docs/"], (req, res) => {
    res.json(specs);
  });

  const swaggerOptions = {
    swaggerOptions: {
      url: "/api/v1/swagger.json"
    }
  };
  
  // Next.js rewritten path
  app.use("/api/api-docs", express.static(swaggerDistPath));
  app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

  // Standalone Express path
  app.use("/api-docs", express.static(swaggerDistPath));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));
}

module.exports = mountSwagger;
