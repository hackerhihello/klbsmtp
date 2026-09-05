const specs = require("../../../../server/src/config/swagger-spec");

export default function handler(req, res) {
  res.status(200).json(specs);
}

