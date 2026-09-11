const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["book", "movie"],
    default: "book"
  },
  name: { type: String, required: true },
  author: { type: String, required: true },
  serialNo: { type: String, required: true, unique: true },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model("Book", BookSchema);
