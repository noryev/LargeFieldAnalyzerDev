require('dotenv').config();
const { MongoClient } = require('mongodb');
const { create } = require('helia');
const fs = require('fs');

async function downloadFromIPFS() {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;
    const collectionName = process.env.COLLECTION_NAME;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const ipfs = create('/ip4/127.0.0.1/tcp/5001'); // Adjust the IPFS API address if necessary

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const cursor = collection.find({});
        await cursor.forEach(async (doc) => {
            if (doc.ipfsCID) {
                console.log(`Downloading content for CID: ${doc.ipfsCID}`);
                try {
                    const content = await ipfs.cat(doc.ipfsCID);
                    fs.writeFileSync(`./downloads/${doc.ipfsCID}.txt`, content);
                    console.log('File downloaded and saved to disk');
                } catch (error) {
                    console.error(`Error downloading CID ${doc.ipfsCID}:`, error);
                }
            }
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

downloadFromIPFS();
