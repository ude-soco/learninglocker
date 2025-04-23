import { createSiteAdmin } from "../cli/src/commands/createSiteAdmin";
import { connect, disconnect } from "mongoose";

const email = process.env.LL_ADMIN_EMAIL;
const organisationName = process.env.LL_ADMIN_ORG;
const password = process.env.LL_ADMIN_PASSWORD;

if (!email || !organisationName || !password) {
  console.error(
    "Missing required environment variables: LL_ADMIN_EMAIL, LL_ADMIN_ORG, LL_ADMIN_PASSWORD"
  );
  process.exit(1);
}

const options = {
  forceUpdatePassword: true,
};

const run = async () => {
  try {
    await connect(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`
    );
    await createSiteAdmin(email, organisationName, password, options);
    console.log("Admin user created or already exists.");
  } catch (err) {
    console.error("Failed to create admin user:", err);
    process.exit(1);
  } finally {
    await disconnect();
    process.exit(0);
  }
};

run();
