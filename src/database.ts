import sequelize = require("sequelize");
import config = require("%config/config");
import logger = require("%config/logger");

export const connection = new sequelize.Sequelize({
    dialect: "sqlite",
    storage: config.databaseFile,

    logging: msg => logger.verbose(msg),
});



// region Models



export const User = connection.define("user", {
    id: {
        type: sequelize.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    },
    username: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    },
    password: {
        type: sequelize.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    }
}, {
    indexes: [
        {
            unique: true,
            fields: [
                "username", "id"
            ],
        },
    ],
});



export const Task = connection.define("tasks", {
    id: {
        type: sequelize.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    },
    authorId: {
        type: sequelize.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    },
    createdAt: {
        type: sequelize.DataTypes.DATE,
        defaultValue: sequelize.DataTypes.NOW,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
        },
    },
    text: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
            len: [1, 255]
        },
    },
    state: {
        type: sequelize.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
            isInt: true,
            isIn: [[0, 1, 2, 3]],
            
        },
    }
});



// region relation
User.hasMany(Task, { foreignKey: "id", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "authorId" });
// endregion relation



export const sync = async () => await connection.sync();
// endregion Models