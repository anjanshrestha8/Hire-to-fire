const Candidate = require('../models/candidates');
const Job = require("../models/job");
const AiScreening = require("../models/aiScreening")

Job.hasMany(Candidate,{ foreignKey: 'jobId' })
Candidate.belongsTo(Job, { foreignKey: "jobId" });

Candidate.hasMany(AiScreening, {
  foreignKey: "candidateId",
  as: "aiScreenings",
});
AiScreening.belongsTo(Candidate, { foreignKey: "candidateId" });

module.exports = {
  Candidate,
  Job,
  AiScreening,
};
