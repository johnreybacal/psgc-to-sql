import { DataTypes, Sequelize } from "sequelize";
import { SubMunicipalityDefinition } from "../definitions";
import { utils } from "../definitions/util";
import { define } from "./base";

export const defineSubMunicipality = (
    sequelize: Sequelize,
    definition: SubMunicipalityDefinition
) => {
    const columns = {};
    utils.addColumnIfDefined<SubMunicipalityDefinition>(
        columns,
        definition,
        "cityId",
        DataTypes.INTEGER,
        false
    );

    return define(
        sequelize,
        definition,
        "SubMunicipality",
        "sub_municipalities",
        columns
    );
};
