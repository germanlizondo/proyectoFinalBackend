const { Schema, model } = require('mongoose');

const followedSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    followedby: [{ type: Schema.Types.ObjectId, ref: 'User' }]

});

module.exports = model('Followed', followedSchema);