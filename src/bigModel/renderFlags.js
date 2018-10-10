const RENDER_FLAGS = {
    VISIBLE: 1,
    PICKABLE: 1 << 1,
    BACKFACES: 1 << 2,
    CLIPPABLE: 1 << 3,
    COLLIDABLE: 1 << 4,
    GHOSTED: 1 << 5,
    HIGHLIGHTED: 1 << 6,
    EDGES: 1 << 7,
    SELECTED: 1 << 8
};

export {RENDER_FLAGS};