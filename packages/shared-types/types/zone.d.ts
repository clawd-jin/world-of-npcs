export interface Point {
    x: number;
    y: number;
}
export type WorldObjectType = 'desk' | 'chair' | 'whiteboard' | 'meeting_table' | 'terminal' | 'bench' | 'bounty_board';
export interface WorldObject {
    id: string;
    type: WorldObjectType;
    position: Point;
    animationAnchors: Point[];
}
export interface ZoneTransition {
    targetZoneId: string;
    position: Point;
    direction: string;
}
export interface ZoneConfig {
    walkable: boolean;
    objects: WorldObject[];
    spawnPoints: Point[];
    transitions: ZoneTransition[];
    ambientRules: string[];
}
export type ZoneType = 'hq_interior' | 'hq_room' | 'city_street' | 'city_shop' | 'city_park' | 'city_transit' | 'city_leisure';
export interface Zone {
    id: string;
    worldId: string;
    name: string;
    type: ZoneType;
    configJson: ZoneConfig;
}
//# sourceMappingURL=zone.d.ts.map