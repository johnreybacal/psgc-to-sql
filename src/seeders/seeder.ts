import { PsgcReaderResult, PsgcRecord } from "psgc-reader";
import { Sequelize } from "sequelize";
import { Definitions, TypedDefinition } from "../definitions";

export interface Seeder {
    setSequelize(sequelize: Sequelize);
    seed(definition: Definitions, data: PsgcReaderResult);
    seed(definition: TypedDefinition, records: PsgcRecord[]);
}
