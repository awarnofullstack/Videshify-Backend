const fs = require('fs');
const path = require('path');

const { baseUpload } = require("../storage/baseUploads");

function removeFile(filePath) {
    try {
        const fullPath = path.join(baseUpload, filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}

module.exports = { removeFile };
