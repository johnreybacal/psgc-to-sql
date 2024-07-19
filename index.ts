import PsgcReader from "psgc-reader";
import { Sequelize } from "sequelize";
import { ProvinceDefinition, RegionDefinition } from "./definitions";
import { utils } from "./definitions/util";
import { defineProvince, defineRegion } from "./models";

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
    const provinceDefinition: ProvinceDefinition = {
        tableName: "porubinsu",
        name: "namae",
        incomeClassification: "ingukamu",
        population: "popureeshu",
        oldCode: "orudu_koodu",
    };

    const Region = defineRegion(sequelize, regionDefinition);
    const Province = defineProvince(sequelize, provinceDefinition);

    console.log(Region);

    const filePath = "./data/PSGC-2Q-2024-Publication-Datafile.xlsx";

    const psgc = PsgcReader.instance;

    await psgc.read(filePath);
    psgc.filter().associate();

    for (const region of psgc.regions) {
        const reg = Region.build();

        utils.setBaseValue<RegionDefinition>(reg, regionDefinition, region);

        await reg.save();
    }

    console.log(provinceDefinition);

    for (const province of psgc.provinces) {
        const prov = Province.build();

        utils.setBaseValue<ProvinceDefinition>(
            prov,
            provinceDefinition,
            province
        );
        utils.setValueIfDefined<ProvinceDefinition>(
            prov,
            provinceDefinition,
            "incomeClassification",
            province.incomeClassification
        );

        await prov.save();
    }

    process.exit(0);
};

connect();
