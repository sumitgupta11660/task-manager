import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`;
    const connectionInstance = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected | HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
