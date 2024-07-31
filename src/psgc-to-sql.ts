import psgcReader, {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Options, Sequelize } from "sequelize";
import {
    BarangayDefinition,
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
} from "./definitions";
import { defineCity, defineProvince, defineRegion } from "./models";
import { NormalizedSeeder } from "./seeders/normalized";
import { Seeder } from "./seeders/seeder";

export default class PsgcToSql {
    static #instance: PsgcToSql;

    #sequelize: Sequelize;
    #seeder: Seeder;

    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];

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
    municipalityDefinition: MunicipalityDefinition = {
        id: "id",
        code: "code",
        name: "name",
        regionId: "region_id",
        provinceId: "province_id",
    };
    subMunicipalityDefinition: SubMunicipalityDefinition = {
        id: "id",
        code: "code",
        name: "name",
        cityId: "city_id",
    };
    barangayDefinition: BarangayDefinition = {
        id: "id",
        code: "code",
        name: "name",
        cityId: "city_id",
        municipalityId: "municipality_id",
        subMunicipalityId: "subMunicipality_id",
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
        defineRegion(this.#sequelize, this.regionDefinition);
        defineProvince(this.#sequelize, this.provinceDefinition);
        defineCity(this.#sequelize, this.cityDefinition);

        return this;
    }

    async toSql(
        filePath: string,
        {
            regionDefinition = this.regionDefinition,
            provinceDefinition = this.provinceDefinition,
            cityDefinition = this.cityDefinition,
            municipalityDefinition = this.municipalityDefinition,
            subMunicipalityDefinition = this.subMunicipalityDefinition,
            barangayDefinition = this.barangayDefinition,
        }
    ) {
        let seeder = this.#seeder;
        if (!seeder) {
            seeder = new NormalizedSeeder();
        }
        const psgc = await psgcReader.read(filePath);

        const regionIds = await seeder.saveRegions(
            regionDefinition,
            psgc.regions
        );

        const provinceIds = await seeder.saveProvinces(
            provinceDefinition,
            psgc.provinces,
            regionIds
        );
        const cityIds = await seeder.saveCities(
            cityDefinition,
            psgc.cities,
            regionIds,
            provinceIds
        );
        const municipalityIds = await seeder.saveMunicipalities(
            municipalityDefinition,
            psgc.municipalities,
            regionIds,
            provinceIds
        );
        const subMunicipalityIds = await seeder.saveSubMunicipalities(
            subMunicipalityDefinition,
            psgc.subMunicipalities,
            regionIds
        );
        const barangayIds = await seeder.saveBarangays(
            barangayDefinition,
            psgc.barangays,
            cityIds,
            municipalityIds,
            subMunicipalityIds
        );
    }
}
