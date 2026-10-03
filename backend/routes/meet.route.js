const express = require("express");
const router = express.Router();
const meetController = require("../controller/meet.controller");

router.post("/create-meeting", meetController.createMeetingRoom);
router.post("/signature", meetController.genrateSignature);
router.get("/list-meetings", meetController.listMeetings);
router.post("/schedule-meetings", meetController.scheduleZoomMeeting);
router.post(
  "/schedule_recurring_meetings",
  meetController.scheduleRecurringMeeting
);

module.exports = router;
