import { Sequelize } from "sequelize";
import { RegionDefinition } from "../definitions";
import { define } from "./base";

export const defineRegion = (
    sequelize: Sequelize,
    definition: RegionDefinition
) => {
    return define(sequelize, definition, "Region", "regions");
};
