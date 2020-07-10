import Utils from "@/js/Utils";

export default class Player {
    constructor(id, peer) {
        this.id = id;
        this.peer = peer;
        this.state = {}
    }

    applyStateChange(changeType, propertyString, value) {
        return Utils.applyStateChange(this, 'state', changeType, propertyString, value);
    }
}