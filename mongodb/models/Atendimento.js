const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    conversationId: { type: String, unique: true },
    messages: [{ text: String, date: Date, context: String, misunderstood: Boolean }],
    rating: { type: String, enum: ['GOOD', 'BAD'] },
    reviewed: { type: Boolean, default: false },
    observations: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('atendimentos', schema);