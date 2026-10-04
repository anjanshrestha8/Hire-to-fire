const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const ServiceError = require("../utils/serviceError");

async function getZoomToken() {
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
}

async function createMeetingRoom(body) {
  const { topic, start_time, duration } = body;

  const token = await getZoomToken();

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
  return meetingRes.data;
}

function generateSignature(meetingNumber, role) {
  if (!meetingNumber || role === undefined) {
    throw new ServiceError(400, { message: "Missing required parameters" });
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

  return { signature: token };
}

async function listMeetings() {
  const token = await getZoomToken();
  const userId = "me";

  const response = await axios.get(
    `https://api.zoom.us/v2/users/${userId}/meetings?type=upcoming`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
}

async function scheduleZoomMeeting(body) {
  const token = await getZoomToken();
  const { topic, start_time, duration } = body;
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

  return response.data;
}

async function scheduleRecurringMeeting(body) {
  const token = await getZoomToken();
  const {
    topic,
    start_time,
    duration,
    recurrenceType,
    repeatInterval,
    endTimes,
  } = body;

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

  return response.data;
}

module.exports = {
  createMeetingRoom,
  generateSignature,
  listMeetings,
  scheduleZoomMeeting,
  scheduleRecurringMeeting,
};
