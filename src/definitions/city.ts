import BaseDefinition from "./base";

export default interface CityDefinition extends BaseDefinition {
    incomeClassification?: string;
    class?: string;
    regionId?: string;
    provinceId?: string;
}
