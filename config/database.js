require('dotenv').config();
const mongoose = require('mongoose');

class Database {
    constructor() {
        this.uri = process.env.MONGO_URI;
    }

    async connectDB() {
        try {
            await mongoose.connect(this.uri);
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = new Database();
