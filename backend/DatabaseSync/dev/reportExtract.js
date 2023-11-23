import fs from 'fs';
import path from 'path';

// Base directory path
const baseDir = '/home/major-shepard/.cuckoo/storage/analyses/';

// Function to read the JSON file and extract the 'target' variable
async function extractTarget(directory) {
    const filePath = path.join(directory, 'task.json');

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const json = JSON.parse(data);
        if (json.target !== undefined) {
            console.log(`Target in ${path.basename(directory)}:`, json.target);
        } else {
            console.log(`The "target" variable does not exist in ${path.basename(directory)}.`);
        }
    } catch (err) {
        console.error(`Error in ${path.basename(directory)}:`, err.message);
    }
}

// Function to iterate over analysis directories and extract targets
async function extractTargetsFromAllAnalyses() {
    try {
        const directories = await fs.promises.readdir(baseDir);

        for (const dir of directories) {
            const directoryPath = path.join(baseDir, dir);
            const stat = await fs.promises.stat(directoryPath);

            if (stat.isDirectory()) {
                await extractTarget(directoryPath);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Execute the function
extractTargetsFromAllAnalyses();
