import winston = require("winston");
import winstonDailyRotateFile = require("winston-daily-rotate-file");
import config = require("%config/config");

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize({ 
            colors: {
                info: "blue",
                error: "red",
                warn: "yellow",
            },
            all: false,
            level: true, 
            message: false, 
        }),
        winston.format.simple(),
    ),
    transports: [
        new winston.transports.Console(),
        new winstonDailyRotateFile({ 
            // format: winston.format.simple(), 
            dirname: config.logDirectory, 
            datePattern: "YYYY-MM-DD",
            filename: "%DATE%.log",
        }),
    ]
});

export = logger;