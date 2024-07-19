import { DataTypes, Sequelize } from "sequelize";
import { BaseDefinition } from "../definitions";
import { utils } from "../definitions/util";

export const define = (
    sequelize: Sequelize,
    definition: BaseDefinition,
    modelName: string,
    defaultTableName: string,
    columns = {}
) => {
    Object.assign(columns, {
        [definition.name]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    utils.addColumnIfDefined<BaseDefinition>(
        columns,
        definition,
        "code",
        DataTypes.STRING,
        false
    );
    utils.addColumnIfDefined<BaseDefinition>(
        columns,
        definition,
        "oldCode",
        DataTypes.STRING,
        true
    );
    utils.addColumnIfDefined<BaseDefinition>(
        columns,
        definition,
        "population",
        DataTypes.INTEGER,
        true
    );

    const model = sequelize.define(modelName, columns, {
        tableName: definition.tableName ?? defaultTableName,
        createdAt: definition.createdAt ?? false,
        updatedAt: definition.updatedAt ?? false,
    });

    if (!definition.id) {
        model.removeAttribute("id");
    }

    return model;
};
