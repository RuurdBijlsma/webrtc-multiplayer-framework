import Observable from "observable-slim";
import {actionType, stateChangeType} from "./enums";
import EventEmitter from 'events';
import StateChange from "./StateChange";

export default class Player extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.state = {};
    }

    pauseObservable() {
        // Only relevant for child class PrivatePlayer.js
    }

    resumeObservable() {
        // Only relevant for child class PrivatePlayer.js
    }

    destroy() {
        this.removeAllListeners();
    }
}