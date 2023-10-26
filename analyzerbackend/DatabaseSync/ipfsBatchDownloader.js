import { create } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const ipfs = create('/ip4/127.0.0.1/tcp/5001'); // Adjust the IPFS API address if necessary
const downloadsDir = './downloads';
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

async function downloadFromCID(cid) {
    try {
        const { type } = await ipfs.object.stat(cid);

        const outputFilePath = path.join(outputDir, cid);

        if (type === 'file') {
            await downloadFile(cid, `${outputFilePath}.txt`);
        } else if (type === 'directory') {
            await downloadDirectory(cid, outputDir);
        } else {
            console.error(`CID ${cid} is neither a file nor a directory`);
        }
    } catch (error) {
        console.error(`Error downloading content for CID ${cid}:`, error);
    }
}

async function processFiles() {
    try {
        await fs.ensureDir(outputDir);
        const fileNames = await fs.readdir(downloadsDir);

        for (const fileName of fileNames) {
            const filePath = path.join(downloadsDir, fileName);
            const cid = await fs.readFile(filePath, 'utf8').trim();
            await downloadFromCID(cid);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

processFiles();
