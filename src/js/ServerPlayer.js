import Player from "./Player";

export default class ServerPlayer extends Player{
    constructor(id, peer) {
        super(id, peer);
        this.privateState = {};
    }
}