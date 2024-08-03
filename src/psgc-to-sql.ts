import psgcReader, {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { DataTypes, Options, Sequelize } from "sequelize";
import { Definitions } from "./definitions/definitions";
import TypedDefinition from "./definitions/typed";
import {
    defineBarangay,
    defineCity,
    defineMunicipality,
    defineProvince,
    defineRegion,
    defineSubMunicipality,
} from "./models";
import { define } from "./models/base";
import {
    AbstractSequentialSeeder,
    BasicSeeder,
    Seeder,
    SingleTableSeeder,
} from "./seeders";

type Sync = "createIfNotExists" | "alter" | "force" | "noSync";

export default class PsgcToSql {
    static #instance: PsgcToSql;

    private sequelize: Sequelize;
    private seeder: Seeder;
    private definitions: Definitions;
    private typedDefinition: TypedDefinition;

    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];

    isUsingSingleTable = false;

    public static get instance(): PsgcToSql {
        if (!PsgcToSql.#instance) {
            PsgcToSql.#instance = new PsgcToSql();
        }

        return PsgcToSql.#instance;
    }

    public setSequelize(sequelize: Sequelize) {
        this.sequelize = sequelize;

        return this;
    }

    public setSeeder(seeder: Seeder) {
        this.seeder = seeder;
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

    define(definition: Definitions, sync?: Sync): PsgcToSql;
    define(definition: TypedDefinition, sync?: Sync): PsgcToSql;

    public define() {
        const sync = arguments[1] as Sync;

        if (arguments[0].instanceOf === "Definitions") {
            const definitions = arguments[0] as Definitions;
            return this.defineSequentialModels(definitions, sync);
        } else {
            const definition = arguments[0] as TypedDefinition;
            return this.defineSingleTableModel(definition, sync);
        }
    }

    private defineSequentialModels(
        definitions: Definitions,
        sync: Sync = "createIfNotExists"
    ) {
        const Region = defineRegion(this.sequelize, definitions.region);
        const Province = defineProvince(this.sequelize, definitions.province);
        const City = defineCity(this.sequelize, definitions.city);
        const Municipality = defineMunicipality(
            this.sequelize,
            definitions.municipality
        );
        const SubMunicipality = defineSubMunicipality(
            this.sequelize,
            definitions.subMunicipality
        );
        const Barangay = defineBarangay(this.sequelize, definitions.barangay);

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

    private defineSingleTableModel(
        definition: TypedDefinition,
        sync: Sync = "createIfNotExists"
    ) {
        this.typedDefinition = definition;
        this.setSeeder(new SingleTableSeeder());
        const columns = {
            [definition.type]: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        };
        const Model = define(this.sequelize, definition, columns);

        if (sync !== "noSync") {
            let syncProperties = {};
            if (sync === "alter") {
                syncProperties = { alter: true };
            } else if (sync === "force") {
                syncProperties = { force: true };
            }
            Model.sync(syncProperties);
        }

        return this;
    }

    public associate(sync: "alter" | "force" = "alter") {
        if (this.seeder instanceof SingleTableSeeder) {
            throw Error("Cannot associate when using TypedDefinition");
        }
        const definitions = this.definitions;

        const Region = this.sequelize.model(definitions.region.modelName);
        const Province = this.sequelize.model(definitions.province.modelName);
        const City = this.sequelize.model(definitions.city.modelName);
        const Municipality = this.sequelize.model(
            definitions.municipality.modelName
        );
        const SubMunicipality = this.sequelize.model(
            definitions.subMunicipality.modelName
        );
        const Barangay = this.sequelize.model(definitions.barangay.modelName);

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

    public async toSql(filePath: string) {
        let seeder = this.seeder;
        if (!seeder) {
            seeder = new BasicSeeder();
        }

        seeder.setSequelize(this.sequelize);

        console.log(seeder);
        if (seeder instanceof AbstractSequentialSeeder) {
            const psgc = await psgcReader.read(filePath);

            if (!this.definitions) {
                throw Error("Models not defined");
            }

            await seeder.seed(this.definitions, psgc);
        } else {
            const records = await psgcReader.readRaw(filePath);

            if (!this.typedDefinition) {
                throw Error("Models not defined");
            }

            await seeder.seed(this.typedDefinition, records);
        }
    }
}
