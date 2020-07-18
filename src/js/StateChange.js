//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

import {actionType, stateChangeType} from "./enums";

export default class StateChange {
    constructor(action, stateOwner, changeType, propertyName, value) {
        this.action = action;
        this.stateOwner = stateOwner;
        this.changeType = changeType;
        this.propertyName = propertyName;
        this.value = value;
    }

    get array(){
        return [this.action, this.stateOwner, this.changeType, this.propertyName, this.value];
    }

    static fromArray(arr){
        return new StateChange(...arr);
    }

    static fromObservable(action, stateOwner, change){
        return new StateChange(action, stateOwner, stateChangeType[change.type], change.currentPath, change.newValue);
    }
}