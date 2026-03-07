/**
 * WorldObject definitions for world-of-npcs
 */

export enum ObjectType {
  DESK = 'desk',
  CHAIR = 'chair',
  WHITEBOARD = 'whiteboard',
  MEETING_TABLE = 'meeting_table',
  TERMINAL = 'terminal',
  BENCH = 'bench',
  BOUNTY_BOARD = 'bounty_board',
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface WorldObject {
  id: string;
  type: ObjectType;
  name: string;
  description: string;
  position: Position;
  rotation?: number;
  interactable: boolean;
  properties: Record<string, unknown>;
}

export const OBJECT_DEFINITIONS: Record<ObjectType, Omit<WorldObject, 'id' | 'position' | 'rotation'>> = {
  [ObjectType.DESK]: {
    type: ObjectType.DESK,
    name: 'Desk',
    description: 'Standard office workstation desk',
    interactable: true,
    properties: {
      width: 1.5,
      height: 0.75,
      depth: 0.8,
      material: 'wood',
      hasDrawers: true,
    },
  },
  
  [ObjectType.CHAIR]: {
    type: ObjectType.CHAIR,
    name: 'Chair',
    description: 'Office chair with wheels',
    interactable: true,
    properties: {
      seatHeight: 0.5,
      hasBackrest: true,
      hasArmrests: false,
      isAdjustable: true,
    },
  },
  
  [ObjectType.WHITEBOARD]: {
    type: ObjectType.WHITEBOARD,
    name: 'Whiteboard',
    description: 'Dry-erase writing surface for presentations',
    interactable: true,
    properties: {
      width: 2,
      height: 1.5,
      hasStand: true,
      markersIncluded: true,
    },
  },
  
  [ObjectType.MEETING_TABLE]: {
    type: ObjectType.MEETING_TABLE,
    name: 'Meeting Table',
    description: 'Large conference table for group discussions',
    interactable: true,
    properties: {
      width: 3,
      height: 0.75,
      depth: 1.5,
      seatingCapacity: 10,
      shape: 'rectangular',
    },
  },
  
  [ObjectType.TERMINAL]: {
    type: ObjectType.TERMINAL,
    name: 'Terminal',
    description: 'Computer workstation for data entry and communication',
    interactable: true,
    properties: {
      hasScreen: true,
      hasKeyboard: true,
      networkAccess: true,
      accessLevel: 'standard',
    },
  },
  
  [ObjectType.BENCH]: {
    type: ObjectType.BENCH,
    name: 'Bench',
    description: 'Outdoor seating for relaxation',
    interactable: true,
    properties: {
      seatingCapacity: 3,
      hasBackrest: false,
      material: 'metal',
      outdoor: true,
    },
  },
  
  [ObjectType.BOUNTY_BOARD]: {
    type: ObjectType.BOUNTY_BOARD,
    name: 'Bounty Board',
    description: 'Public notice board for delivery requests and wanted posters',
    interactable: true,
    properties: {
      hasNotices: true,
      refreshRate: 'daily',
      accessLevel: 'public',
    },
  },
};

export function createObject(
  type: ObjectType,
  position: Position,
  id?: string,
  rotation?: number
): WorldObject {
  const definition = OBJECT_DEFINITIONS[type];
  return {
    id: id || `${type}_${Date.now()}`,
    type,
    name: definition.name,
    description: definition.description,
    position,
    rotation,
    interactable: definition.interactable,
    properties: { ...definition.properties },
  };
}

export function getObjectDefinition(type: ObjectType) {
  return OBJECT_DEFINITIONS[type];
}

export function getObjectById(objects: WorldObject[], objectId: string): WorldObject | undefined {
  return objects.find(obj => obj.id === objectId);
}
