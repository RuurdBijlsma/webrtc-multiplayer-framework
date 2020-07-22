import {stateChangeType, actionType} from "@/js/enums";
import StateChange from "./StateChange";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class StateUtils {
    constructor() {
        this.lastSends = {};
        this.lastReceives = {};
    }

    receiveStateChange(sender, receiveArray) {
        if (!this.lastReceives[sender])
            this.lastReceives[sender] = [];
        let result = this.fromSmart(this.lastReceives[sender].slice(0, 4), receiveArray);
        this.lastReceives[sender] = result;
        return StateChange.fromArray(result);
    }

    fromSmart(lastReceive, receiveArray) {
        if (receiveArray[0] === actionType.smartStateChange || receiveArray[0] === actionType.privateSmartStateChange) {
            return lastReceive.concat([receiveArray[1]]);
        } else {
            return receiveArray;
        }
    }

    toSmart(lastSend, sendArray) {
        let [actionA, stateOwnerA, changeTypeA, propertyStringA] = lastSend;
        let [actionB, stateOwnerB, changeTypeB, propertyStringB, value] = sendArray;
        if (
            actionA === actionB &&
            stateOwnerA === stateOwnerB &&
            changeTypeA === changeTypeB &&
            propertyStringA === propertyStringB
        ) {
            return [actionA === actionType.stateChange ? actionType.smartStateChange : actionType.privateSmartStateChange, value];
        } else {
            return sendArray;
        }
    }

    sendStateChange(sendFunction, recipient, stateChange) {
        if (!this.lastSends[recipient])
            this.lastSends[recipient] = [];
        let smart = this.toSmart(this.lastSends[recipient], stateChange.array);
        this.lastSends[recipient] = stateChange.array;
        // console.log('sending', smart);
        return sendFunction(smart);
    }

    static applyStateChange(outerObject, statePropertyName, stateChange, pauseObservable) {
        if (pauseObservable && outerObject.pauseObservable !== undefined)
            outerObject.pauseObservable();

        let refObject = outerObject[statePropertyName];
        let properties = stateChange.propertyName.split('.');
        for (let property of properties.slice(0, -1))
            refObject = refObject[property];
        let finalProperty = properties[properties.length - 1];

        const bannedProperties = ['__proto__']
        if (bannedProperties.includes(finalProperty)) {
            console.warn("Not applying state change: banned", finalProperty);
            return;
        }

        switch (stateChange.changeType) {
            case stateChangeType.reset:
                console.log("resetting player.state to", stateChange.value);
                outerObject[statePropertyName] = stateChange.value;
                break;
            case stateChangeType.add:
            case stateChangeType.update:
                refObject[finalProperty] = stateChange.value;
                break;
            case stateChangeType.delete:
                delete refObject[finalProperty];
                break;
        }

        if (pauseObservable && outerObject.resumeObservable !== undefined)
            outerObject.resumeObservable();
    }
}