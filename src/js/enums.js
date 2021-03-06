export const actionType = {
    stateChange: 0,
    smartStateChange: 1,
    privateStateChange: 2,
    privateSmartStateChange: 3,
    userDisconnect: 4,
}
export const actionNames = {
    0: 'stateChange',
    1: 'smartStateChange',
    2: 'privateStateChange',
    3: 'privateSmartStateChange',
    4: 'userDisconnect',
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