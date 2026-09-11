const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
  fineAmount: Number,
  paid: { type: Boolean, default: false },
  remarks: String
});

module.exports = mongoose.model("Fine", FineSchema);
