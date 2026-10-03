require('dotenv').config();
const { Candidate, Job, AiScreening } = require('../models/index');
const sendMail = require('../utils/mailer');
const screenCV = require('../services/aiScreeningService');
const {
  scheduleTechnicalAssessmentEmail,
  scheduleHRInterviewEmail,
} = require('../utils/emailScheduler');

exports.applyForJob = async (request, response) => {
  const { name, email, jobId, phone } = request.body;

  try {
    const job = await Job.findByPk(jobId);
    if (!job) {
      return response.status(404).json({ error: 'Job not found' });
    }

    if (!request.file) {
      return response.status(400).json({ error: 'CV file is required' });
    }

    const candidate = await Candidate.create({
      name,
      email,
      jobId,
      phone,
      cvLink: request.file.path,
    });

    // Email to HR
    try {
      await sendMail({
        to: 'anjanshrestha2002@gmail.com',
        subject: `New Application Received - ${job.title}`,
        text: `${name} has applied for the position of ${job.title} at ${job.company}. Please review the candidate's profile.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6c757d;">New Candidate Application</h2>
        <p>A new candidate has applied for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #6c757d; border-radius: 6px; margin: 20px 0;">
          <p><strong>Candidate Name:</strong> ${name}</p>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Company:</strong> ${job.company}</p>
        </div>

        <p>Please log in to the system to review the full candidate profile and proceed with the next steps.</p>
        <p>Best regards,<br/>Application System</p>
      </div>
    `,
      });
      console.log('HR email sent successfully');
    } catch (err) {
      console.error('Failed to send HR email:', err);
    }

    // Email to Candidate
    try {
      await sendMail({
        to: email,
        subject: `Application Received – ${job.title}`,
        text: `Hello ${name},\n\nThank you for applying for the ${job.title} position at ${job.company}. We have received your application and our recruitment team will review it shortly.\n\nIf your profile matches our requirements, we’ll be in touch with next steps.\n\nBest regards,\n${job.company} Recruitment Team`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6c757d;">Application Confirmation</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for applying for the <strong>${job.title}</strong> position at <strong>${job.company}</strong>.</p>
        <p>We have successfully received your application. Our recruitment team will review your profile, and if it aligns with our current needs, we will reach out to you for the next steps.</p>
        <p>We appreciate your interest in joining our team and the time you took to apply.</p>
        <p>Best regards,<br/>Recruitment Team<br/><strong>${job.company}</strong></p>
      </div>
    `,
      });
      console.log('Candidate email sent successfully');
    } catch (err) {
      console.error('Failed to send candidate email:', err);
    }

    response.status(201).json({
      message: 'Application submitted and emails sent',
      data: candidate,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((e) => e.message);
      return response.status(400).json({ errors });
    }
    console.error(error);
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getAllCandidates = async (request, response) => {
  try {
    const candidates = await Candidate.findAll({
      include: {
        model: Job,
        attributes: ['title'],
      },
    });
    if (candidates.length < 1) {
      response.status(200).json({
        data: [],
        message: 'No candidates to display.',
      });
    }
    response.status(200).json({
      data: candidates,
      message: 'All candidates are displayed.',
    });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getCandidatesById = async (request, response) => {
  const id = request.params.id;
  if (!id) {
    response.status(400).json({
      data: [],
      message: 'Bad Request. Param is missing!!!!',
    });
  }
  try {
    const candidate = await Candidate.findByPk(id, {
      include: [
        {
          model: Job,
          attributes: [
            'title',
            'location',
            'requirements',
            'type',
            'company',
            'salary',
            'posted',
          ],
        },
        {
          model: AiScreening,
          as: 'aiScreenings',
          attributes: ['decision', 'feedback', 'score', 'createdAt'],
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!candidate) {
      response.status(404).json({
        data: [],
        message: 'Candidates not found!!!!',
      });
    }

    const cvLink = candidate.cvLink
      ? `${request.protocol}://${request.get('host')}/${candidate.cvLink}`
      : null;

    response.status(200).json({
      message: 'Candidate fetched successfully',
      data: {
        ...candidate.toJSON(),
        cvLink,
      },
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCandidate = async (request, response) => {
  const { id } = request.params;
  const updatePayload = request.body;

  if (!id) {
    return response.status(400).json({
      data: [],
      message: 'Bad Request. Candidate ID is missing!!!!',
    });
  }

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({
        data: [],
        message: 'Candidate not found!!!!',
      });
    }

    console.log(updatePayload);

    Object.keys(updatePayload).forEach((key) => {
      candidate[key] = updatePayload[key];
    });
    await candidate.save();

    response.status(200).json({
      data: candidate,
      message: 'Candidate is updated successfully.',
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    response.status(500).json({
      error: 'Internal server error.',
    });
  }
};

exports.runAIScreening = async (request, response) => {
  try {
    const { id } = request.params;

    const candidate = await Candidate.findByPk(id);
    if (!candidate)
      return response.status(404).json({ error: 'Candidate not found' });

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
        ', '
      )} | Weaknesses: ${aiResult.weaknesses.join(', ')}`,
    });

    // Update candidate CV status
    await candidate.update({
      cvStatus: aiResult.decision === 'Pass' ? 'Passed' : 'Failed',
    });

    response.status(200).json({
      message: 'AI screening completed',
      aiRecord,
    });
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: err.message });
  }
};



exports.submitTechnicalAssessment = async (req, res) => {
  const { candidateId } = req.params;
  const { userInfo, answers, testResults, timeSpent, completedAt } = req.body;
  const sanitizedAnswers = {};
  for (const [qIndex, code] of Object.entries(answers || {})) {
    sanitizedAnswers[qIndex] = code && code.trim() ? code : '';
  }
  try {
    // Lookup candidate by numeric ID only
    const candidate = await Candidate.findByPk(candidateId);
    console.log(candidateId, candidate);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
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
        status: 'completed',
      },
      technicalStatus: 'Completed',
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
      message: 'Technical assessment submitted successfully',
      data: {
        candidateId: candidate.id,
        submittedAt: new Date(),
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('Technical assessment submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit technical assessment',
      details: error.message,
    });
  }
};

exports.getTechnicalAssessment = async (request, response) => {
  const { candidateId } = request.params;

  try {
    const candidate = await Candidate.findByPk(candidateId, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({
        error: 'Candidate not found',
      });
    }

    if (!candidate.technicalAssessment) {
      return response.status(404).json({
        error: 'Technical assessment not found',
      });
    }

    response.status(200).json({
      message: 'Technical assessment retrieved successfully',
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
    console.error('Get technical assessment error:', error);
    response.status(500).json({
      error: 'Failed to retrieve technical assessment',
    });
  }
};

exports.sendTechnicalAssessmentEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, instructions } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.cvStatus !== 'Passed') {
      return response.status(403).json({
        error: 'Candidate is not eligible for technical assessment yet',
      });
    }

    await candidate.update({
      interviewDate,
      interviewTime,
    });

    const assessmentLink = `${process.env.FRONTEND_URL}/technical-assessment/${candidate.id}`;
    const interviewDateTime =
      interviewDate && interviewTime
        ? `${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}`
        : 'To be confirmed';

    const subject = `Technical Interview Scheduled - ${
      candidate.Job?.title || 'Position'
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
        'Technical interview scheduled. Email will be sent at the scheduled time.',
      data: {
        candidateId: candidate.id,
        interviewDate,
        interviewTime,
        emailScheduled: true,
      },
    });
  } catch (error) {
    console.error('Send technical assessment email error:', error);
    response.status(500).json({
      error: 'Failed to schedule interview and email',
    });
  }
};

exports.submitTechnicalAssessment = async (req, res) => {
  const { candidateId } = req.params;
  const { userInfo, answers, testResults, timeSpent, completedAt } = req.body;
  const sanitizedAnswers = {};
  for (const [qIndex, code] of Object.entries(answers || {})) {
    sanitizedAnswers[qIndex] = code && code.trim() ? code : '';
  }
  try {
    // Lookup candidate by numeric ID only
    const candidate = await Candidate.findByPk(candidateId);
    console.log(candidateId, candidate);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
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
        status: 'completed',
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
      message: 'Technical assessment submitted successfully',
      data: {
        candidateId: candidate.id,
        submittedAt: new Date(),
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('Technical assessment submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit technical assessment',
      details: error.message,
    });
  }
};

exports.getTechnicalAssessment = async (request, response) => {
  const { candidateId } = request.params;
  console.log('Fetching technical assessment for candidate ID:', candidateId);

  try {
    const candidate = await Candidate.findByPk(candidateId, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({
        error: 'Candidate not found',
      });
    }

    if (!candidate.technicalAssessment) {
      return response.status(404).json({
        error: 'Technical assessment not found',
      });
    }

    response.status(200).json({
      message: 'Technical assessment retrieved successfully',
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
    console.error('Get technical assessment error:', error);
    response.status(500).json({
      error: 'Failed to retrieve technical assessment',
    });
  }
};

exports.sendTechnicalInterviewPassedEmail = async (request, response) => {
  const { id } = request.params;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.techStatus === 'Passed') {
      return response.status(400).json({
        error: 'Candidate already marked as passed',
      });
    }

    // Update candidate status to "Technical Interview Passed" and set next round
    await candidate.update({
      techStatus: 'Passed',
      currentRound: 'HR Interview',
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
    const formattedDate = hrInterviewDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    // Send congratulations email with HR interview date
    await sendMail({
      to: candidate.email,
      subject: `Congratulations! You Passed the Technical Interview - ${
        candidate.Job?.title || 'Position'
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
        'Candidate marked as passed and HR interview email sent successfully',
      data: {
        candidateId: candidate.id,
        techStatus: 'Passed',
        currentRound: 'HR Interview',
        hrInterviewDate: formattedDate,
        emailSent: true,
      },
    });
  } catch (error) {
    console.error('Technical interview passed email error:', error);
    response.status(500).json({
      error: 'Failed to send technical interview passed email',
    });
  }
};

exports.sendHRInterviewEmail = async (request, response) => {
  const { id } = request.params;
  const { interviewDate, interviewTime, meetLink, instructions } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.techStatus !== 'Passed') {
      return response.status(403).json({
        error: 'Candidate must pass technical interview first',
      });
    }

    // Update candidate with HR interview details
    await candidate.update({
      hrInterviewDate: interviewDate,
      hrInterviewTime: interviewTime,
      hrMeetLink: meetLink,
    });

    const interviewDateTime = `${new Date(
      interviewDate
    ).toLocaleDateString()} at ${interviewTime}`;

    const subject = `HR Interview Scheduled - ${
      candidate.Job?.title || 'Position'
    }`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">HR Interview Invitation</h2>
        <p>Hi <strong>${candidate.name}</strong>,</p>
        <p>Congratulations on passing the technical interview! You are now invited to the <strong>HR Interview</strong> for the position of <strong>${
          candidate.Job?.title
        }</strong> at <strong>${candidate.Job?.company}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin-top: 0; color: #333;">Interview Details</h3>
          <p><strong>Date & Time:</strong> ${interviewDateTime}</p>
          <p><strong>Google Meet Link:</strong> <a href="${meetLink}" style="color: #007bff;">${meetLink}</a></p>
        </div>

        ${
          instructions
            ? `
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #856404;">Special Instructions</h3>
          <p style="margin: 0;">${instructions}</p>
        </div>
        `
            : ''
        }

        <p>Please join the meeting at the scheduled time. This interview will focus on cultural fit, career goals, and company values.</p>
        <p>Best of luck!</p>
        <p>Best regards,<br/>HR Team<br/><strong>${
          candidate.Job?.company
        }</strong></p>
      </div>
    `;

    scheduleHRInterviewEmail(
      candidate,
      subject,
      html,
      interviewDate,
      interviewTime
    );

    // Send immediate notification to HR team
    await sendMail({
      to: "anjanshrestha2002@gmail.com",
      subject: `HR Interview Scheduled - ${candidate.name} for ${candidate.Job?.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>HR Interview Scheduled</h2>
          <p>HR Interview has been scheduled for <strong>${
            candidate.name
          }</strong> for the position of <strong>${
        candidate.Job?.title
      }</strong>.</p>
          <p><strong>Date & Time:</strong> ${interviewDateTime}</p>
          <p><strong>Google Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>
          ${
            instructions
              ? `<p><strong>Instructions:</strong> ${instructions}</p>`
              : ""
          }
          <p>Candidate email will be sent automatically at the scheduled time.</p>
        </div>
      `,
    });

    response.status(200).json({
      message:
        'HR interview scheduled. Email will be sent to candidate at the scheduled time.',
      data: {
        candidateId: candidate.id,
        interviewDate,
        interviewTime,
        meetLink,
        emailScheduled: true,
      },
    });
  } catch (error) {
    console.error('HR interview scheduling error:', error);
    response.status(500).json({
      error: 'Failed to schedule HR interview and email',
    });
  }
};

exports.sendHRInterviewPassedEmail = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch candidate with associated Job
    const candidate = await Candidate.findByPk(id, {
      include: { model: Job, attributes: ['title', 'company'] },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.hrStatus === 'Passed') {
      return res.status(400).json({
        error: 'Candidate already marked as HR interview passed',
      });
    }

    console.log('Candidate before update:', candidate.toJSON());

    // Update candidate status
    await candidate.update({
      hrStatus: 'Passed',
      currentRound: 'Completed',
      overallStatus: 'Selected',
    });

    console.log('Candidate updated successfully.');

    // Prepare job info
    const jobTitle = candidate.Job?.title || 'Position';
    const companyName = candidate.Job?.company || 'Company';

    // Send candidate email
    try {
      await sendMail({
        to: candidate.email,
        subject: `HR Interview Completed - ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Congratulations!</h2>
            <p>Hi <strong>${candidate.name}</strong>,</p>
            <p>You have successfully completed the HR interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
          </div>
        `,
      });
      console.log('Candidate email sent.');
    } catch (err) {
      console.error('Failed to send candidate email:', err);
    }

    // Send HR notification email
    try {
      await sendMail({
        to: "anjanshrestha2002@gmail.com",
        subject: `Candidate HR Interview Passed - ${candidate.name}`,
        html: `<p>Candidate ${candidate.name} has passed the HR interview for ${jobTitle} at ${companyName}.</p>`,
      });
      console.log('HR email sent.');
    } catch (err) {
      console.error('Failed to send HR email:', err);
    }

    // Return success
    return res.status(200).json({
      message: 'Candidate HR status updated and emails sent',
      data: {
        candidateId: candidate.id,
        hrStatus: 'Passed',
        currentRound: 'Completed',
        overallStatus: 'Completed',
      },
    });
  } catch (error) {
    console.error('HR interview passed handler error:', error);
    return res.status(500).json({
      error: 'Internal server error. Failed to process HR interview.',
    });
  }
};

exports.sendCVRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status to rejected
    await candidate.update({
      cvStatus: 'Failed',
      overallStatus: 'Rejected',
      rejectionReason: rejectionReason,
    });

    // Get rejection reason text
    const rejectionReasons = {
      insufficient_experience: 'insufficient experience for this role',
      missing_skills: 'missing required technical skills',
      education_requirements: 'education requirements not met',
      overqualified: 'overqualified for this position',
      other: 'other factors',
    };

    const reasonText =
      rejectionReasons[rejectionReason] || 'application review';

    // Send rejection email to candidate
    await sendMail({
      to: candidate.email,
      subject: `Application Update - ${candidate.Job?.title || 'Position'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6c757d;">Application Update</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Thank you for your interest in the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d;">
            <p>After careful review of your application, we have decided not to move forward with your candidacy at this time due to ${reasonText}.</p>
          </div>

          <p>We appreciate the time and effort you put into your application. We encourage you to apply for future opportunities that may be a better match for your background and experience.</p>
          <p>We wish you the best of luck in your job search.</p>
          <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
        </div>
      `,
    });

    response.status(200).json({
      message: 'CV rejection email sent successfully',
      data: {
        candidateId: candidate.id,
        cvStatus: 'Failed',
        overallStatus: 'Rejected',
        emailSent: true,
      },
    });
  } catch (error) {
    console.error('CV rejection email error:', error);
    response.status(500).json({
      error: 'Failed to send CV rejection email',
    });
  }
};

exports.sendTechnicalRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status to rejected
    await candidate.update({
      techStatus: 'Failed',
      overallStatus: 'Rejected',
      rejectionReason: rejectionReason,
    });

    // Get rejection reason text
    const rejectionReasons = {
      insufficient_experience: 'insufficient technical experience',
      missing_skills: 'missing required technical skills',
      education_requirements: 'technical requirements not met',
      overqualified: 'overqualified for this technical role',
      other: 'technical assessment results',
    };

    const reasonText =
      rejectionReasons[rejectionReason] || 'technical evaluation';

    // Send rejection email to candidate
    await sendMail({
      to: candidate.email,
      subject: `Technical Interview Update - ${
        candidate.Job?.title || 'Position'
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6c757d;">Technical Interview Update</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Thank you for completing the technical interview for the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d;">
            <p>After careful evaluation of your technical assessment, we have decided not to proceed with your application at this time due to ${reasonText}.</p>
          </div>

          <p>We appreciate your time and effort in completing the technical assessment. Your skills and experience are valuable, and we encourage you to continue developing and applying for roles that match your expertise.</p>
          <p>We wish you success in your career journey.</p>
          <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
        </div>
      `,
    });

    response.status(200).json({
      message: 'Technical rejection email sent successfully',
      data: {
        candidateId: candidate.id,
        techStatus: 'Failed',
        overallStatus: 'Rejected',
        emailSent: true,
      },
    });
  } catch (error) {
    console.error('Technical rejection email error:', error);
    response.status(500).json({
      error: 'Failed to send technical rejection email',
    });
  }
};

exports.sendHRRejectionEmail = async (request, response) => {
  const { id } = request.params;
  const { rejectionReason } = request.body;

  try {
    const candidate = await Candidate.findByPk(id, {
      include: {
        model: Job,
        attributes: ['title', 'company'],
      },
    });

    if (!candidate) {
      return response.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status to rejected
    await candidate.update({
      hrStatus: 'Failed',
      overallStatus: 'Rejected',
      rejectionReason: rejectionReason,
    });

    // Get rejection reason text
    const rejectionReasons = {
      insufficient_experience: 'insufficient experience for our team culture',
      missing_skills: 'missing required soft skills or cultural fit',
      education_requirements: 'requirements not aligned with our needs',
      overqualified: 'overqualified for this role and team structure',
      other: 'HR interview evaluation',
    };

    const reasonText =
      rejectionReasons[rejectionReason] || 'final interview assessment';

    // Send rejection email to candidate
    await sendMail({
      to: candidate.email,
      subject: `Final Interview Update - ${candidate.Job?.title || 'Position'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6c757d;">Final Interview Update</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Thank you for taking the time to interview for the position of <strong>${candidate.Job?.title}</strong> at <strong>${candidate.Job?.company}</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d;">
            <h3 style="margin-top: 0; color: #333;">Interview Details</h3>
            <p>After careful consideration of all interview rounds, we have decided not to move forward with your application at this time due to ${reasonText}.</p>
          </div>

          <p>We were impressed by your qualifications and appreciate the time you invested in our interview process. We encourage you to apply for future opportunities that may be a better fit.</p>
          <p>Thank you again for your interest in joining our team.</p>
          <p>Best regards,<br/>HR Team<br/><strong>${candidate.Job?.company}</strong></p>
        </div>
      `,
    });

    response.status(200).json({
      message: 'HR rejection email sent successfully',
      data: {
        candidateId: candidate.id,
        hrStatus: 'Failed',
        overallStatus: 'Rejected',
        emailSent: true,
      },
    });
  } catch (error) {
    console.error('HR rejection email error:', error);
    response.status(500).json({
      error: 'Failed to send HR rejection email',
    });
  }
};
