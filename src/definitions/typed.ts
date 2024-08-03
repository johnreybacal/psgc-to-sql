import BaseDefinition from "./base";

export default interface TypedDefinition extends BaseDefinition {
    instanceOf: "TypedDefinition";
    type: string;
    typeAlias?: {
        Reg?: string;
        Prov?: string;
        City?: string;
        Mun?: string;
        SubMun?: string;
        Bgy?: string;
    };
}
