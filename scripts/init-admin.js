const { spawn } = require("child_process");

const email = process.env.LL_ADMIN_EMAIL || "admin@mail.com";
const organisationName = process.env.LL_ADMIN_ORG || "soco";
const password = process.env.LL_ADMIN_PASSWORD || "1234qweR";

if (!email || !organisationName || !password) {
  console.error(
    "Missing required environment variables: LL_ADMIN_EMAIL, LL_ADMIN_ORG, LL_ADMIN_PASSWORD"
  );
  process.exit(1);
}

console.log("Configuring admin account ...");

const child = spawn(
  "node",
  ["cli/dist/server", "createSiteAdmin", email, organisationName, password],
  { stdio: "inherit" }
);

child.on("exit", (code) => process.exit(code));
