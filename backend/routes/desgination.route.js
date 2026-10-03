const express = require("express");
const router = express.Router();
const designationController = require("../controller/designation.controller");

router.post("/adddesignation", designationController.AddDesignation);
router.get("/getdesignation", designationController.GetDesignation);
router.put("/updatedesignation/:id", designationController.UpdateDesignation);
router.delete(
  "/deletedesignation/:id",
  designationController.DeleteDesignation
);

module.exports = router;
