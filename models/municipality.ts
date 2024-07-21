import { DataTypes, Sequelize } from "sequelize";
import { MunicipalityDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { define } from "./base";

export const defineMunicipality = (
    sequelize: Sequelize,
    definition: MunicipalityDefinition
) => {
    const columns = {};
    utils.addColumnIfDefined<MunicipalityDefinition>(
        columns,
        definition,
        "incomeClassification",
        DataTypes.STRING
    );

    return define(
        sequelize,
        definition,
        "Municipality",
        "municipalities",
        columns
    );
};
