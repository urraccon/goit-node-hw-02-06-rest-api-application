import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:coRneR_28@dev-contacts-cluster.9h4lse9.mongodb.net/db-contacts"
    );
    console.log("Database connection successful");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDb;
