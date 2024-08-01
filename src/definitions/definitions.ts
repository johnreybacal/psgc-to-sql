import BarangayDefinition from "./barangay";
import CityDefinition from "./city";
import MunicipalityDefinition from "./municipality";
import ProvinceDefinition from "./province";
import RegionDefinition from "./region";
import SubMunicipalityDefinition from "./subMunicipality";

export interface Definitions {
    region: RegionDefinition;
    province: ProvinceDefinition;
    city: CityDefinition;
    municipality: MunicipalityDefinition;
    subMunicipality: SubMunicipalityDefinition;
    barangay: BarangayDefinition;
}
