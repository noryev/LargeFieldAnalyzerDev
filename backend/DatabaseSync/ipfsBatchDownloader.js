import { create } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';

// Initialize IPFS client
const ipfs = create({ url: 'http://127.0.0.1:5001' });
const downloadsDir = path.resolve('./downloads');

/**
 * Download content from a given CID and save it to a specified path within a subfolder.
 */
async function downloadFromCID(ipfs, cid, downloadsDirPath, originalFileName) {
    try {
        const stat = await ipfs.files.stat('/ipfs/' + cid);

        // Create a subfolder within the downloads directory for each CID
        const cidDirPath = path.join(downloadsDirPath, cid);
        await fs.ensureDir(cidDirPath);

        const fileName = originalFileName.replace('.txt', '') || 'downloaded_content';
        const filePath = path.join(cidDirPath, fileName);

        if (stat.type === 'file') {
            const content = [];

            for await (const chunk of ipfs.cat(cid)) {
                content.push(chunk);
            }

            await fs.outputFile(filePath, Buffer.concat(content));
            console.log(`File ${cid} downloaded and saved to ${filePath}`);
        } else if (stat.type === 'directory') {
            console.log(`CID ${cid} is a directory. Downloading its contents...`);
            const response = await ipfs.ls(cid);

            for await (const file of response) {
                await downloadFromCID(ipfs, file.cid.toString(), cidDirPath, file.name);
            }
        } else {
            console.log(`CID ${cid} is neither a file nor a directory`);
        }
    } catch (error) {
        console.error(`Error downloading content for CID ${cid}:`, error);
    }
}

/**
 * Process files in the downloads directory to download content from IPFS.
 */
async function processFiles(ipfs, downloadsDir) {
    try {
        const files = await fs.readdir(downloadsDir);
        const txtFiles = files.filter(file => path.extname(file) === '.txt');

        for (const txtFile of txtFiles) {
            const data = await fs.readFile(path.join(downloadsDir, txtFile), 'utf8');
            const cids = data.split('\n').map(line => line.trim()).filter(Boolean);

            for (const cid of cids) {
                await downloadFromCID(ipfs, cid, downloadsDir, txtFile);
            }
        }
        console.log('All files processed successfully.');
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

// Start processing files
fs.ensureDir(downloadsDir)
    .then(() => processFiles(ipfs, downloadsDir))
    .catch(error => console.error('Error ensuring downloads directory exists:', error));
