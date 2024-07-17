import PsgcReader, { BasicBuilder } from "psgc-reader";
import { Sequelize } from "sequelize";
import RegionDefinition from "./definitions/region";
import defineRegion from "./models/region";

const connect = async () => {
    const sequelize = new Sequelize("psgc-test", "root", "root", {
        dialect: "mysql",
        host: "localhost",
        port: 3306,
    });

    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }

    const regionDefinition: RegionDefinition = {
        tableName: "region__",
        id: "ID",
        code: "CD",
        name: "NM",
        createdAt: "AUDIT_CREATED_AT",
        updatedAt: "AUDIT_UPDATED_AT",
    };

    const Region = defineRegion(sequelize, regionDefinition);

    console.log(Region);

    const filePath = "./data/PSGC-2Q-2024-Publication-Datafile.xlsx";

    const psgc = PsgcReader.instance;

    psgc.enableLogger();

    await psgc.read(filePath);
    psgc.setBuilder(new BasicBuilder()).filter().associate();

    for (const region of psgc.regions) {
        const r = await Region.create({
            [regionDefinition.code]: region.code,
            [regionDefinition.name]: region.name,
        });
    }

    process.exit(0);
};

connect();
