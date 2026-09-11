const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  membershipNo: { type: String, required: true, unique: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active"
  }
});

module.exports = mongoose.model("Membership", MembershipSchema);
