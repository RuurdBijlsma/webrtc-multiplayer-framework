<template>
    <div class="platformer">
        <v-btn v-if="host" @click="serverAction">Server action</v-btn>
        <canvas ref="canvas" class="canvas" width="500" height="500" @click="changeBallPos"></canvas>
    </div>
</template>

<script>
    // TODO:
    // Server should be able to change state of players which then propagates to clients
    // Multiplayer has big todo
    import Multiplayer from "../js/Multiplayer";

    export default {
        name: "Platformer",
        props: {
            host: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            canvas: null,
            context: null,
            animationFrame: -1,
            mp: new Multiplayer('platformer'),
            player: {
                velocity: {x: 0, y: 0},
                position: {x: 0, y: 0},
            }
        }),
        beforeDestroy() {
            this.mp.destroy();
            this.cancelAnimationFrame(this.animationFrame);
            clearInterval(this.gametick);
        },
        async mounted() {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext('2d');

            if (this.host) {
                await this.mp.hostRoom('https://api.ruurd.dev', 'room-name');
                this.setBinds();

                const tps = 60;
                this.gametick = setInterval(() => this.tick(), 1000 / tps);
            }
            await this.mp.joinRoom('https://api.ruurd.dev', 'room-name');
            this.mp.client.state.color = ['red', 'blue', 'green', 'orange'][Math.floor(Math.random() * 4)];
            this.render();
        },
        methods: {
            setBinds() {
                document.addEventListener('keypress', e => {
                    switch (e.key) {
                        case 'w':
                        case ' ':
                            this.player.velocity.y -= 25;
                            break;
                        case 'a':
                            this.player.velocity.x -= 2;
                            break;
                        case 's':
                            console.log('duck');
                            break;
                        case 'd':
                            this.player.velocity.x += 2;
                            break;
                    }
                }, false);
            },
            tick() {
                const floorLevel = 300;
                const gravity = 0.8;
                const friction = 1.1;
                //gravity
                this.player.velocity.y += gravity;
                if (this.player.position.y > floorLevel) {
                    this.player.velocity.y = 0;
                }
                this.player.position.x += this.player.velocity.x;
                this.player.position.y += this.player.velocity.y;
                if (this.player.position.y > floorLevel) {
                    this.player.position.y = floorLevel;
                }
                //friction
                this.player.velocity.x /= friction;
                this.player.velocity.y /= friction;
                this.mp.client.me.state.position = {...this.player.position};
                // console.log(this.mp.client.me.state.position.x);
                // console.log(this.player.position, this.player.velocity);
            },
            render() {
                this.animationFrame = requestAnimationFrame(() => this.render());
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // if (this.host) {
                //     let i = 0;
                //     for (let player of this.mp.server.players) {
                //         this.context.fillStyle = 'black';
                //         this.context.font = '20px Arial'
                //         this.context.fillText(`Player ${i}: ${JSON.stringify(player.privateState)}`, 0, ++i * 30);
                //     }
                // }

                for (let player of this.mp.client.players) {
                    this.context.fillStyle = player.state.color;
                    this.context.fillRect(player.state.position?.x, player.state.position?.y, 10, 10);
                }
            },
            handleKey(e) {
                console.log(e);
            },
            serverAction() {
                this.mp.server.players.forEach(p => p.state.position = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height
                })
                this.mp.server.players.forEach(p => p.privateState.yolo = 'bork')
            },
            changeBallPos(e) {
                let {top, left} = this.canvas.getBoundingClientRect();
                let x = e.pageX - left;
                let y = e.pageY - top;
                this.mp.client.state.position = {x, y};
            },
        },
    }
</script>

<style scoped>
    .platformer {
        display: flex;
        flex-direction: column;
    }

    .canvas {
        background-color: white;
        width: 500px;
        height: 500px;
    }
</style>