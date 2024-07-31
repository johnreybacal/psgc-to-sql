import { ProvinceDefinition, RegionDefinition } from "./definitions";
import { AbstractSeeder, Seeder } from "./seeder";

class BasicSeeder extends AbstractSeeder implements Seeder {
    async saveRegions(regionDefinition: RegionDefinition) {
        if (!regionDefinition.id) {
            throw new Error("id is not defined in RegionDefinition");
        }
        return await super.saveRegions(regionDefinition);
    }

    async saveProvinces(
        regionIds: Record<string, any>,
        provinceDefinition: ProvinceDefinition
    ) {
        if (!provinceDefinition.id) {
            throw new Error("id is not defined in ProvinceDefinition");
        }
        if (!provinceDefinition.regionId) {
            throw new Error("regionId is not defined in ProvinceDefinition");
        }
        return await super.saveProvinces(regionIds, provinceDefinition);
    }
}
