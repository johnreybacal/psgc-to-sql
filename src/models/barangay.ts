import { DataTypes, Sequelize } from "sequelize";
import { BarangayDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { define } from "./base";

export const defineBarangay = (
    sequelize: Sequelize,
    definition: BarangayDefinition
) => {
    const columns = {};
    utils.addColumnIfDefined<BarangayDefinition>(
        columns,
        definition,
        "cityId",
        DataTypes.INTEGER
    );
    utils.addColumnIfDefined<BarangayDefinition>(
        columns,
        definition,
        "municipalityId",
        DataTypes.INTEGER
    );
    utils.addColumnIfDefined<BarangayDefinition>(
        columns,
        definition,
        "subMunicipalityId",
        DataTypes.INTEGER
    );

    return define(sequelize, definition, "Barangay", "barangays", columns);
};
