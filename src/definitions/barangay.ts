import BaseDefinition from "./base";

export default interface BarangayDefinition extends BaseDefinition {
    cityId?: string;
    municipalityId?: string;
    subMunicipalityId?: string;
    urbanRuralClassification?: string;
    isUrban?: boolean;
    isRural?: boolean;
}
