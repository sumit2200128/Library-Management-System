const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  issueDate: { type: Date, required: true },
  expectedReturnDate: { type: Date, required: true },
  actualReturnDate: { type: Date },
  remarks: String
});

module.exports = mongoose.model("Issue", IssueSchema);
