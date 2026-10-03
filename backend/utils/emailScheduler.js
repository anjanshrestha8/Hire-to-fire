const schedule = require('node-schedule');
const sendMail = require('./mailer');

exports.scheduleTechnicalAssessmentEmail = (
  candidate,
  subject,
  htmlContent,
  interviewDate,
  interviewTime
) => {
  // Build a JS Date object for scheduling
  const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}`);

  // Schedule the email
  schedule.scheduleJob(scheduledDateTime, async () => {
    try {
      await sendMail({
        to: candidate.email,
        subject,
        html: htmlContent,
      });
      console.log(
        `Scheduled email sent to ${candidate.email} at ${scheduledDateTime}`
      );
    } catch (err) {
      console.error(`Failed to send scheduled email:`, err.message);
    }
  });
};

exports.scheduleHRInterviewEmail = (
  candidate,
  subject,
  htmlContent,
  interviewDate,
  interviewTime
) => {
  // Build a JS Date object for scheduling
  const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}`);

  // Schedule the email
  schedule.scheduleJob(scheduledDateTime, async () => {
    try {
      await sendMail({
        to: candidate.email,
        subject,
        html: htmlContent,
      });
      console.log(
        `Scheduled HR interview email sent to ${candidate.email} at ${scheduledDateTime}`
      );
    } catch (err) {
      console.error(
        `Failed to send scheduled HR interview email:`,
        err.message
      );
    }
  });
};
