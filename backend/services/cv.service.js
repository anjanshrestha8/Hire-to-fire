require("dotenv").config();
const { Candidate, Job, AiScreening } = require("../models/index");
const sendMail = require("../utils/mailer");
const screenCV = require("./aiScreeningService");
const ServiceError = require("../utils/serviceError");

async function approveCVAndSchedule(id) {
  const candidate = await Candidate.findByPk(id, {
    include: {
      model: Job,
      attributes: ["title", "company"],
    },
  });

  if (!candidate) {
    throw new ServiceError(404, {
      error: "Candidate not found",
    });
  }

  await candidate.update({
    cvStatus: "Passed",
    currentRound: "Technical Interview",
  });

  const today = new Date();
  const techInterviewDate = new Date(today);
  let addedDays = 0;
  while (addedDays < 2) {
    techInterviewDate.setDate(techInterviewDate.getDate() + 1);
    const day = techInterviewDate.getDay();
    if (day !== 0 && day !== 6) addedDays++;
  }
  techInterviewDate.setHours(11, 30, 0, 0);
  const formattedDate = techInterviewDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  await sendMail({
    to: candidate.email,
    subject: `Congratulations! CV Approved - ${
      candidate.Job?.title || "Position"
    }`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Congratulations!</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Great news! Your application for the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong> has passed our initial CV screening.</p>

          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Next Steps</h3>
            <p>Your technical interview is scheduled on <strong>${formattedDate}</strong>. Please ensure you are ready at the scheduled time.</p>
          </div>

          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Technical interview on <strong>${formattedDate}</strong></li>
            <li>Take-home technical assessment</li>
            <li>Clear instructions and timeline will be provided</li>
          </ul>

          <p>Thank you for your patience, and congratulations again on this important milestone!</p>
          <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
        </div>
      `,
  });

  return {
    message: "CV approved and congratulations email sent successfully",
    data: {
      candidateId: candidate.id,
      cvStatus: "Passed",
      currentRound: "Technical Interview",
      techInterviewDate: formattedDate,
      emailSent: true,
    },
  };
}

async function runAIScreening(id) {
  const candidate = await Candidate.findByPk(id);
  if (!candidate) {
    throw new ServiceError(404, { error: "Candidate not found" });
  }

  const aiResult = await screenCV(candidate);

  console.log(aiResult);

  console.log(
    aiResult.score,
    aiResult.decision,
    aiResult.strengths,
    aiResult.weaknesses
  );

  const aiRecord = await AiScreening.create({
    candidateId: candidate.id,
    score: aiResult.score,
    decision: aiResult.decision,
    feedback: `Strengths: ${aiResult.strengths.join(
      ", "
    )} | Weaknesses: ${aiResult.weaknesses.join(", ")}`,
  });

  await candidate.update({
    cvStatus: aiResult.decision === "Pass" ? "Passed" : "Failed",
  });

  return {
    message: "AI screening completed",
    aiRecord,
  };
}

module.exports = {
  approveCVAndSchedule,
  runAIScreening,
};
