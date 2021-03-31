const mongoose = require('mongoose');
let Schema = mongoose.Schema;

var excelSchema = new Schema({
    Name: {
        type: String,
        required: 'This field is required..'
    },
    Address: {
        type: String,
        required: 'This field is required..'
    },
    Age: {
        type: String,
        required: 'This field is required..'
    },
    Username: {
        type: String,
        required: 'This field is required..'
    }
});

module.exports = mongoose.model('Excel', excelSchema);