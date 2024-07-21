import { Location } from "psgc-reader/dist/types/psgc";
import { AbstractDataTypeConstructor, Model } from "sequelize";
import BaseDefinition from "./base";

export const utils = {
    addColumnIfDefined: <T extends BaseDefinition>(
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
    setBaseValue: <T extends BaseDefinition>(
        model: Model<any, any>,
        definition: T,
        data: Location
    ) => {
        model[definition.code] = data.code;
        model[definition.name] = data.name;
        utils.setValueIfDefined<T>(model, definition, "oldCode", data.oldCode);
        utils.setValueIfDefined<T>(
            model,
            definition,
            "population",
            data.population
        );
    },
    setValueIfDefined: <T extends BaseDefinition>(
        model: Model<any, any>,
        definition: T,
        key: keyof T,
        data: any
    ) => {
        if (definition[key]) {
            Object.assign(model, {
                [`${definition[key]}`]: data,
            });
        }
    },
};
