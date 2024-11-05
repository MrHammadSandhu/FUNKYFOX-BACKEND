const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
    buffer: Buffer,
})

const File = new mongoose.model("File", FileSchema)

module.exports = File