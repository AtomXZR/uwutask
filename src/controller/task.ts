import express = require("express");
import model = require("%models")
import logger = require("%config/logger");
import { JwtPayload } from "%config/middleware";

class Task {
    constructor () {}

    createTask = async (req: express.Request, res: express.Response) => {
        try {
            const payload = <JwtPayload>res.locals.payload;
            if (!payload) return res.status(400).json({ message: "bad request" });

            const text = String(req.body["text"]);
            const state = Number(req.body["state"] ?? 0);

            if (!text) return res.status(400).json({ message: "text field not provided" });
            if (text.length > 250) return res.status(400).json({ message: "text field too large (250 characters max)" });

            if (state < 0 || state > 3) return res.status(400).json({ message: "invalid state value, allowed: 0, 1, 2, 3, got: " + state });

            const task = await model.Task.create({
                authorId: payload.id,
                text: text,
                state: state,
            });

            if (!(task instanceof model.Task)) {
                logger.error(task);
                return res.status(500).json({ message: "Failed to create task" });
            }

            return res.status(200).json({ message: "task created" });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getTasks = async (req: express.Request, res: express.Response) => {
        try {
            const payload = <JwtPayload>res.locals.payload;
            if (!payload) return res.status(400).json({ message: "bad request" });

            const limit = Number(req.body["limit"] ?? 50);
            const page = Number(req.body["page"] ?? 0) * limit;
            const ord = String(req.body["ord"]).trim().toLowerCase() === "asc" ? "ASC" : "DESC";
            
            const results = await model.Task.findAndCountAll({
                where: {
                    authorId: payload.id
                },

                attributes: [
                    "id",
                    "createdAt",
                    "text",
                    "state",
                ],

                order: [["createdAt", ord]],

                limit: limit,
                offset: page,
            });

            const resp = {
                count: results.count,
                results: results.rows.map((model) => model.toJSON())
            };

            return res.status(200).json(resp);
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };

    updateTask = async (req: express.Request, res: express.Response) => {
        try {
            const payload = <JwtPayload>res.locals.payload;
            if (!payload) return res.status(400).json({ message: "bad request" });

            const taskId = Number(req.params.id);

            if (!req.body["text"] && !req.body["state"]) return res.status(400).json({ message: "no update payload given" });

            const currentTask = await model.Task.findOne({
                where: {
                    id: taskId
                }
            });

            if (!currentTask) {
                return res.status(404).json({ message: `task id ${taskId} not found.` });
            }

            const newText = String(req.body["text"]) ?? currentTask.get("text");
            const newState = Number(req.body["state"]) ?? currentTask.get("state");
            
            if (newText.length > 250) return res.status(400).json({ message: "text field too large (250 characters max)" });
            if (newState < 0 || newState > 3) return res.status(400).json({ message: "invalid state value, allowed: 0, 1, 2, 3, got: " + newState });

            await model.Task.update({
                text: newText,
                state: newState,
            }, {
                where: {
                    id: taskId,
                    authorId: payload.id
                },
            });

            return res.status(200).json({ error: "Task updated" });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };

    deleteTask = async (req: express.Request, res: express.Response) => {
        try {
            const payload = <JwtPayload>res.locals.payload;
            if (!payload) return res.status(400).json({ message: "bad request" });

            const taskId = Number(req.params.id);

            await model.Task.destroy({
                where: {
                    id: taskId,
                    authorId: payload.id,
                },
            });
            
            return res.status(200).json({ error: "Task deleted" });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
export = Task