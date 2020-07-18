import {actionType} from "./enums";

export default class Utils{
    static isReservedData(data){
        if (!Array.isArray(data)) {
            return false;
        }
        return Object.values(actionType).includes(data[0]);
    }

    static isStateChange(data) {
        if (!Array.isArray(data)) {
            return false;
        }
        return [
            actionType.privateStateChange,
            actionType.stateChange,
            actionType.smartStateChange,
            actionType.privateSmartStateChange,
        ].includes(data[0]);
    }
}