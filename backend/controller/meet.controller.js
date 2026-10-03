const axios = require("axios");
const qs = require("qs");
const jwt = require('jsonwebtoken');

const ZoomMeetController = {
  getZoomToken: async () => {
    const tokenRes = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({
        grant_type: "account_credentials",
        account_id: "Zx32u5pESzOagQo4NKr5Hg",
      }),
      {
        auth: {
          username: "jJ1AtCZIQqG9RV82AFDfJA",
          password: "RjZk4G5bE4Mv7xaTq5OuOPPAB807Qw2I",
        },
      }
    );
    return tokenRes.data.access_token;
  },

  createMeetingRoom: async (req, res) => {
    try {
      const { topic, start_time, duration } = req.body;

      const token = await ZoomMeetController.getZoomToken();

      console.log(token);
      const meetingRes = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        {
          topic,
          type: 2,
          start_time,
          duration,
          timezone: "UTC",
          settings: {
            host_video: true,
            participant_video: true,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.send(meetingRes.data);
    } catch (error) {
      console.log(error.message);
    }
  },

  genrateSignature: async (req, res) => {
    try {
      const { meetingNumber, role } = await req.query;

      if (!meetingNumber || role === undefined) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const iat = Math.round(new Date().getTime() / 1000) - 30;
      const exp = iat + 60 * 60 * 2;

      const sdkKey = process.env.ZOOM_SDK_KEY;
      const sdkSecret = process.env.ZOOM_SDK_SECRET;

      const token = jwt.sign(
        {
          sdkKey,
          mn: meetingNumber,
          role,
          iat,
          exp,
          appKey: sdkKey,
          tokenExp: exp,
        },
        sdkSecret,
        { algorithm: "HS256" }
      );

      res.json({ signature: token });
    } catch (error) {
      console.error("Error generating Zoom signature:", error);
      res.status(500).json({ message: "Failed to generate signature" });
    }
  },

  listMeetings: async (req, res) => {
    try {
      const token = await ZoomMeetController.getZoomToken();
      const userId = "me";

      const response = await axios.get(
        `https://api.zoom.us/v2/users/${userId}/meetings?type=upcoming`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  },

  scheduleZoomMeeting: async (req, res) => {
    try {
      const token = await ZoomMeetController.getZoomToken();
      const { topic, start_time, duration } = req.body;
      const response = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic,
          type: 2,
          start_time,
          duration,
          timezone: "UTC",
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error(
        "Error creating Zoom meeting:",
        err.response?.data || err.message
      );
    }
  },

  scheduleRecurringMeeting: async (req, res) => {
    try {
      const token = await ZoomMeetController.getZoomToken();
      const {
        topic,
        start_time,
        duration,
        recurrenceType,
        repeatInterval,
        endTimes,
      } = req.body;

      const response = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic,
          type: 8,
          start_time,
          duration,
          timezone: "UTC",
          recurrence: {
            type: recurrenceType || 2,
            repeat_interval: repeatInterval || 1,
            end_times: endTimes || 10,
          },
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(response.data);
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
