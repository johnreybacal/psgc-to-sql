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
        this.definitions = definitions;

        const Region = defineRegion(this.#sequelize, this.definitions.region);
        const Province = defineProvince(
            this.#sequelize,
            this.definitions.province
        );
        const City = defineCity(this.#sequelize, this.definitions.city);
        const Municipality = defineMunicipality(
            this.#sequelize,
            this.definitions.municipality
        );
        const SubMunicipality = defineSubMunicipality(
            this.#sequelize,
            this.definitions.subMunicipality
        );
        const Barangay = defineBarangay(
            this.#sequelize,
            this.definitions.barangay
        );

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
            regionIds
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
