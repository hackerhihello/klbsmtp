const specs = require("./swagger-spec");
const express = require("express");
const swaggerUiDist = require("swagger-ui-dist");
const swaggerUi = require("swagger-ui-express");

function mountSwagger(app) {
  const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();

  const swaggerOptions = {
    swaggerOptions: {
      url: "/api/v1/docs"
    }
  };
  
  // Standalone Express path (for local dev without Next.js)
  app.use("/api-docs", express.static(swaggerDistPath));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));
}

module.exports = mountSwagger;

