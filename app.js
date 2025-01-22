import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

// import ignore from 'ignore';

const DEFAULT_IGNORES = ["node_modules",
                                 ".git",
                                 "package.json",
                                 "package-lock.json",
                                 "output.txt",
                                 ".nodeignore",
                                 ".gitignore",
                                 "cli2text.js"
];

const PROJECT_ROOT = process.cwd();
// gets the project's root

function loadIgnoreFile(){
    // returns the .nodeignore file to know which files will not be in the final result
    const ignoreFilePath = path.join(PROJECT_ROOT, '.nodeignore');
    let ignorePatterns = '';
    if (fs.existsSync(ignoreFilePath)) {
        ignorePatterns = fs.readFileSync(ignoreFilePath, 'utf8');
    }
    return ignorePatterns.split('\n').map(line => line.trim()).filter(line => line);
}

function getFileTree(root, ignoredFiles) {
    function buildTree(dir, ignoredFilesList) {
        const tree = {};
        const items = fs.readdirSync(dir);
        for (const item of items) {
            // Skip items in the ignore list
            if (ignoredFilesList.includes(item)) {
                continue;
            }

            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                tree[item] = buildTree(fullPath, ignoredFilesList); // Recurse into subdirectories
            } else {
                tree[item] = null; // Add files
            }
        }

        return tree;
    }
    return buildTree(root, ignoredFiles)
}

function displayTree(tree){
    /**
         * @param {Object} tree
     */
    function displayItems(tree, deep){
        Object.entries(tree).forEach(([key, value]) => {
             if (!value){
                 console.log(chalk.green(`${"  ".repeat(deep)}📄${key}`))
             }
             else{
                 console.log(chalk.yellow(`${"  ".repeat(deep)}📂${key}`))
                 displayItems(value, deep+1)
             }
        })
    }
    displayItems(tree, 0)
}

function getFilesPath(tree, rootPath){
    let paths = [];
    Object.entries(tree).forEach(([key, value]) => {
        if (!value){
            paths.push(path.join(rootPath, key));
        }
        else{
            paths = [...paths, ...getFilesPath(value, path.join(rootPath, key))];
        }

    })
    return paths
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function output(filePaths){
    const outputFilePath = './output.txt';
    let outputContent = '';
    filePaths.forEach((filePath) => {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                return;
            }

            // Get file metadata
            const stats = fs.statSync(filePath);
            const fileName = path.basename(filePath);
            const fileSize = formatBytes(stats.size);

            // Read file content
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Append metadata and content to output
            outputContent += `${"-".repeat(50)}\n${"-".repeat(50)}\n`;
            outputContent += "Info:\n"
            outputContent += `${"-".repeat(50)}\n${"-".repeat(50)}\n`;
            outputContent += `File Name: ${fileName}\n`;
            outputContent += `File Size: ${fileSize}\n`;
            outputContent += `File Path: ${filePath}\n`;
            outputContent += `${"-".repeat(50)}\n${"-".repeat(50)}\n`;
            outputContent += "Content:\n"
            outputContent += `${"-".repeat(50)}\n${"-".repeat(50)}\n`;
            outputContent += fileContent + '\n\n';
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error.message);
        }
    });

    // Write the final content to the output file
    fs.writeFileSync(outputFilePath, outputContent, 'utf-8');
    console.log(`Output written to ${outputFilePath}`);
}

const IGNORED_FILES = [...DEFAULT_IGNORES, ...loadIgnoreFile()];
const tree = getFileTree(PROJECT_ROOT, IGNORED_FILES)
displayTree(tree);
output(getFilesPath(tree, PROJECT_ROOT))
