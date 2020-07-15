import {stateChangeType, actionType} from "@/js/enums";
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
        return result;
    }

    fromSmart(lastReceive, receiveArray) {
        if (receiveArray[0] === actionType.smartStateChange) {
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
            return [actionType.smartStateChange, value];
        } else {
            return sendArray;
        }
    }

    sendStateChange(sendFunction, recipient, stateOwner, changeType, propertyString, value) {
        let sendArray = [actionType.stateChange, stateOwner, changeType, propertyString, value];
        if (!this.lastSends[recipient])
            this.lastSends[recipient] = [];
        let smart = this.toSmart(this.lastSends[recipient], sendArray);
        this.lastSends[recipient] = sendArray;
        return sendFunction(smart);
    }

    applyStateChange(outerObject, statePropertyName, changeType, propertyString, value) {
        let refObject = outerObject[statePropertyName];
        let properties = propertyString.split('.');
        for (let property of properties.slice(0, -1))
            refObject = refObject[property];
        let finalProperty = properties[properties.length - 1];

        const bannedProperties = ['__proto__']
        if (bannedProperties.includes(finalProperty)) {
            console.warn("Not applying state change: banned", finalProperty);
            return;
        }

        switch (changeType) {
            case stateChangeType.reset:
                console.log("resetting player.state to", value);
                outerObject[statePropertyName] = value;
                break;
            case stateChangeType.add:
            case stateChangeType.update:
                refObject[finalProperty] = value;
                break;
            case stateChangeType.delete:
                delete refObject[finalProperty];
                break;
        }
    }
}