const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    nickname: { type: String },
    email: { type: String },
    img: { type: String },
    password: { type: String },
    publicKey: { type: String },
    privateKey: { type: String },

});

module.exports = model('User', userSchema);