import { DataTypes, Sequelize } from "sequelize";
import RegionDefinition from "../definitions/region";
import { utils } from "../definitions/util";

const define = (sequelize: Sequelize, definition: RegionDefinition) => {
    const columns = {
        [definition.name]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    };

    utils.checkProperty(columns, definition, "code", DataTypes.STRING, false);

    const Region = sequelize.define("Region", columns, {
        tableName: definition.tableName ?? "regions",
        createdAt: definition.createdAt ?? false,
        updatedAt: definition.updatedAt ?? false,
    });

    if (!definition.id) {
        Region.removeAttribute("id");
    }

    return Region;
};

export default define;
