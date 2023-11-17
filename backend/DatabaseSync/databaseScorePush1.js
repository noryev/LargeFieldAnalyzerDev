import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Update this path to the correct location of your reports directory
const reportsDirectory = path.join(process.env.HOME, '.cuckoo/storage/reports');

async function updateDatabaseWithScore() {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Read all files in the reports directory
    const files = fs.readdirSync(reportsDirectory);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(reportsDirectory, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Assuming the file name is the ObjectId and the score is a property in the JSON
        const objectId = file.replace('.json', '');
        const score = data.score; // Replace with actual path to score in your JSON structure

        const result = await collection.updateOne(
          { _id: ObjectId(objectId) },
          { $set: { score: score } }
        );

        console.log(`Updated document with id ${objectId}:`, result);
      }
    }
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await client.close();
  }
}

updateDatabaseWithScore();
