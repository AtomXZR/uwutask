import express = require("express");
import middleware = require("%config/middleware");
import model = require("%models");
import logger = require("%config/logger");

interface UserRegisterPayload {
    username: string;
    password: string;
}

class Auth {
    constructor () {}

    register = async (req: express.Request, res: express.Response) => {
        try {
            const payload: UserRegisterPayload | undefined = req.body["payload"];
            if (!payload) return res.status(400).json({ message: "payload not given" });
            if (typeof payload !== "object" || Array.isArray(payload)) return res.status(400).json({ message: "payload is not object" });

            const username = String(payload["username"]);
            const password = middleware.hashSHA512(String(payload["password"]));

            const userExists = await model.User.findOne({ where: { username: username }, attributes: [ "username" ] });
            if (userExists) return res.status(401).json({ message: "user with username \"" + username + "\" already exists" });

            const user = await model.User.create({ username: username, password: password });

            if (!(user instanceof model.User)) {
                logger.error(user);
                return res.status(500).json({ message: "Failed to create user" });
            }

            const token = middleware.createJwt({ username: username, id: <number>user.get("id") });
            return res.status(200).json({ token: token });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };

    login = async (req: express.Request, res: express.Response) => {
        try {
            const payload: UserRegisterPayload | undefined = req.body["payload"];
            if (!payload) return res.status(400).json({ message: "payload not given" });
            if (typeof payload !== "object" || Array.isArray(payload)) return res.status(400).json({ message: "payload is not object" });

            const username = String(payload["username"]);
            const password = middleware.hashSHA512(String(payload["password"]));

            
            const userExists = await model.User.findOne({ where: { username: username, password: password }, attributes: [ "id", "username" ] });
            if (!userExists) return res.status(401).json({ message: "incorrect username or password" });
            
            const token = middleware.createJwt({ username: username, id: <number>userExists.get("id") });
            return res.status(200).json({ token: token });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
export = Auth;