require("dotenv").config();
const { Candidate, Job } = require("../models/index");
const sendMail = require("../utils/mailer");
const {
  scheduleTechnicalAssessmentEmail,
} = require("../utils/emailScheduler");

exports.sendTechnicalAssessmentEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, instructions } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ["title", "company"],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: "Candidate not found" });
    }

    if (candidate.cvStatus !== "Passed") {
      return response.status(403).json({
        error: "Candidate is not eligible for technical assessment yet",
      });
    }

    await candidate.update({
      interviewDate,
      interviewTime,
    });

    const assessmentLink = `http://localhost:5173/technical-assessment/${candidate.id}`;
    const interviewDateTime =
      interviewDate && interviewTime
        ? `${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}`
        : "To be confirmed";

    const subject = `Technical Interview Scheduled - ${
      candidate.Job?.title || "Position"
    }`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Technical Interview Invitation</h2>
        <p>Hi <strong>${candidate.name}</strong>,</p>
        <p>You are invited to your <strong>Technical Interview</strong> for the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong>.</p>
        <p><strong>Date & Time:</strong> ${interviewDateTime}</p>

        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #333;">Instructions</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Click the assessment link below to start your interview</li>
            <li>Follow all on-screen instructions carefully</li>
            <li>Ensure a stable internet connection</li>
            <li>Complete the assessment within the given time limit</li>
          </ol>
        </div>

        <p><a href="${assessmentLink}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Start Technical Interview</a></p>

        <p>All the best for your interview!</p>
        <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
      </div>
    `;

    // 🔹 Instead of sending immediately, schedule the email
    scheduleTechnicalAssessmentEmail(
      candidate,
      subject,
      html,
      interviewDate,
      interviewTime
    );

    response.status(200).json({
      message:
        "Technical interview scheduled. Email will be sent at the scheduled time.",
      data: {
        candidateId: candidate.id,
        interviewDate,
        interviewTime,
        emailScheduled: true,
      },
    });
  } catch (error) {
    console.error("Send technical assessment email error:", error);
    response.status(500).json({
      error: "Failed to schedule interview and email",
    });
  }
};

exports.submitTechnicalAssessment = async (req, res) => {
  const { candidateId } = req.params;
  const { userInfo, answers, testResults, timeSpent, completedAt } = req.body;
  const sanitizedAnswers = {};
  for (const [qIndex, code] of Object.entries(answers || {})) {
    sanitizedAnswers[qIndex] = code && code.trim() ? code : "";
  }
  try {
    // Lookup candidate by numeric ID only
    const candidate = await Candidate.findByPk(candidateId);
    console.log(candidateId, candidate);

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Update technical assessment data
    await candidate.update({
      technicalAssessment: {
        userInfo,
        answers: sanitizedAnswers,
        testResults,
        timeSpent,
        completedAt,
        submittedAt: new Date(),
        status: "completed",
      },
    });

    // Send email notifications if job exists
    const job = await Job.findByPk(candidate.jobId);
    if (job) {
      // Email to candidate
      await sendMail({
        to: candidate.email,
        subject: `Technical Assessment Submitted - ${job.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Assessment Submitted Successfully</h2>
            <p>Your technical assessment for <strong>${job.title}</strong> has been successfully submitted.</p>
            <p>We will review your submission and get back to you soon.</p>
            <p>Best regards,<br/>HR Team</p>
          </div>
        `,
      });

      // Email to HR/admin
      await sendMail({
        to: "anjanshrestha2002@gmail.com",
        subject: `Technical Assessment Completed - ${job.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Technical Assessment Completed</h2>
            <p>A candidate has completed their technical assessment for <strong>${
              job.title
            }</strong>.</p>
            <p>Please review the submission in the HR dashboard.</p>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      message: "Technical assessment submitted successfully",
      data: {
        candidateId: candidate.id,
        submittedAt: new Date(),
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Technical assessment submission error:", error);
    return res.status(500).json({
      error: "Failed to submit technical assessment",
      details: error.message,
    });
  }
};

exports.getTechnicalAssessment = async (request, response) => {
  const { candidateId } = request.params;
  console.log("Fetching technical assessment for candidate ID:", candidateId);

  try {
    const candidate = await Candidate.findByPk(candidateId, {
      include: {
        model: Job,
        attributes: ["title", "company"],
      },
    });

    if (!candidate) {
      return response.status(404).json({
        error: "Candidate not found",
      });
    }

    if (!candidate.technicalAssessment) {
      return response.status(404).json({
        error: "Technical assessment not found",
      });
    }

    response.status(200).json({
      message: "Technical assessment retrieved successfully",
      data: {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
        },
        job: candidate.Job,
        assessment: candidate.technicalAssessment,
      },
    });
  } catch (error) {
    console.error("Get technical assessment error:", error);
    response.status(500).json({
      error: "Failed to retrieve technical assessment",
    });
  }
};

exports.sendTechnicalInterviewPassedEmail = async (request, response) => {
  const { id } = request.params;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ["title", "company"],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: "Candidate not found" });
    }

    if (candidate.techStatus === "Passed") {
      return response.status(400).json({
        error: "Candidate already marked as passed",
      });
    }

    // Update candidate status to "Technical Interview Passed" and set next round
    await candidate.update({
      techStatus: "Passed",
      currentRound: "HR Interview",
    });

    // Calculate HR interview date (2 business days from today) at 11:30 AM
    const today = new Date();
    const hrInterviewDate = new Date(today);
    let addedDays = 0;
    while (addedDays < 2) {
      hrInterviewDate.setDate(hrInterviewDate.getDate() + 1);
      const day = hrInterviewDate.getDay();
      if (day !== 0 && day !== 6) addedDays++; // skip weekends
    }
    hrInterviewDate.setHours(11, 30, 0, 0); // 11:30 AM
    const formattedDate = hrInterviewDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    // Send congratulations email with HR interview date
    await sendMail({
      to: candidate.email,
      subject: `Congratulations! You Passed the Technical Interview - ${
        candidate.Job?.title || "Position"
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Congratulations!</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Fantastic news! You have successfully passed the <strong>Technical Interview</strong> for the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong>.</p>

          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Next Steps</h3>
            <p>Your next round is the <strong>HR Interview</strong>, scheduled on <strong>${formattedDate}</strong>. Please be prepared and ensure your availability at the scheduled time.</p>
          </div>

          <p>Thank you for your efforts, and congratulations again!</p>
          <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
        </div>
      `,
    });

    response.status(200).json({
      message:
        "Candidate marked as passed and HR interview email sent successfully",
      data: {
        candidateId: candidate.id,
        techStatus: "Passed",
        currentRound: "HR Interview",
        hrInterviewDate: formattedDate,
        emailSent: true,
      },
    });
  } catch (error) {
    console.error("Technical interview passed email error:", error);
    response.status(500).json({
      error: "Failed to send technical interview passed email",
    });
  }
};
