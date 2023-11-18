import { create } from 'ipfs-http-client';
import fs from 'fs-extra';
import path from 'path';

const ipfs = create({ url: '/ip4/127.0.0.1/tcp/5001' });
const downloadsDir = path.resolve('./downloads');
const outputDir = path.resolve('./output');

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
        const folders = await fs.readdir(downloadsDir);

        for (const folder of folders) {
            const folderPath = path.join(downloadsDir, folder);
            const folderStat = await fs.stat(folderPath);

            if (folderStat.isDirectory()) {
                const files = await fs.readdir(folderPath);
                const txtFiles = files.filter(file => path.extname(file) === '.txt');

                for (const txtFile of txtFiles) {
                    const data = await fs.readFile(path.join(folderPath, txtFile), 'utf8');
                    const cids = data.split('\n').map(line => line.trim()).filter(Boolean);

                    for (const cid of cids) {
                        await downloadFromCID(ipfs, cid, outputDir);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

// Ensure output directory exists
await fs.ensureDir(outputDir);

// Call the processFiles function
processFiles(ipfs, downloadsDir, outputDir);
