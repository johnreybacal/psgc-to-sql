import psgcReader, {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Options, Sequelize } from "sequelize";
import { defaults } from "./definitions/defaults";
import { Definitions } from "./definitions/definitions";
import {
    defineBarangay,
    defineCity,
    defineMunicipality,
    defineProvince,
    defineRegion,
    defineSubMunicipality,
} from "./models/";
import { NormalizedSeeder } from "./seeders/normalized";
import { Seeder } from "./seeders/seeder";

export default class PsgcToSql {
    static #instance: PsgcToSql;

    #sequelize: Sequelize;
    #seeder: Seeder;
    definitions: Definitions;

    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];

    public static get instance(): PsgcToSql {
        if (!PsgcToSql.#instance) {
            PsgcToSql.#instance = new PsgcToSql();
        }

        return PsgcToSql.#instance;
    }

    public setSequelize(sequelize: Sequelize) {
        this.#sequelize = sequelize;

        return this;
    }

    public defineModels(
        definitions = defaults,
        sync:
            | "createIfNotExists"
            | "alter"
            | "force"
            | "noSync" = "createIfNotExists"
    ) {
        const Region = defineRegion(this.#sequelize, definitions.region);
        const Province = defineProvince(this.#sequelize, definitions.province);
        const City = defineCity(this.#sequelize, definitions.city);
        const Municipality = defineMunicipality(
            this.#sequelize,
            definitions.municipality
        );
        const SubMunicipality = defineSubMunicipality(
            this.#sequelize,
            definitions.subMunicipality
        );
        const Barangay = defineBarangay(this.#sequelize, definitions.barangay);

        if (sync !== "noSync") {
            let syncProperties = {};
            if (sync === "alter") {
                syncProperties = { alter: true };
            } else if (sync === "force") {
                syncProperties = { force: true };
            }
            Region.sync(syncProperties);
            Province.sync(syncProperties);
            City.sync(syncProperties);
            Municipality.sync(syncProperties);
            SubMunicipality.sync(syncProperties);
            Barangay.sync(syncProperties);
        }

        this.definitions = definitions;
        return this;
    }

    public associate(sync: "alter" | "force" = "alter") {
        const definitions = this.definitions;

        const Region = this.#sequelize.model(definitions.region.modelName);
        const Province = this.#sequelize.model(definitions.province.modelName);
        const City = this.#sequelize.model(definitions.city.modelName);
        const Municipality = this.#sequelize.model(
            definitions.municipality.modelName
        );
        const SubMunicipality = this.#sequelize.model(
            definitions.subMunicipality.modelName
        );
        const Barangay = this.#sequelize.model(definitions.barangay.modelName);

        // Province
        if (definitions.province.regionId) {
            Region.hasMany(Province, {
                foreignKey: definitions.province.regionId,
            });
        }
        // City
        if (definitions.city.regionId) {
            Region.hasMany(City, {
                foreignKey: definitions.city.regionId,
            });
        }
        if (definitions.city.provinceId) {
            Province.hasMany(City, {
                foreignKey: definitions.city.provinceId,
            });
        }
        // Municipality
        if (definitions.municipality.regionId) {
            Region.hasMany(Municipality, {
                foreignKey: definitions.municipality.regionId,
            });
        }
        if (definitions.municipality.provinceId) {
            Province.hasMany(Municipality, {
                foreignKey: definitions.municipality.provinceId,
            });
        }
        // Submunicipality
        if (definitions.subMunicipality.cityId) {
            City.hasMany(SubMunicipality, {
                foreignKey: definitions.subMunicipality.cityId,
            });
        }
        // Barangay
        if (definitions.barangay.cityId) {
            City.hasMany(Barangay, {
                foreignKey: definitions.barangay.cityId,
            });
        }
        if (definitions.barangay.municipalityId) {
            Municipality.hasMany(Barangay, {
                foreignKey: definitions.barangay.municipalityId,
            });
        }
        if (definitions.barangay.subMunicipalityId) {
            SubMunicipality.hasMany(Barangay, {
                foreignKey: definitions.barangay.subMunicipalityId,
            });
        }

        let syncProperties = {};
        if (sync === "alter") {
            syncProperties = { alter: true };
        } else if (sync === "force") {
            syncProperties = { force: true };
        }
        Region.sync(syncProperties);
        Province.sync(syncProperties);
        City.sync(syncProperties);
        Municipality.sync(syncProperties);
        SubMunicipality.sync(syncProperties);
        Barangay.sync(syncProperties);

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
            this.setSequelize(sequelize);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async toSql(filePath: string) {
        let seeder = this.#seeder;
        if (!seeder) {
            seeder = new NormalizedSeeder();
        }
        seeder.setSequelize(this.#sequelize);

        const psgc = await psgcReader.read(filePath);

        const regionIds = await seeder.saveRegions(
            this.definitions.region,
            psgc.regions
        );

        const provinceIds = await seeder.saveProvinces(
            this.definitions.province,
            psgc.provinces,
            regionIds
        );
        const cityIds = await seeder.saveCities(
            this.definitions.city,
            psgc.cities,
            regionIds,
            provinceIds
        );
        const municipalityIds = await seeder.saveMunicipalities(
            this.definitions.municipality,
            psgc.municipalities,
            regionIds,
            provinceIds
        );
        const subMunicipalityIds = await seeder.saveSubMunicipalities(
            this.definitions.subMunicipality,
            psgc.subMunicipalities,
            cityIds
        );
        await seeder.saveBarangays(
            this.definitions.barangay,
            psgc.barangays,
            cityIds,
            municipalityIds,
            subMunicipalityIds
        );
    }
}
