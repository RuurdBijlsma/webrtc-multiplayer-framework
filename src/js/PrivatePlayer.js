import Player from "./Player";
import Observable from "observable-slim";
import {actionType, stateChangeType} from "./enums";
import StateChange from "./StateChange";

export default class PrivatePlayer extends Player {
    constructor(id = 0) {
        super(id);
        this.privateState = {};
        this.paused = false;
    }

    pauseObservable() {
        Observable.pause(this.state);
        Observable.pause(this.privateState);
        this.paused = true;
    }

    resumeObservable() {
        Observable.resume(this.state);
        Observable.resume(this.privateState);
        this.paused = false;
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            for (let change of changes) {
                let stateChange = StateChange.fromObservable(actionType.stateChange, this.id, change);
                this.emit("state-change", stateChange);
            }
        });
        if (!this.paused)
            this.emit("state-change", new StateChange(actionType.stateChange, this.id, stateChangeType.reset, '', value));
    }

    get state() {
        return this._state;
    }

    set privateState(value) {
        Observable.remove(this._privateState);
        this._privateState = Observable.create(value, false, changes => {
            for (let change of changes) {
                let stateChange = StateChange.fromObservable(actionType.privateStateChange, this.id, change);
                this.emit("private-state-change", stateChange);
            }
        });
        if (!this.paused)
            this.emit("private-state-change", new StateChange(actionType.privateStateChange, this.id, stateChangeType.reset, '', value));
    }

    get privateState() {
        return this._privateState;
    }
}