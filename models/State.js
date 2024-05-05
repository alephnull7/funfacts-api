const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const schema = new Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funfacts: {
        type: [String],
        default: []
    }
});

const State = model('State', schema);
module.exports = State;
