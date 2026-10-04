const ServiceError = require("../utils/serviceError");
const Job = require("../models/index");

function mapSequelizeValidationError(error) {
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((e) => e.message);
    throw new ServiceError(400, { errors });
  }
  throw error;
}

const jobService = {
  createJob: async (body) => {
    try {
      const job = await Job.create(body);
      return {
        data: job,
        message: "Job is created sucessfully.",
      };
    } catch (error) {
      mapSequelizeValidationError(error);
    }
  },

  getAllJobs: async () => {
    return Job.findAll();
  },

  getJobById: async (id) => {
    const job = await Job.findByPk(id);
    if (!job) {
      throw new ServiceError(404, {
        data: [],
        message: "Job not found!!!!",
      });
    }
    return {
      data: job,
      message: "Jobs is found!!!!",
    };
  },

  updateJob: async (id, body) => {
    try {
      const [updatedRowsCount, updatedJobs] = await Job.update(body, {
        where: { id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        throw new ServiceError(404, {
          message: "Job not found or no changes made.",
        });
      }

      return {
        data: updatedJobs[0],
        message: "Job updated successfully.",
      };
    } catch (error) {
      mapSequelizeValidationError(error);
    }
  },

  deleteJob: async (id) => {
    const deletedRowCount = await Job.destroy({
      where: { id },
    });

    if (deletedRowCount === 0) {
      throw new ServiceError(404, {
        message: "Job not found.",
      });
    }

    return {
      message: "Job deleted successfully.",
    };
  },
};

module.exports = jobService;
