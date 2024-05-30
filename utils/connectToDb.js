import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://urraccon:InspIre-83@urraccons-cluster.kcotsgp.mongodb.net/db-contacts"
    );
    console.log("Database connection successful");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDb;
