import { AbstractDataTypeConstructor } from "sequelize";
import BaseDefinition from "./base";

export const utils = {
    checkProperty: <T extends BaseDefinition>(
        columns: object,
        definition: T,
        key: keyof T,
        type: AbstractDataTypeConstructor,
        allowNull = true
    ) => {
        if (definition[key]) {
            Object.assign(columns, {
                [`${definition[key]}`]: {
                    type: type,
                    allowNull: allowNull,
                },
            });
        }
    },
};
