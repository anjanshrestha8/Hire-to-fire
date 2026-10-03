const express = require('express');
const router = express.Router();
const candidateController = require('../controller/candiate.controller');
const uploadCV = require('../middlewares/uploadCv');

router.post(
  '/apply',
  uploadCV.single('cvLink'),
  candidateController.applyForJob
);
router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidatesById);
router.patch('/:id', candidateController.updateCandidate);

// HR interview routes
router.post('/:id/send-hr-interview', candidateController.sendHRInterviewEmail);

router.post(
  '/:id/hr-interview-passed',
  candidateController.sendHRInterviewPassedEmail
);

// CV rejection route
router.post('/:id/cv-rejection', candidateController.sendCVRejectionEmail);

// Technical interview rejection route
router.post(
  '/:id/technical-rejection',
  candidateController.sendTechnicalRejectionEmail
);

// HR interview rejection route
router.post('/:id/hr-rejection', candidateController.sendHRRejectionEmail);

module.exports = router;
