import { create } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';

const ipfs = create({ url: '/ip4/127.0.0.1/tcp/5001' }); // Adjust the IPFS API address if necessary
const downloadsDir = path.resolve('./downloads'); // Ensure this is the correct path
const outputDir = path.resolve('./output'); // Path to save the downloaded content

async function downloadFromCID(ipfs, cid, outputDirPath) {
    try {
        const stat = await ipfs.files.stat('/ipfs/' + cid);

        if (stat.type === 'file') {
            const content = [];

            for await (const chunk of ipfs.cat(cid)) {
                content.push(chunk);
            }

            const filePath = path.join(outputDirPath, cid);
            await fs.outputFile(filePath, Buffer.concat(content));
            console.log(`File ${cid} downloaded and saved to ${filePath}`);
        } else if (stat.type === 'directory') {
            console.log(`CID ${cid} is a directory. Downloading its contents...`);
            const response = await ipfs.ls(cid);
            console.log('Response from ipfs.ls:', response);

            for await (const file of response) {
                await downloadFromCID(ipfs, file.cid.toString(), path.join(outputDirPath, file.name));
            }
        } else {
            console.log(`CID ${cid} is neither a file nor a directory`);
        }
    } catch (error) {
        console.error(`Error downloading content for CID ${cid}:`, error);
    }
}

async function processFiles(ipfs, downloadsDir, outputDir) {
    try {
        const files = await fs.readdir(downloadsDir);
        const txtFiles = files.filter(file => path.extname(file) === '.txt');

        for (const txtFile of txtFiles) {
            const data = await fs.readFile(path.join(downloadsDir, txtFile), 'utf8');
            const cids = data.split('\n').map(line => line.trim()).filter(Boolean);

            console.log('CIDs to download from', txtFile, ':', cids); // Log the CIDs

            for (const cid of cids) {
                await downloadFromCID(ipfs, cid, outputDir);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

// Ensure output directory exists
await fs.ensureDir(outputDir);

// Call the processFiles function with the correct arguments
processFiles(ipfs, downloadsDir, outputDir);
