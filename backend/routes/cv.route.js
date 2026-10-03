const express = require("express");
const router = express.Router();
const cvController  = require("../controller/cv.controller")

router.post("/:id/screen-cv", cvController.runAIScreening);
router.post("/:id/approve-and-schedule", cvController.approveCVAndSchedule);

module.exports = router;
