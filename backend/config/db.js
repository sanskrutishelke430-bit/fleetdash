const mongoose = require('mongoose');

/**
 * Database Connection Manager
 * Establishes a persistent connection pool to MongoDB using Mongoose ODM.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true, // Automatically build indexes defined in schemas
    });

    console.log(`[FleetDash Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[FleetDash Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Exit process with failure code if DB connection cannot be established
    process.exit(1);
  }
};

module.exports = connectDB;
