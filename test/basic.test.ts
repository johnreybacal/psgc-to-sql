import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import * as path from "path";
import { Sequelize } from "sequelize";
import psgcToSql from "../src";
import { defaults } from "../src/definitions/defaults";

let sequelize: Sequelize;
const filePath = path.resolve(__dirname, "ncr_car_data.xlsx");

// Setup and teardown might be a problem in parallel testing
beforeEach(async () => {
    sequelize = new Sequelize("sqlite::memory:", {
        logging: false,
    });
    await sequelize.authenticate();
});

afterEach(async () => {
    await sequelize.drop();
    await sequelize.close();
});

describe("basic test", () => {
    test("quick start", async () => {
        await psgcToSql.setSequelize(sequelize).defineModels().toSql(filePath);

        const Region = sequelize.model(defaults.region.modelName);
        const Province = sequelize.model(defaults.province.modelName);
        const City = sequelize.model(defaults.city.modelName);
        const Municipality = sequelize.model(defaults.municipality.modelName);
        const SubMunicipality = sequelize.model(
            defaults.subMunicipality.modelName
        );
        const Barangay = sequelize.model(defaults.barangay.modelName);

        expect(await Region.count()).toBe(2);
        expect(await Province.count()).toBe(6);
        expect(await City.count()).toBe(18);
        expect(await Municipality.count()).toBe(76);
        expect(await SubMunicipality.count()).toBe(14);
        expect(await Barangay.count()).toBe(2888);
    });
});
