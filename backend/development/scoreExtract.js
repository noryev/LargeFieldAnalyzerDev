import fs from 'fs';
import path from 'path';

// Base directory path
const baseDir = '/home/major-shepard/.cuckoo/storage/analyses/';

// Function to read the JSON file and extract the 'score' variable
async function extractScore(directory) {
    const filePath = path.join(directory, 'reports', 'report.json');

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const json = JSON.parse(data);
        if (json.info && json.info.score !== undefined) {
            console.log(`Score in ${path.basename(directory)}:`, json.info.score);
        } else {
            console.log(`The "score" variable does not exist in ${path.basename(directory)}.`);
        }
    } catch (err) {
        console.error(`Error in ${path.basename(directory)}:`, err.message);
    }
}

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

// Function to iterate over analysis directories and extract both scores and targets
async function extractDataFromAllAnalyses() {
    try {
        const directories = await fs.promises.readdir(baseDir);

        for (const dir of directories) {
            const directoryPath = path.join(baseDir, dir);
            const stat = await fs.promises.stat(directoryPath);

            if (stat.isDirectory()) {
                await extractScore(directoryPath);
                await extractTarget(directoryPath);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Execute the function
extractDataFromAllAnalyses();

// {"_id":{"$oid":"65575f834330ca3846f6e052"},"userId":"2569e3f3-61a1-4966-b04f-1c90797e92c3","ipfsCID":"bafybeidcn7tocj6eicf5jeauasmmzkdykbzfdw7fs5kgc5osfpx3zlfokm"}
