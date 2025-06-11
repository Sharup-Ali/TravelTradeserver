const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://shahrupshihab20:O8ZdOKA4RHAlchBH@cluster0.bvrod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDatabase() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('tradeTravel');
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

function getObjectId(id) {
  return new ObjectId(id);
}

module.exports = { connectToDatabase, getObjectId };