const candidateService = require("./candidate.service");

const technicalInterviewService = {
  sendTechnicalAssessmentEmail: async (id, body) => {
    return candidateService.sendTechnicalAssessmentEmail(id, body, {
      assessmentBaseUrl: "http://localhost:5173",
    });
  },

  submitTechnicalAssessment: async (candidateId, body) => {
    return candidateService.submitTechnicalAssessment(candidateId, body);
  },

  getTechnicalAssessment: async (candidateId) => {
    return candidateService.getTechnicalAssessment(candidateId);
  },

  sendTechnicalInterviewPassedEmail: async (id) => {
    return candidateService.sendTechnicalInterviewPassedEmail(id);
  },
};

module.exports = technicalInterviewService;
