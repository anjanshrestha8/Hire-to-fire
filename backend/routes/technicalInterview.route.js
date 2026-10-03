const express = require('express');
const router = express.Router();
const technicalInterviewController = require('../controller/technicalInterview.controller');

router.post(
  "/:id/send",
  technicalInterviewController.sendTechnicalAssessmentEmail
);
router.post(
  "/:candidateId/submit",
  technicalInterviewController.submitTechnicalAssessment
);
router.get(
  "/:candidateId/",
  technicalInterviewController.getTechnicalAssessment
);

router.post(
  "/:id/passed",
  technicalInterviewController.sendTechnicalInterviewPassedEmail
);

module.exports = router;
