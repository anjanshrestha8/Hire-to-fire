const ServiceError = require("../utils/serviceError");
const technicalInterviewService = require("../services/technicalInterview.service");

exports.sendTechnicalAssessmentEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, instructions } = request.body;

  try {
    const result = await technicalInterviewService.sendTechnicalAssessmentEmail(
      id,
      { interviewDate, interviewTime, instructions }
    );
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Send technical assessment email error:", error);
    response.status(500).json({
      error: "Failed to schedule interview and email",
    });
  }
};

exports.submitTechnicalAssessment = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const result = await technicalInterviewService.submitTechnicalAssessment(
      candidateId,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json(error.body);
    }
    console.error("Technical assessment submission error:", error);
    return res.status(500).json({
      error: "Failed to submit technical assessment",
      details: error.message,
    });
  }
};

exports.getTechnicalAssessment = async (request, response) => {
  const { candidateId } = request.params;

  try {
    const result =
      await technicalInterviewService.getTechnicalAssessment(candidateId);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Get technical assessment error:", error);
    response.status(500).json({
      error: "Failed to retrieve technical assessment",
    });
  }
};

exports.sendTechnicalInterviewPassedEmail = async (request, response) => {
  const { id } = request.params;

  try {
    const result =
      await technicalInterviewService.sendTechnicalInterviewPassedEmail(id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Technical interview passed email error:", error);
    response.status(500).json({
      error: "Failed to send technical interview passed email",
    });
  }
};
