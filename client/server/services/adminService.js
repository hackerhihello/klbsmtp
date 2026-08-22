const bcrypt = require("bcryptjs");
const convex = require("../config/convex");
const { signJwt } = require("../utils/jwt");

async function loginAdmin({ email, password }) {
  const admin = await convex.query("admins:getAdminByEmail", { email });
  if (!admin) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const adminId = admin._id;
  const token = signJwt({ adminId, role: admin.role || "admin" });
  return {
    token,
    admin: { id: adminId, email: admin.email, name: admin.name, role: admin.role }
  };
}

module.exports = { loginAdmin };
