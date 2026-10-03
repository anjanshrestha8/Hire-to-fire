const express = require("express");
const TaskController = require("../controller/task.controller");
const router = express.Router();

router.post("/addTask", TaskController.addTask);
router.get("/getalltask", TaskController.getAllTask);
router.patch("/:id/status", TaskController.updateTaskStatus);

module.exports = router;
