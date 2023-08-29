import express = require("express");
import bodyParser = require("body-parser");
import middleware = require("%config/middleware");
import auth = require("../controller/auth");

const Auth = new auth();

const router = express.Router();

router.use(bodyParser.json());

router.post("/signup", middleware.Authentication(false), Auth.register);
router.post("/login", middleware.Authentication(false), Auth.login);



export = router;