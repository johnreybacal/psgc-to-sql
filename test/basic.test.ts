import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import * as path from "path";
import { Sequelize } from "sequelize";
import psgcToSql, { TypedDefinition } from "../src";
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
    test("normalized", async () => {
        await psgcToSql
            .setSequelize(sequelize)
            .define(defaults)
            .associate()
            .toSql(filePath);

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
    test("single table", async () => {
        const definition: TypedDefinition = {
            modelName: "Location",
            tableName: "locations",
            code: "code",
            name: "name",
            type: "type",
            typeAlias: {
                Reg: "region",
                Prov: "province",
                City: "city",
                Mun: "municipality",
                SubMun: "sub municipality",
                Bgy: "barangay",
            },
            instanceOf: "TypedDefinition",
        };
        await psgcToSql
            .setSequelize(sequelize)
            .define(definition)
            .toSql(filePath);

        const Location = sequelize.model(definition.modelName);

        expect(await Location.count()).toBe(3004);

        const typeWhere = (key: string) => {
            return {
                where: {
                    [definition.type]: definition.typeAlias![key],
                },
            };
        };
        expect(await Location.count(typeWhere("Reg"))).toBe(2);
        expect(await Location.count(typeWhere("Prov"))).toBe(6);
        expect(await Location.count(typeWhere("City"))).toBe(18);
        expect(await Location.count(typeWhere("Mun"))).toBe(76);
        expect(await Location.count(typeWhere("SubMun"))).toBe(14);
        expect(await Location.count(typeWhere("Bgy"))).toBe(2888);
    });
});
