import { PsgcReaderResult, PsgcRecord } from "psgc-reader";
import { Sequelize } from "sequelize";
import { Definitions, TypedDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { Seeder } from "./seeder";

export class SingleTableSeeder implements Seeder {
    private sequelize: Sequelize;

    setSequelize(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }
    seed(definition: Definitions, data: PsgcReaderResult);
    seed(definition: TypedDefinition, records: PsgcRecord[]);

    async seed() {
        if (arguments[0].instanceOf === "TypedDefinition") {
            const definition = arguments[0] as TypedDefinition;
            const records = arguments[1] as PsgcRecord[];

            const Model = this.sequelize.model(definition.modelName);

            const locations = [];

            for (const record of records) {
                if (!record.geoLevel) {
                    // Is region level
                    if (record.code.endsWith("00000000")) {
                        record.geoLevel = "Reg";
                    }
                    // Is province level
                    else if (record.code.endsWith("00000")) {
                        record.geoLevel = "Prov";
                    }
                    // Is city level
                    else if (record.code.endsWith("000")) {
                        record.geoLevel = "City";
                    }
                    // Is barangay level
                    else {
                        record.geoLevel = "Bgy";
                    }
                }
                const location = Model.build();
                const type =
                    definition.typeAlias[record.geoLevel] ?? record.geoLevel;

                utils.setBaseValue<TypedDefinition>(
                    location,
                    definition,
                    record
                );
                utils.setValueIfDefined<TypedDefinition>(
                    location,
                    definition,
                    "type",
                    type
                );
                locations.push(location.toJSON());
            }

            await Model.bulkCreate(locations);
        } else {
            throw Error("Invalid arguments");
        }
    }
}
