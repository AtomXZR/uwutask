import express = require("express");
import bodyParser = require("body-parser");
import middleware = require("%config/middleware");
import task = require("../controller/task");

const Task = new task();

const router = express.Router();

router.use(bodyParser.json());

router.post("/", middleware.Authentication(), Task.createTask);
router.get("/", middleware.Authentication(), Task.getTasks);
router.patch("/:id", middleware.Authentication(), Task.updateTask);
router.delete("/:id", middleware.Authentication(), Task.deleteTask);



export = router;