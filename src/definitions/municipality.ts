import BaseDefinition from "./base";

export default interface MunicipalityDefinition extends BaseDefinition {
    tableName?: string;
    id?: string;
    createdAt?: string | boolean;
    updatedAt?: string | boolean;
    oldCode?: string;
    population?: string;
    code: string;
    name: string;

    incomeClassification?: string;
    regionId?: string;
    provinceId?: string;
}
