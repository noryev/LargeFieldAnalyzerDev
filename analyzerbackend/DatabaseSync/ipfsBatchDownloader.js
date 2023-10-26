import { create } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const ipfs = create('/ip4/127.0.0.1/tcp/5001'); // Adjust the IPFS API address if necessary
const downloadsDir = './DatabaseSync/downloads';
const outputDir = './output';

async function downloadFile(cid, outputFilePath) {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
    }
    const content = Buffer.concat(chunks);
    await fs.writeFile(outputFilePath, content);
    console.log(`File for CID ${cid} downloaded and saved to ${outputFilePath}`);
}

async function downloadDirectory(cid, outputDirPath) {
    const response = ipfs.get(cid);
    await pipeline(response, fs.createWriteStream(path.join(outputDirPath, `${cid}.tar`)));
    console.log(`Directory for CID ${cid} downloaded and saved as a TAR archive to ${outputDirPath}`);
}

async function downloadFromCID(ipfs, cid, downloadsDir) {
    try {
        const stat = await ipfs.files.stat('/ipfs/' + cid);
        const downloadPath = path.join(downloadsDir, cid);

        if (stat.type === 'file') {
            const content = await ipfs.cat(cid);
            await fs.writeFile(downloadPath, content);
            console.log(`File ${cid} downloaded and saved to ${downloadPath}`);
        } else if (stat.type === 'directory') {
            console.log(`CID ${cid} is a directory. Downloading its contents...`);
            const files = await ipfs.ls(cid);

            await fs.mkdir(downloadPath, { recursive: true });

            for (const file of files) {
                await downloadFromCID(ipfs, file.cid.toString(), downloadPath);
            }
        } else {
            console.log(`CID ${cid} is neither a file nor a directory`);
        }
    } catch (error) {
        console.error(`Error downloading content for CID ${cid}:`, error);
    }
}

async function processFiles(ipfs, cidsFile, downloadsDir) {
    try {
        const data = await fs.readFile(cidsFile, 'utf8');
        const cids = data.split('\n').map(line => line.trim()).filter(Boolean);

        console.log('CIDs to download:', cids); // Add this line to log the CIDs

        for (const cid of cids) {
            await downloadFromCID(ipfs, cid, downloadsDir);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

processFiles();
