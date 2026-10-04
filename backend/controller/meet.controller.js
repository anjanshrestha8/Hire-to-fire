const ServiceError = require("../utils/serviceError");
const meetService = require("../services/meet.service");

const ZoomMeetController = {
  createMeetingRoom: async (req, res) => {
    try {
      const data = await meetService.createMeetingRoom(req.body);
      res.send(data);
    } catch (error) {
      console.log(error.message);
    }
  },

  genrateSignature: async (req, res) => {
    try {
      const { meetingNumber, role } = await req.query;
      const result = meetService.generateSignature(meetingNumber, role);
      res.json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error generating Zoom signature:", error);
      res.status(500).json({ message: "Failed to generate signature" });
    }
  },

  listMeetings: async (req, res) => {
    try {
      const data = await meetService.listMeetings();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  },

  scheduleZoomMeeting: async (req, res) => {
    try {
      const data = await meetService.scheduleZoomMeeting(req.body);
      res.json(data);
    } catch (err) {
      console.error(
        "Error creating Zoom meeting:",
        err.response?.data || err.message
      );
    }
  },

  scheduleRecurringMeeting: async (req, res) => {
    try {
      const data = await meetService.scheduleRecurringMeeting(req.body);
      res.json(data);
    } catch (err) {
      console.error(
        "Error creating recurring Zoom meeting:",
        err.response?.data || err.message
      );
      res.status(500).json({ error: err.response?.data || err.message });
    }
  },
};

module.exports = ZoomMeetController;
