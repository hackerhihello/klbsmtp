const bcrypt = require("bcryptjs");
const convex = require("./src/config/convex");

async function main() {
  const email = "admin@gmail.com";
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await convex.mutation("admins:createAdmin", {
    email,
    passwordHash,
    role: "admin",
    name: "System Admin"
  });

  console.log("Default admin seeded in Convex:", admin.email, "/ admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
