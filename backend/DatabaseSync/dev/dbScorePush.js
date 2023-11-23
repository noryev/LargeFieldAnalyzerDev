import { MongoClient } from 'mongodb';
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
                throw new Error(`Property ${propertyPath.join('.')} not found`);
            }
        }
        return property;
    } catch (err) {
        throw new Error(`Error reading ${fileName} in ${path.basename(directory)}: ${err.message}`);
    }
}

// Function to iterate over analysis directories and update database
async function extractDataAndUpdateDatabase() {
    let processedCount = 0;
    let updateSuccessCount = 0;
    let errorCount = 0;

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const directories = await fs.promises.readdir(baseDir);
        console.log(`Found ${directories.length} directories to process.`);

        for (const dir of directories) {
            console.log(`Processing directory ${dir}...`);
            const directoryPath = path.join(baseDir, dir);
            const stat = await fs.promises.stat(directoryPath);

            if (stat.isDirectory()) {
                processedCount++;
                try {
                    const score = await extractProperty(directoryPath, 'reports/report.json', ['info', 'score']);
                    const target = await extractProperty(directoryPath, 'task.json', ['target']);

                    console.log(`Updating document with target ${target} with score: ${score}`);

                    const result = await collection.updateOne(
                        { ipfsCID: target },
                        { $set: { score: score } }
                    );

                    if (result.modifiedCount > 0) {
                        updateSuccessCount++;
                        console.log(`Successfully updated document with target ${target}.`);
                    } else {
                        console.log(`No changes made to document with target ${target}.`);
                    }
                } catch (err) {
                    errorCount++;
                    console.error(`Error processing directory ${dir}:`, err.message);
                }
            } else {
                console.log(`Skipping non-directory ${dir}.`);
            }
        }

        console.log(`Process Summary: Processed ${processedCount} directories. Successfully updated ${updateSuccessCount} documents. Encountered errors in ${errorCount} directories.`);

    } catch (err) {
        console.error('Error during database connection or operation:', err.message);
    } finally {
        await client.close();
    }
}

extractDataAndUpdateDatabase();
