import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') }); // Ensure the correct path to your .env file

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateDocument(objectId, score) {
  try {
    await client.connect();
    const database = client.db(dbName); // Use environment variable for database name
    const collection = database.collection(collectionName); // Use environment variable for collection name

    const result = await collection.updateOne(
      { _id: new ObjectId(objectId) }, // ObjectId conversion for the provided objectId
      { $set: { score: score } }
    );

    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
  } catch (error) {
    console.error('Error updating document:', error);
  } finally {
    await client.close();
  }
}

// Example usage
// updateDocument('yourObjectId', yourScoreFromCuckoo);
