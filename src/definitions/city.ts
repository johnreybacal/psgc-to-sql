import BaseDefinition from "./base";

export default interface CityDefinition extends BaseDefinition {
    tableName?: string;
    id?: string;
    createdAt?: string | boolean;
    updatedAt?: string | boolean;
    oldCode?: string;
    population?: string;
    code: string;
    name: string;

    incomeClassification?: string;
    class?: string;
}
