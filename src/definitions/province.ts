import BaseDefinition from "./base";

export default interface ProvinceDefinition extends BaseDefinition {
    incomeClassification?: string;
    regionId?: string;
}
