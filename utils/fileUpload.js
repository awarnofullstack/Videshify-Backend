const { baseUpload } = require("../storage/baseUploads");


const makeMoved = (files) => {
    const uploadPath = baseUpload + files.name;
    files.mv(uploadPath)
    return files.name;
}


module.exports = { makeMoved }