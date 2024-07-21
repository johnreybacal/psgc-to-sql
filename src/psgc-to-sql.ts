import psgcReader from "psgc-reader";
import { Options, Sequelize } from "sequelize";
import { ProvinceDefinition, RegionDefinition } from "./definitions";
import { utils } from "./definitions/util";
import { defineProvince, defineRegion } from "./models";

export default class PsgcToSql {
    static #instance: PsgcToSql;

    #sequelize: Sequelize;
    regionDefinition: RegionDefinition = {
        id: "id",
        code: "code",
        name: "name",
    };
    provinceDefinition: ProvinceDefinition = {
        id: "id",
        code: "code",
        name: "name",
        regionId: "region_id",
    };

    public static get instance(): PsgcToSql {
        if (!PsgcToSql.#instance) {
            PsgcToSql.#instance = new PsgcToSql();
        }

        return PsgcToSql.#instance;
    }

    async connect(
        database: string,
        username: string,
        password?: string,
        options?: Options
    ) {
        const sequelize = new Sequelize(database, username, password, options);

        try {
            await sequelize.authenticate();
            this.setConnection(sequelize);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    setConnection(sequelize: Sequelize) {
        this.#sequelize = sequelize;
    }

    async toSql(
        filePath: string,
        {
            regionDefinition = this.regionDefinition,
            provinceDefinition = this.provinceDefinition,
        }
    ) {
        if (!regionDefinition.id) {
            throw new Error("id is not defined in ProvinceDefinition");
        }
        if (!provinceDefinition.id) {
            throw new Error("id is not defined in ProvinceDefinition");
        }
        if (!provinceDefinition.regionId) {
            throw new Error("regionId is not defined in ProvinceDefinition");
        }

        const Region = defineRegion(this.#sequelize, regionDefinition);
        const Province = defineProvince(this.#sequelize, provinceDefinition);

        Region.hasMany(Province);
        Province.belongsTo(Region);

        const psgc = await psgcReader.read(filePath);

        const regionIds: Record<string, any> = {};
        const regions = [];

        for (const region of psgc.regions) {
            const reg = Region.build();
            utils.setBaseValue<RegionDefinition>(reg, regionDefinition, region);
            regions.push(reg.toJSON());
        }

        const createdRegions = await Region.bulkCreate(regions);

        for (const region of createdRegions) {
            regionIds[region[regionDefinition.code]] =
                region[regionDefinition.id!];
        }

        const provinces = [];

        for (const province of psgc.provinces) {
            const prov = Province.build();

            prov[provinceDefinition.regionId] = regionIds[province.region.code];
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

            provinces.push(prov.toJSON());
        }

        await Province.bulkCreate(provinces);
    }
}
