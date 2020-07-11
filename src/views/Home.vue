<template>
    <div class="home">
        <span>Server state text field:</span><v-text-field v-model="multiplayer.server.state.text"></v-text-field>
        <p :key="updateClient">Client server state:{{JSON.stringify(multiplayer2.client.serverState)}}</p>
    </div>
</template>

<script>
    import Observable from 'observable-slim';
    import {MultiPeerServer, MultiPeerClient} from 'multi-peer'
    import Multiplayer from "@/js/Multiplayer";


    export default {
        name: 'Home',
        components: {},
        data: () => ({
            multiplayer: new Multiplayer('test'),
            multiplayer2: new Multiplayer('test'),
            clientText: '',
            serverText: '',
            updateClient: 0,
        }),
        async mounted() {
            // await this.server.connect('https://api.ruurd.dev');
            // console.log("Server started", this.server);
            // await this.client.connect('https://api.ruurd.dev');
            // console.log("Client started", this.client);

            await this.multiplayer.hostRoom('https://api.ruurd.dev', 'room-name');
            await this.multiplayer.joinRoom('https://api.ruurd.dev', 'room-name');
            await this.multiplayer2.joinRoom('https://api.ruurd.dev', 'room-name');

            console.log(this.multiplayer)
            this.multiplayer.client.state = {
                hello: 'world',
                arr: [2],
                health: 100,
            }
            setTimeout(() => {
                this.multiplayer.client.state.hello += 'bye';
                this.multiplayer.client.state.arr.push(5);
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.wow = 'gang';
                this.multiplayer.server.state.initional = 5;
                this.multiplayer.server.state.text = 'asdf';
            }, 100);
            this.multiplayer2.client.on('server-state-change', () => this.updateClient++);
        },
        beforeDestroy() {
            this.server.destroy();
            this.client.destroy();
            this.multiplayer.destroy();
            console.log("Destroying");
        },
        methods: {
            async joinRoom(room) {
                await this.client.join(room);
                console.log("Room joined");
            },
            createRoom(room) {
                this.server.create(room);
                console.log("Room created");
            },
            clientSend(text) {
                this.client.send(text);
            },
            serverSend(text) {
                this.server.broadcast(text);
            },
        }
    }
</script>
