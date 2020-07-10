import {stateChangeType} from "@/js/enums";

export default class Utils {
    static applyStateChange(outerObject, statePropertyName, changeType, propertyString, value) {
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