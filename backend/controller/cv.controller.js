const ServiceError = require("../utils/serviceError");
const cvService = require("../services/cv.service");

exports.approveCVAndSchedule = async (request, response) => {
  try {
    const result = await cvService.approveCVAndSchedule(request.params.id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Approve CV and schedule error:", error);
    response.status(500).json({ error: "Failed to approve CV and send email" });
  }
};

exports.runAIScreening = async (request, response) => {
  try {
    const result = await cvService.runAIScreening(request.params.id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error(error);
    response.status(500).json({ error: error.message });
  }
};
