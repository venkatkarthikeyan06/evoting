const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success'
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Activity', activitySchema); 