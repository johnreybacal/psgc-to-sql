import BaseDefinition from "./base";

export default interface BarangayDefinition extends BaseDefinition {
    tableName?: string;
    id?: string;
    createdAt?: string | boolean;
    updatedAt?: string | boolean;
    oldCode?: string;
    population?: string;
    code: string;
    name: string;

    cityId?: string;
    municipalityId?: string;
    subMunicipalityId?: string;
    urbanRuralClassification?: string;
    isUrban?: boolean;
    isRural?: boolean;
}
