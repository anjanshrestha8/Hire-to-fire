const ServiceError = require("../utils/serviceError");
const candidateService = require("../services/candidate.service");

function handleServiceError(response, error, fallbackMessage) {
  if (error instanceof ServiceError) {
    return response.status(error.statusCode).json(error.body);
  }
  console.error(error);
  return response.status(500).json(
    typeof fallbackMessage === "object"
      ? fallbackMessage
      : { error: fallbackMessage }
  );
}

exports.applyForJob = async (request, response) => {
  const { name, email, jobId, phone } = request.body;

  try {
    const result = await candidateService.applyForJob({
      name,
      email,
      jobId,
      phone,
      cvPath: request.file?.path,
    });
    response.status(201).json(result);
  } catch (error) {
    handleServiceError(response, error, "Internal server error.");
  }
};

exports.getAllCandidates = async (request, response) => {
  try {
    const candidates = await candidateService.fetchAllCandidates();
    if (candidates.length < 1) {
      response.status(200).json({
        data: [],
        message: "No candidates to display.",
      });
    }
    response.status(200).json({
      data: candidates,
      message: "All candidates are displayed.",
    });
  } catch (error) {
    response.status(500).json({ error: "Internal server error." });
  }
};

exports.getCandidatesById = async (request, response) => {
  const id = request.params.id;
  if (!id) {
    response.status(400).json({
      data: [],
      message: "Bad Request. Param is missing!!!!",
    });
  }
  try {
    const result = await candidateService.getCandidatesById(id, {
      protocol: request.protocol,
      host: request.get("host"),
    });
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCandidate = async (request, response) => {
  const { id } = request.params;
  const updatePayload = request.body;

  try {
    const result = await candidateService.updateCandidate(id, updatePayload);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Update candidate error:", error);
    response.status(500).json({
      error: "Internal server error.",
    });
  }
};

exports.runAIScreening = async (request, response) => {
  try {
    const { id } = request.params;
    const result = await candidateService.runAIScreening(id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error(error);
    response.status(500).json({ error: error.message });
  }
};

exports.submitTechnicalAssessment = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const result = await candidateService.submitTechnicalAssessment(
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
    const result = await candidateService.getTechnicalAssessment(candidateId);
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

exports.sendTechnicalAssessmentEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, instructions } = request.body;

  try {
    const result = await candidateService.sendTechnicalAssessmentEmail(id, {
      interviewDate,
      interviewTime,
      instructions,
    });
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

exports.sendTechnicalInterviewPassedEmail = async (request, response) => {
  const { id } = request.params;

  try {
    const result = await candidateService.sendTechnicalInterviewPassedEmail(id);
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

exports.sendHRInterviewEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, meetLink, instructions } = request.body;

  try {
    const result = await candidateService.sendHRInterviewEmail(id, {
      interviewDate,
      interviewTime,
      meetLink,
      instructions,
    });
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("HR interview scheduling error:", error);
    response.status(500).json({
      error: "Failed to schedule HR interview and email",
    });
  }
};

exports.sendHRInterviewPassedEmail = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await candidateService.sendHRInterviewPassedEmail(id);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json(error.body);
    }
    console.error("HR interview passed handler error:", error);
    return res.status(500).json({
      error: "Internal server error. Failed to process HR interview.",
    });
  }
};

exports.sendCVRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const result = await candidateService.sendCVRejectionEmail(id, {
      rejectionReason,
    });
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("CV rejection email error:", error);
    response.status(500).json({
      error: "Failed to send CV rejection email",
    });
  }
};

exports.sendTechnicalRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const result = await candidateService.sendTechnicalRejectionEmail(id, {
      rejectionReason,
    });
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("Technical rejection email error:", error);
    response.status(500).json({
      error: "Failed to send technical rejection email",
    });
  }
};

exports.sendHRRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const result = await candidateService.sendHRRejectionEmail(id, {
      rejectionReason,
    });
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    console.error("HR rejection email error:", error);
    response.status(500).json({
      error: "Failed to send HR rejection email",
    });
  }
};
