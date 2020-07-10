export const serverAction = {
    stateChange: 0,
}
export const serverActionNames = {
    0: 'stateChange',
}

export const clientAction = {
    playerStateChange: 0,
    serverStateChange: 1,
}
export const clientActionNames = {
    0: 'playerStateChange',
    1: 'serverStateChange',
}

export const stateChangeType = {
    update: 0,
    add: 1,
    delete: 2,
    reset: 3,
}
export const stateChangeTypeNames = {
    0: 'update',
    1: 'add',
    2: 'delete',
    3: 'reset',
}