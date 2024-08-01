import { DataTypes, Sequelize } from "sequelize";
import { ProvinceDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { define } from "./base";

export const defineProvince = (
    sequelize: Sequelize,
    definition: ProvinceDefinition
) => {
    const columns = {};
    utils.addColumnIfDefined<ProvinceDefinition>(
        columns,
        definition,
        "regionId",
        DataTypes.INTEGER,
        false
    );
    utils.addColumnIfDefined<ProvinceDefinition>(
        columns,
        definition,
        "incomeClassification",
        DataTypes.STRING
    );

    return define(sequelize, definition, columns);
};
