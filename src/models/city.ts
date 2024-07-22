import { DataTypes, Sequelize } from "sequelize";
import { CityDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { define } from "./base";

export const defineCity = (
    sequelize: Sequelize,
    definition: CityDefinition
) => {
    const columns = {};
    utils.addColumnIfDefined<CityDefinition>(
        columns,
        definition,
        "regionId",
        DataTypes.INTEGER,
        false
    );
    utils.addColumnIfDefined<CityDefinition>(
        columns,
        definition,
        "provinceId",
        DataTypes.INTEGER,
        false
    );
    utils.addColumnIfDefined<CityDefinition>(
        columns,
        definition,
        "incomeClassification",
        DataTypes.STRING
    );
    utils.addColumnIfDefined<CityDefinition>(
        columns,
        definition,
        "class",
        DataTypes.STRING
    );

    return define(sequelize, definition, "City", "cities", columns);
};
