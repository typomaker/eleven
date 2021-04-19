import World from "./World";

export * from "./Entity";
export * as repository from "./repository";
export * as system from "./system";
export * from "./World";

export const world = new World()
world.start();