import { Sequelize } from "sequelize";
import { BarangayDefinition } from "../definitions";
import { define } from "./base";

export const defineBarangay = (
    sequelize: Sequelize,
    definition: BarangayDefinition
) => {
    const columns = {};

    return define(sequelize, definition, "Barangay", "barangays", columns);
};
