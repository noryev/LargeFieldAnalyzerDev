import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { create } from 'ipfs-http-client';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const downloadsDir = './downloads';

if (!uri || !dbName || !collectionName) {
    console.error('One or more required environment variables are not set');
    process.exit(1);
}

async function downloadFromIPFS() {
    const client = new MongoClient(uri);
    const ipfs = create('/ip4/127.0.0.1/tcp/5001'); // Adjust the IPFS API address if necessary

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const cursor = collection.find({});

        await fs.mkdir(downloadsDir, { recursive: true });

        for await (const doc of cursor) {
            if (doc.ipfsCID) {
                console.log(`Downloading content for CID: ${doc.ipfsCID}`);
                try {
                    const content = await ipfs.cat(doc.ipfsCID);
                    const filePath = path.join(downloadsDir, `${doc.ipfsCID}.txt`);
                    await fs.writeFile(filePath, content);
                    console.log(`File downloaded and saved to ${filePath}`);
                } catch (error) {
                    console.error(`Error downloading CID ${doc.ipfsCID}:`, error);
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

downloadFromIPFS();
