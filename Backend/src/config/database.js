const mongoose = require("mongoose")

let isConnected = false;

async function connectToMongoDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

// async function connectToDB() {

//     try {
//         await mongoose.connect(process.env.MONGO_URI)

//         console.log("Connected to Database")
//     }
//     catch (err) {
//         console.log(err)
//     }
// }

module.exports = connectToMongoDB