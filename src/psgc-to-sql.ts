import psgcReader from "psgc-reader";
import { Model, ModelStatic, Options, Sequelize } from "sequelize";
import {
    CityDefinition,
    ProvinceDefinition,
    RegionDefinition,
} from "./definitions";
import { utils } from "./definitions/util";
import { defineCity, defineProvince, defineRegion } from "./models";

export default class PsgcToSql {
    static #instance: PsgcToSql;

    #sequelize: Sequelize;

    Region: ModelStatic<Model<any, any>>;
    Province: ModelStatic<Model<any, any>>;
    City: ModelStatic<Model<any, any>>;

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
    cityDefinition: CityDefinition = {
        id: "id",
        code: "code",
        name: "name",
        class: "class",
        regionId: "region_id",
        provinceId: "province_id",
    };

    public static get instance(): PsgcToSql {
        if (!PsgcToSql.#instance) {
            PsgcToSql.#instance = new PsgcToSql();
        }

        return PsgcToSql.#instance;
    }

    public setConnection(sequelize: Sequelize) {
        this.#sequelize = sequelize;

        return this;
    }

    public async connect(
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

    public define() {
        this.Region = defineRegion(this.#sequelize, this.regionDefinition);
        this.Province = defineProvince(
            this.#sequelize,
            this.provinceDefinition
        );
        this.City = defineCity(this.#sequelize, this.cityDefinition);

        this.Region.hasMany(this.Province);
        this.Region.hasMany(this.City);

        this.Province.belongsTo(this.Region);
        this.Province.hasMany(this.City);

        this.City.belongsTo(this.Region);
        this.City.belongsTo(this.Province);

        return this;
    }

    async toSql(
        filePath: string,
        {
            regionDefinition = this.regionDefinition,
            provinceDefinition = this.provinceDefinition,
            cityDefinition = this.cityDefinition,
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

        const psgc = await psgcReader.read(filePath);

        const regionIds: Record<string, any> = {};
        const regions = [];

        for (const region of psgc.regions) {
            const reg = this.Region.build();
            utils.setBaseValue<RegionDefinition>(reg, regionDefinition, region);
            regions.push(reg.toJSON());
        }

        const createdRegions = await this.Region.bulkCreate(regions);

        for (const region of createdRegions) {
            regionIds[region[regionDefinition.code]] =
                region[regionDefinition.id!];
        }

        const provinceIds: Record<string, any> = {};
        const provinces = [];

        for (const province of psgc.provinces) {
            const prov = this.Province.build();

            utils.setBaseValue<ProvinceDefinition>(
                prov,
                provinceDefinition,
                province
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                provinceDefinition,
                "regionId",
                regionIds[province.region.code]
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                provinceDefinition,
                "incomeClassification",
                province.incomeClassification
            );

            provinces.push(prov.toJSON());
        }

        const createdProvinces = await this.Province.bulkCreate(provinces);

        for (const province of createdProvinces) {
            provinceIds[province[provinceDefinition.code]] =
                province[provinceDefinition.id!];
        }

        const cities = [];

        for (const city of psgc.cities) {
            const ct = this.City.build();

            utils.setBaseValue<CityDefinition>(ct, cityDefinition, city);

            // HUC does not have province, HUC are directly under region
            if (city.class !== "HUC") {
                utils.setValueIfDefined<CityDefinition>(
                    ct,
                    cityDefinition,
                    "provinceId",
                    provinceIds[city.province!.code]
                );
                utils.setValueIfDefined<CityDefinition>(
                    ct,
                    cityDefinition,
                    "regionId",
                    regionIds[city.province!.region.code]
                );
            } else {
                utils.setValueIfDefined<CityDefinition>(
                    ct,
                    cityDefinition,
                    "regionId",
                    regionIds[city.region!.code]
                );
            }

            utils.setValueIfDefined<CityDefinition>(
                ct,
                cityDefinition,
                "class",
                city.class
            );
            utils.setValueIfDefined<CityDefinition>(
                ct,
                cityDefinition,
                "incomeClassification",
                city.incomeClassification
            );

            cities.push(ct.toJSON());
        }

        await this.City.bulkCreate(cities);
    }
}
