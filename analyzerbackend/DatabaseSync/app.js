const { MongoClient } = require('mongodb');
const IPFS = require('ipfs-http-client');

async function downloadFromIPFS() {
    const uri = 'your_mongo_connection_string';
    const dbName = 'your_database_name';
    const collectionName = 'your_collection_name';

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const ipfs = IPFS.create(); // Connecting to IPFS on the default API address http://localhost:5001

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const cursor = collection.find({});
        await cursor.forEach(async (doc) => {
            if (doc.ipfsCID) {
                console.log(`Downloading content for CID: ${doc.ipfsCID}`);
                const chunks = [];
                for await (const chunk of ipfs.cat(doc.ipfsCID)) {
                    chunks.push(chunk);
                }
                const content = Buffer.concat(chunks);
                require('fs').writeFileSync(`./downloads/${doc.ipfsCID}.txt`, content);
                console.log('File downloaded and saved to disk');
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
