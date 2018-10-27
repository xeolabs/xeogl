const RENDER_FLAGS = {
    VISIBLE: 1,
    CULLED: 1 << 2,
    PICKABLE: 1 << 3,
    CLIPPABLE: 1 << 4,
    COLLIDABLE: 1 << 5,
    CAST_SHADOW: 1 << 6,
    RECEIVE_SHADOW: 1 << 7,
    OUTLINED: 1 << 8,
    GHOSTED: 1 << 9,
    HIGHLIGHTED: 1 << 10,
    SELECTED: 1 << 11,
    EDGES: 1 << 12,
    BACKFACES: 1 << 13
};

export {RENDER_FLAGS};