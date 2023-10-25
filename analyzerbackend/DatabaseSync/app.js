const { MongoClient } = require('mongodb');
const IPFS = require('ipfs-http-client');

async function main() {
    const uri = "<Your MongoDB Connection String>";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB client
        await client.connect();

        // Connect to the IPFS node
        const ipfs = IPFS.create({ host: 'localhost', port: '5001', protocol: 'http' });

        // Get the CIDs from MongoDB
        const cids = await getCIDs(client);

        // Download each file from IPFS
        for (const cid of cids) {
            try {
                const chunks = [];
                for await (const chunk of ipfs.cat(cid)) {
                    chunks.push(chunk);
                }
                const fileContent = Buffer.concat(chunks);
                console.log(`File content of CID ${cid}:`, fileContent.toString());

                // Here you can decide what you want to do with `fileContent`
                // For example, save it to disk, process it, etc.

            } catch (error) {
                console.error(`Failed to download file with CID ${cid}:`, error.message);
            }
        }

    } finally {
        await client.close();
    }
}

async function getCIDs(client) {
    const database = client.db('yourDatabaseName');
    const collection = database.collection('yourCollectionName');

    const documents = await collection.find({}).toArray();
    return documents.map(doc => doc.ipfsCID);
}

main().catch(console.error);
