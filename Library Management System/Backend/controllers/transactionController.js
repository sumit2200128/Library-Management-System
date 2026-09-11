const Book = require("../models/Book");
const Issue = require("../models/Issue");
const Fine = require("../models/Fine");

// ISSUE BOOK
exports.issueBook = async (req, res) => {
  const { bookId, userId, issueDate, remarks } = req.body;

  if (!bookId || !userId || !issueDate)
    return res.status(400).json({ message: "Required fields missing" });

  const book = await Book.findById(bookId);
  if (!book || !book.available)
    return res.status(400).json({ message: "Book not available" });

  const issueDt = new Date(issueDate);
  const returnDt = new Date(issueDt);
  returnDt.setDate(returnDt.getDate() + 15);

  const issue = new Issue({
    bookId,
    userId,
    issueDate: issueDt,
    expectedReturnDate: returnDt,
    remarks
  });

  await issue.save();

  book.available = false;
  await book.save();

  res.json({ message: "Book issued successfully", returnDate: returnDt });
};

// RETURN BOOK
exports.returnBook = async (req, res) => {
  const { issueId, actualReturnDate } = req.body;

  if (!issueId || !actualReturnDate)
    return res.status(400).json({ message: "Required fields missing" });

  const issue = await Issue.findById(issueId).populate("bookId");
  if (!issue) return res.status(404).json({ message: "Issue record not found" });

  issue.actualReturnDate = new Date(actualReturnDate);
  await issue.save();

  const expected = issue.expectedReturnDate;
  const actual = issue.actualReturnDate;

  let fineAmount = 0;
  if (actual > expected) {
    const daysLate = Math.ceil((actual - expected) / (1000 * 60 * 60 * 24));
    fineAmount = daysLate * 5;
  }

  const fine = new Fine({
    issueId: issue._id,
    fineAmount
  });
  await fine.save();

  res.json({
    message: "Proceed to fine payment",
    fineAmount
  });
};

// PAY FINE
exports.payFine = async (req, res) => {
  const { fineId, paid, remarks } = req.body;

  const fine = await Fine.findById(fineId).populate({
    path: "issueId",
    populate: { path: "bookId" }
  });

  if (!fine) return res.status(404).json({ message: "Fine record not found" });

  if (fine.fineAmount > 0 && !paid)
    return res.status(400).json({ message: "Fine payment required" });

  fine.paid = true;
  fine.remarks = remarks;
  await fine.save();

  // make book available again
  fine.issueId.bookId.available = true;
  await fine.issueId.bookId.save();

  res.json({ message: "Book returned successfully" });
};
