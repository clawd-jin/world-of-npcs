/**
 * Zone definitions for world-of-npcs
 */

export enum ZoneType {
  // HQ Interior
  OFFICE_FLOOR = 'office_floor',
  MEETING_ROOM = 'meeting_room',
  LOUNGE = 'lounge',
  LAB = 'lab',
  KITCHEN = 'kitchen',
  DELIVERY_BAY = 'delivery_bay',
  HALLWAYS = 'hallways',
  
  // City
  STREET = 'street',
  SHOP = 'shop',
  PARK = 'park',
  TRANSIT = 'transit',
  LEISURE = 'leisure',
}

export enum ZoneLocation {
  HQ = 'hq',
  CITY = 'city',
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  location: ZoneLocation;
  description: string;
  connectedZones: string[];
  objects: string[]; // Object IDs that can exist in this zone
  properties: Record<string, unknown>;
}

// HQ Interior Zones
export const HQ_ZONES: Record<ZoneType, Zone> = {
  [ZoneType.OFFICE_FLOOR]: {
    id: 'hq_office_floor',
    name: 'Office Floor',
    type: ZoneType.OFFICE_FLOOR,
    location: ZoneLocation.HQ,
    description: 'The main workspace where delivery crews handle paperwork and plan routes',
    connectedZones: ['hq_meeting_room', 'hq_lounge', 'hq_hallways'],
    objects: ['desk', 'chair', 'terminal'],
    properties: { capacity: 20, floorNumber: 1 },
  },
  
  [ZoneType.MEETING_ROOM]: {
    id: 'hq_meeting_room',
    name: 'Meeting Room',
    type: ZoneType.MEETING_ROOM,
    location: ZoneLocation.HQ,
    description: 'Conference room for briefings and team meetings',
    connectedZones: ['hq_office_floor', 'hq_hallways'],
    objects: ['meeting_table', 'chair', 'whiteboard'],
    properties: { capacity: 12, has projector: true },
  },
  
  [ZoneType.LOUNGE]: {
    id: 'hq_lounge',
    name: 'Lounge',
    type: ZoneType.LOUNGE,
    location: ZoneLocation.HQ,
    description: 'Break room for relaxation and casual conversations',
    connectedZones: ['hq_office_floor', 'hq_kitchen', 'hq_hallways'],
    objects: ['chair', 'bench'],
    properties: { capacity: 15, hasTV: true },
  },
  
  [ZoneType.LAB]: {
    id: 'hq_lab',
    name: 'Lab',
    type: ZoneType.LAB,
    location: ZoneLocation.HQ,
    description: 'Research and development laboratory',
    connectedZones: ['hq_hallways'],
    objects: ['terminal', 'desk'],
    properties: { capacity: 8, restricted: true },
  },
  
  [ZoneType.KITCHEN]: {
    id: 'hq_kitchen',
    name: 'Kitchen',
    type: ZoneType.KITCHEN,
    location: ZoneLocation.HQ,
    description: 'Food preparation area with appliances',
    connectedZones: ['hq_lounge', 'hq_hallways'],
    objects: [],
    properties: { hasFridge: true, hasMicrowave: true },
  },
  
  [ZoneType.DELIVERY_BAY]: {
    id: 'hq_delivery_bay',
    name: 'Delivery Bay',
    type: ZoneType.DELIVERY_BAY,
    location: ZoneLocation.HQ,
    description: 'Loading dock for packages and vehicles',
    connectedZones: ['hq_hallways', 'city_street'],
    objects: [],
    properties: { capacity: 5, vehicleAccess: true },
  },
  
  [ZoneType.HALLWAYS]: {
    id: 'hq_hallways',
    name: 'Hallways',
    type: ZoneType.HALLWAYS,
    location: ZoneLocation.HQ,
    description: 'Connecting corridors throughout HQ',
    connectedZones: [
      'hq_office_floor',
      'hq_meeting_room',
      'hq_lounge',
      'hq_lab',
      'hq_kitchen',
      'hq_delivery_bay',
    ],
    objects: ['bounty_board'],
    properties: { width: 3 },
  },
};

// City Zones
export const CITY_ZONES: Record<ZoneType, Zone> = {
  [ZoneType.STREET]: {
    id: 'city_street',
    name: 'Street',
    type: ZoneType.STREET,
    location: ZoneLocation.CITY,
    description: 'Main roads and pathways throughout New New York',
    connectedZones: ['city_shop', 'city_park', 'city_transit', 'hq_delivery_bay'],
    objects: ['bench'],
    properties: { traffic: 'moderate' },
  },
  
  [ZoneType.SHOP]: {
    id: 'city_shop',
    name: 'Shop',
    type: ZoneType.SHOP,
    location: ZoneLocation.CITY,
    description: 'Various retail stores and marketplaces',
    connectedZones: ['city_street'],
    objects: [],
    properties: { types: ['food', 'electronics', 'clothing'] },
  },
  
  [ZoneType.PARK]: {
    id: 'city_park',
    name: 'Park',
    type: ZoneType.PARK,
    location: ZoneLocation.CITY,
    description: 'Green spaces for recreation and relaxation',
    connectedZones: ['city_street', 'city_leisure'],
    objects: ['bench', 'bounty_board'],
    properties: { hasTrees: true, size: 'large' },
  },
  
  [ZoneType.TRANSIT]: {
    id: 'city_transit',
    name: 'Transit Hub',
    type: ZoneType.TRANSIT,
    location: ZoneLocation.CITY,
    description: 'Public transportation stations and terminals',
    connectedZones: ['city_street', 'city_leisure'],
    objects: ['bench'],
    properties: { types: ['bus', 'tube', 'air'] },
  },
  
  [ZoneType.LEISURE]: {
    id: 'city_leisure',
    name: 'Leisure Zone',
    type: ZoneType.LEISURE,
    location: ZoneLocation.CITY,
    description: 'Entertainment venues, restaurants, and nightlife',
    connectedZones: ['city_street', 'city_park', 'city_transit'],
    objects: [],
    properties: { types: ['restaurant', 'cinema', 'bar'] },
  },
};

// All zones combined
export const ZONES: Record<ZoneType, Zone> = {
  ...HQ_ZONES,
  ...CITY_ZONES,
};

export function getZoneById(zoneId: string): Zone | undefined {
  return Object.values(ZONES).find(zone => zone.id === zoneId);
}

export function getZonesByLocation(location: ZoneLocation): Zone[] {
  return Object.values(ZONES).filter(zone => zone.location === location);
}

export function getConnectedZones(zoneId: string): Zone[] {
  const zone = getZoneById(zoneId);
  if (!zone) return [];
  return zone.connectedZones
    .map(id => getZoneById(id))
    .filter((z): z is Zone => z !== undefined);
}
