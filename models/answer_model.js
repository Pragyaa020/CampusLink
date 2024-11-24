// const mongoose = require("mongoose") ;

// const Answer = new mongoose.Schema({
//     answer: {
//         type: String,
//         required: true,
//     },
//     answeredBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',  // Assuming you have a User model to link the answerer to.
//         required: true,
//     },
//     questionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Question',
//         required: true,
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//     },
// },{timestamps: true}) ;

// const ANSWER = mongoose.model("Answer", Answer);

// module.exports = ANSWER ;

const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  answerText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Answer', AnswerSchema);