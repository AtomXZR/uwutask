import path = require("path");
import fse = require("fs-extra");
import crypt = require("crypto");


export const HTTP_PORT = 8080;


export const currentDirectory = path.resolve(__dirname);                            // the current directory

export const dataDirectory = path.resolve(path.join(currentDirectory, "app-data")); // as <current directory>/app-data/
fse.ensureDirSync(dataDirectory);

export const databaseFile = path.resolve(path.join(dataDirectory, "database.bin")); // as <current directory>/app-data/database.bin

export const jwtKeyPemFile = path.resolve(path.join(dataDirectory, "jwt.key.pem")); // as <current directory>/app-data/jwt.key.pem

export const logDirectory = path.resolve(path.join(dataDirectory, "log"));          // as <current directory>/app-data/log/
fse.ensureDirSync(logDirectory);


// Create HMAC key if key file is not exists, else read the data from key file.
let JWT_KEY;
if (!fse.existsSync(jwtKeyPemFile)) {
    JWT_KEY = crypt.generateKeySync("hmac", { length: 4096 }).export();
    fse.writeFileSync(jwtKeyPemFile, JWT_KEY);
} else {
    JWT_KEY = fse.readFileSync(jwtKeyPemFile);
}
export const JwtKey = Buffer.from(JWT_KEY);

export const jwtIssuer = "UwU Task";