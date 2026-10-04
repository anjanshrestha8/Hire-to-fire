const ServiceError = require('../utils/serviceError');
const jobService = require('../services/job.service');

exports.createJob = async (request, response) => {
  try {
    const result = await jobService.createJob(request.body);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getAllJobs = async (request, response) => {
  try {
    const jobs = await jobService.getAllJobs();
    if (jobs.length < 1) {
      response.status(200).json({
        data: [],
        message: 'No jobs to display.',
      });
    }
    response.status(200).json({
      data: jobs,
      message: 'All jobs are displayed.',
    });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getJobsById = async (request, response) => {
  const id = request.params.id;

  if (!id) {
    response.status(400).json({
      data: [],
      message: 'Bad Request. Param is missing!!!!',
    });
  }
  try {
    const result = await jobService.getJobById(id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.updateJob = async (request, response) => {
  const id = request.params.id;
  if (!id) {
    response.status(400).json({
      message: 'Bad Request. Job ID is missing.',
    });
  }
  try {
    const result = await jobService.updateJob(id, request.body);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    response.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteJob = async (request, response) => {
  const id = request.params.id;
  if (!id) {
    response.status(400).json({
      message: 'Bad Request. Job ID is missing.',
    });
  }
  try {
    const result = await jobService.deleteJob(id);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return response.status(error.statusCode).json(error.body);
    }
    response.status(500).json({ error: 'Internal server error.' });
  }
};
