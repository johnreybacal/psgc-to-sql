import BaseDefinition from "./base";

export default interface MunicipalityDefinition extends BaseDefinition {
    incomeClassification?: string;
    regionId?: string;
    provinceId?: string;
}
