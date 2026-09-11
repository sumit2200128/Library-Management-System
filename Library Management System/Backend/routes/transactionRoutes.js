const express = require("express");
const router = express.Router();
const {
  issueBook,
  returnBook,
  payFine
} = require("../controllers/transactionController");

router.post("/issue", issueBook);
router.post("/return", returnBook);
router.post("/payfine", payFine);

module.exports = router;
