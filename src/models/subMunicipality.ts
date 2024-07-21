import { Sequelize } from "sequelize";
import { SubMunicipalityDefinition } from "../definitions";
import { define } from "./base";

export const defineSubMunicipality = (
    sequelize: Sequelize,
    definition: SubMunicipalityDefinition
) => {
    const columns = {};

    return define(
        sequelize,
        definition,
        "SubMunicipality",
        "sub_municipalities",
        columns
    );
};
