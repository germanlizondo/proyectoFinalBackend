const { Schema, model } = require('mongoose');

const followingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    isfollowing: [{ type: Schema.Types.ObjectId, ref: 'User' }]

});

module.exports = model('Following', followingSchema);