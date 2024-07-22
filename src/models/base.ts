import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { BaseDefinition } from "../definitions";
import { utils } from "../definitions/util";

export const define = (
    sequelize: Sequelize,
    definition: BaseDefinition,
    modelName: string,
    defaultTableName: string,
    columns = {}
): ModelStatic<Model<any, any>> => {
    if (definition.id) {
        Object.assign(columns, {
            [definition.id]: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        });
    }

    Object.assign(columns, {
        [definition.code]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    Object.assign(columns, {
        [definition.name]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

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
