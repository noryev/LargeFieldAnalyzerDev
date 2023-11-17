import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const baseDir = path.join(process.env.HOME, '.cuckoo/storage/analyses');

const client = new MongoClient(uri);

// Function to read JSON and extract specified property
async function extractProperty(directory, fileName, propertyPath) {
    const filePath = path.join(directory, fileName);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const json = JSON.parse(data);
        let property = json;
        for (const key of propertyPath) {
            property = property[key];
            if (property === undefined) {
                return null;
            }
        }
        return property;
    } catch (err) {
        console.error(`Error in ${path.basename(directory)}:`, err.message);
        return null;
    }
}

// Function to iterate over analysis directories and update database
async function extractDataAndUpdateDatabase() {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const directories = await fs.promises.readdir(baseDir);

        for (const dir of directories) {
            const directoryPath = path.join(baseDir, dir);
            const stat = await fs.promises.stat(directoryPath);

            if (stat.isDirectory() && /^[0-9a-fA-F]{24}$/.test(dir)) {
                const score = await extractProperty(directoryPath, 'reports/report.json', ['info', 'score']);
                const target = await extractProperty(directoryPath, 'task.json', ['target']);

                const result = await collection.updateOne(
                    { _id: new ObjectId(dir) },
                    { $set: { score: score, target: target } }
                );

                console.log(`Updated document with id ${dir}:`, result);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.close();
    }
}

extractDataAndUpdateDatabase();
