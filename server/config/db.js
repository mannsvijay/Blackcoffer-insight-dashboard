import mongoose from "mongoose";

/**
 * Opens the MongoDB connection using the URI from environment variables.
 * Exits the process on failure so problems surface immediately at boot
 * instead of failing silently on the first request.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

export default connectDB;
