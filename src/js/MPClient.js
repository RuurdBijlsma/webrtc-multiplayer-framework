import {MultiPeerClient} from "multi-peer";
import Observable from "observable-slim";
import {actionType, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "./Player";
import StateUtils from "./StateUtils";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class MPClient extends MultiPeerClient {
    constructor(appName) {
        super(appName, false);
        this.stateUtils = new StateUtils();
        this.state = {};
        this.serverState = {};
        // Private state is only shared with the server, not other players
        this.privateState = {}

        //Refers to players besides this client, i.e. other players
        this.otherPlayers = [];
        this.me = new Player('me');
        this.me.state = this.state;

        this.setListeners();
    }

    get players() {
        return [...this.otherPlayers, this.me];
    }

    setListeners() {
        this.on('data', (id, data) => {
            console.log("[CLIENT]data", data);
            let [action, ...rest] = this.stateUtils.receiveStateChange(id, data);
            switch (action) {
                case actionType.stateChange:
                    let [stateOwner, changeType, propertyString, value] = rest;
                    console.log("[CLIENT] Receiving state change event", stateOwner)
                    if (stateOwner === 0) {
                        this.stateUtils.applyStateChange(this, 'serverState', changeType, propertyString, value);
                        this.emit("server-state-change", this.serverState);
                    } else {
                        console.log("[CLIENT] Receiving state change event on player state")
                        let player = this.otherPlayers.find(p => p.id === stateOwner);
                        if (player === undefined) {
                            console.log("[CLIENT] Creating new player")
                            player = new Player(stateOwner, null);
                            this.otherPlayers.push(player);
                        }
                        console.log('[CLIENT]', {
                            stateOwner,
                            changeType: stateChangeTypeNames[changeType],
                            propertyString,
                            value
                        });
                        this.stateUtils.applyStateChange(player, 'state', changeType, propertyString, value);
                        this.emit("player-state-change", player);
                    }
                    break;
            }
        });
    }

    set privateState(value) {
        Observable.remove(this._privateState);
        this._privateState = Observable.create(value, false, changes => {
            console.log('[CLIENT] private state change', changes);
            for (let change of changes) {
                this.stateUtils.sendStateChange(d => this.send(d), 0, 0,
                    actionType.privateStateChange, stateChangeType[change.type], change.currentPath, change.newValue);
            }
            this.emit("player-private-state-change", this.me);
        });
        this.emit("player-private-state-change", this.me);
        console.log("[CLIENT] sending private state reset action to server");
        this.stateUtils.sendStateChange(d => this.send(d), 0, 0,
            actionType.privateStateChange, stateChangeType.reset, '', value);
    }

    get privateState() {
        return this._privateState;
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            console.log('[CLIENT] state change', changes);
            for (let change of changes) {
                this.stateUtils.sendStateChange(d => this.send(d), 0, 0,
                    actionType.stateChange, stateChangeType[change.type], change.currentPath, change.newValue);
            }
            this.emit("player-state-change", this.me);
        });
        this.emit("player-state-change", this.me);
        console.log("[CLIENT] sending reset action to server");
        this.stateUtils.sendStateChange(d => this.send(d), 0, 0,
            actionType.stateChange, stateChangeType.reset, '', value);
    }

    get state() {
        return this._state;
    }
}