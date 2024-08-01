import { Dialect, Sequelize } from "sequelize";
import psgcToSql from "./src/";
import { defaults } from "./src/definitions/defaults";

const test = async () => {
    const sequelize = new Sequelize(
        process.env.DB_NAME!,
        process.env.DB_USERNAME!,
        process.env.DB_PASSWORD,
        {
            dialect: process.env.DB_ENGINE! as Dialect,
            host: process.env.DB_HOST!,
            port: process.env.DB_PORT! as unknown as number,
            logging: false,
        }
    );

    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }

    const filePath = "./data/PSGC-April-2024-Publication-Datafile.xlsx";
    await psgcToSql
        .setSequelize(sequelize)
        .defineModels(defaults, "force")
        .associate("force")
        .toSql(filePath);

    process.exit(0);
};

test();
