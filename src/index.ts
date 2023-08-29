import { sync } from "%models";
import config = require("%config/config");
import logger = require("%config/logger");

import express = require("express");
import AuthRouter = require("./route/auth");
import TaskRouter = require("./route/task");

const app = express();

app.use((req, res, next) => {
    const contentLength = req.headers["content-length"];
    const host = req.headers.host;
    const method = req.method;
  
    logger.info(`[${method}] ${host} content-length:${contentLength}`);

    res.set("X-Powered-By", "OwO");
  
    // Continue processing the request
    next();
});

app.use("/auth", AuthRouter);
app.use("/task", TaskRouter);



sync().then(() => {
    logger.info("Database sync finished.");
    app.listen(config.HTTP_PORT, () => {
        logger.info("Listening on: " + config.HTTP_PORT);
    });
}).catch(e => {
    logger.error(e);
    process.exit(0);
});