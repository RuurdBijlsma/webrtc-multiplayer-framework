import {MultiPeerClient} from "multi-peer";
import Observable from "observable-slim";
import {actionType, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "./Player";
import StateUtils from "./StateUtils";
import PrivatePlayer from "./PrivatePlayer";
import Utils from "./Utils";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class MPClient extends MultiPeerClient {
    constructor(appName) {
        super(appName, false);
        this.stateUtils = new StateUtils();

        //Refers to players besides this client, i.e. other players
        this.otherPlayers = [];
        this.me = new PrivatePlayer();
        this.players = [this.me];

        this.serverState = {};
        this.state = {};
        // Private state is only shared with the server, not other players
        this.privateState = {}

        this.setListeners();
    }

    get state() {
        return this.me.state;
    }

    set state(v) {
        this.me.state = v;
    }

    get privateState() {
        return this.me.privateState;
    }

    set privateState(v) {
        this.me.privateState = v;
    }

    setListeners() {
        this.me.on('state-change', stateChange => {
            this.stateUtils.sendStateChange(d => this.send(d), 0, stateChange);
            this.emit('player-state-change', this.me, stateChange);
        });
        this.me.on('private-state-change', stateChange => {
            this.stateUtils.sendStateChange(d => this.send(d), 0, stateChange);
            this.emit('player-private-state-change', this.me, stateChange);
        });
        this.on('data', (id, data) => {
            console.log("[CLIENT]data", data);
            if (!Utils.isReservedData(data)) {
                this.emit('message', id, data);
                return;
            }
            if (Utils.isStateChange(data)) {
                this.handleStateChange(id, data);
            }
            if (data[0] === actionType.userDisconnect) {
                let removedPlayerIndex = this.players.findIndex(p => p.id === data[1]);
                if (removedPlayerIndex !== -1)
                    this.players.splice(removedPlayerIndex);
                else
                    console.warn("[CLIENT] Removed player was not in players list");
            }
        });
    }

    handleStateChange(id, data) {
        let stateChange = this.stateUtils.receiveStateChange(id, data);
        if (stateChange.stateOwner === 0) {
            console.log("[CLIENT] Server state change received", stateChange)
            StateUtils.applyStateChange(this, 'serverState', stateChange);
            this.emit("server-state-change", this.serverState, stateChange);
        } else {
            console.log("[CLIENT] Player state change received", stateChange)
            if (stateChange.stateOwner === this.signal.id) {
                stateChange.stateOwner = 0;
            }
            let player = this.players.find(p => p.id === stateChange.stateOwner);
            if (player === undefined) {
                console.log("[CLIENT] Creating new player")
                player = new Player(stateChange.stateOwner);
                this.otherPlayers.push(player);
                this.players.push(player);
                this.otherPlayers.sort((a, b) => +(a.id > b.id));
                this.players.sort((a, b) => +(a.id > b.id));
            }
            let stateProperty = stateChange.action === actionType.stateChange ? 'state' : 'privateState';
            player.pauseObservable();
            StateUtils.applyStateChange(player, stateProperty, stateChange, true);
            player.resumeObservable();
            this.emit("player-state-change", player, stateChange);
        }
    }
}