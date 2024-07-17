import { DataTypes, Sequelize } from "sequelize";
import ProvinceDefinition from "../definitions/province";
import { utils } from "../definitions/util";

const define = (sequelize: Sequelize, definition: ProvinceDefinition) => {
    const columns = {
        [definition.name]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    };

    utils.checkProperty<ProvinceDefinition>(
        columns,
        definition,
        "code",
        DataTypes.STRING,
        false
    );
    utils.checkProperty<ProvinceDefinition>(
        columns,
        definition,
        "incomeClassification",
        DataTypes.STRING
    );

    const Province = sequelize.define("Province", columns, {
        tableName: definition.tableName ?? "provinces",
        createdAt: definition.createdAt ?? false,
        updatedAt: definition.updatedAt ?? false,
    });

    if (!definition.id) {
        Province.removeAttribute("id");
    }

    return Province;
};

export default define;
