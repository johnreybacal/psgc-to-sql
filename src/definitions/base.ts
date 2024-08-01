export default interface BaseDefinition {
    tableName: string;
    modelName: string;
    id?: string;
    createdAt?: string | boolean;
    updatedAt?: string | boolean;
    oldCode?: string;
    population?: string;
    code: string;
    name: string;
}
