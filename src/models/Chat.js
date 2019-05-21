const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
    publicKey : {type:String},
    privateKey: {type:String},
    mensajes: [{
        content: { type: String },
        date: { type: Date, default: Date.now },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    usuarios: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = model('Chat', chatSchema);