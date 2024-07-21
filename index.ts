import { Dialect } from "sequelize";
import psgcToSql from "./src/";

const test = async () => {
    await psgcToSql.connect(
        process.env.DB_NAME!,
        process.env.DB_USERNAME!,
        process.env.DB_PASSWORD,
        {
            dialect: process.env.DB_ENGINE! as Dialect,
            host: process.env.DB_HOST!,
            port: process.env.DB_PORT! as unknown as number,
        }
    );

    const filePath = "./data/PSGC-April-2024-Publication-Datafile.xlsx";
    await psgcToSql.toSql(filePath, {});

    process.exit(0);
};

test();
