import { Router, Request, Response } from 'express';

// Zone types - self-contained
enum ZoneLocation { HQ = 'hq', CITY = 'city' }
enum ZoneType {
  OFFICE_FLOOR = 'office_floor', MEETING_ROOM = 'meeting_room', LOUNGE = 'lounge',
  LAB = 'lab', KITCHEN = 'kitchen', DELIVERY_BAY = 'delivery_bay', HALLWAYS = 'hallways',
  STREET = 'street', SHOP = 'shop', PARK = 'park', TRANSIT = 'transit', LEISURE = 'leisure',
}

interface Zone {
  id: string; name: string; type: ZoneType; location: ZoneLocation;
  description: string; connectedZones: string[]; objects: string[]; properties: Record<string, unknown>;
}

const ZONES: Record<ZoneType, Zone> = {
  [ZoneType.OFFICE_FLOOR]: { id: 'hq_office_floor', name: 'Office Floor', type: ZoneType.OFFICE_FLOOR, location: ZoneLocation.HQ, description: 'The main workspace', connectedZones: ['hq_meeting_room', 'hq_lounge', 'hq_hallways'], objects: ['desk', 'chair', 'terminal'], properties: { capacity: 20 } },
  [ZoneType.MEETING_ROOM]: { id: 'hq_meeting_room', name: 'Meeting Room', type: ZoneType.MEETING_ROOM, location: ZoneLocation.HQ, description: 'Conference room', connectedZones: ['hq_office_floor', 'hq_hallways'], objects: ['meeting_table', 'chair', 'whiteboard'], properties: { capacity: 12 } },
  [ZoneType.LOUNGE]: { id: 'hq_lounge', name: 'Lounge', type: ZoneType.LOUNGE, location: ZoneLocation.HQ, description: 'Break room', connectedZones: ['hq_office_floor', 'hq_kitchen', 'hq_hallways'], objects: ['chair', 'bench'], properties: { capacity: 15 } },
  [ZoneType.LAB]: { id: 'hq_lab', name: 'Lab', type: ZoneType.LAB, location: ZoneLocation.HQ, description: 'Research lab', connectedZones: ['hq_hallways'], objects: ['terminal', 'desk'], properties: { capacity: 8 } },
  [ZoneType.KITCHEN]: { id: 'hq_kitchen', name: 'Kitchen', type: ZoneType.KITCHEN, location: ZoneLocation.HQ, description: 'Food prep', connectedZones: ['hq_lounge', 'hq_hallways'], objects: [], properties: {} },
  [ZoneType.DELIVERY_BAY]: { id: 'hq_delivery_bay', name: 'Delivery Bay', type: ZoneType.DELIVERY_BAY, location: ZoneLocation.HQ, description: 'Loading dock', connectedZones: ['hq_hallways', 'city_street'], objects: [], properties: { capacity: 5 } },
  [ZoneType.HALLWAYS]: { id: 'hq_hallways', name: 'Hallways', type: ZoneType.HALLWAYS, location: ZoneLocation.HQ, description: 'Corridors', connectedZones: ['hq_office_floor', 'hq_meeting_room', 'hq_lounge', 'hq_lab', 'hq_kitchen', 'hq_delivery_bay'], objects: ['bounty_board'], properties: { width: 3 } },
  [ZoneType.STREET]: { id: 'city_street', name: 'Street', type: ZoneType.STREET, location: ZoneLocation.CITY, description: 'Main roads', connectedZones: ['city_shop', 'city_park', 'city_transit', 'hq_delivery_bay'], objects: ['bench'], properties: { traffic: 'moderate' } },
  [ZoneType.SHOP]: { id: 'city_shop', name: 'Shop', type: ZoneType.SHOP, location: ZoneLocation.CITY, description: 'Retail stores', connectedZones: ['city_street'], objects: [], properties: {} },
  [ZoneType.PARK]: { id: 'city_park', name: 'Park', type: ZoneType.PARK, location: ZoneLocation.CITY, description: 'Green spaces', connectedZones: ['city_street', 'city_leisure'], objects: ['bench', 'bounty_board'], properties: { hasTrees: true } },
  [ZoneType.TRANSIT]: { id: 'city_transit', name: 'Transit Hub', type: ZoneType.TRANSIT, location: ZoneLocation.CITY, description: 'Transport station', connectedZones: ['city_street', 'city_leisure'], objects: ['bench'], properties: {} },
  [ZoneType.LEISURE]: { id: 'city_leisure', name: 'Leisure Zone', type: ZoneType.LEISURE, location: ZoneLocation.CITY, description: 'Entertainment', connectedZones: ['city_street', 'city_park', 'city_transit'], objects: [], properties: {} },
};

function getZoneById(zoneId: string): Zone | undefined { return Object.values(ZONES).find(z => z.id === zoneId); }
function getZonesByLocation(location: ZoneLocation): Zone[] { return Object.values(ZONES).filter(z => z.location === location); }
function getConnectedZones(zoneId: string): Zone[] { const zone = getZoneById(zoneId); if (!zone) return []; return zone.connectedZones.map(id => getZoneById(id)).filter((z): z is Zone => z !== undefined); }

export const worldRouter = Router();
interface Location { zoneId: string; x: number; y: number; }
interface WorldState { players: Map<string, { userId: string; location: Location; lastSeen: number }>; }
const worldState: WorldState = { players: new Map() };
const demoAgents = [
  { id: 'agent-bender', displayName: 'Bender', avatarId: 'bender_avatar', currentState: 'idle', mood: 'good', location: { zoneId: 'hq_office_floor', x: 10, y: 5 } },
  { id: 'agent-fry', displayName: 'Fry', avatarId: 'fry_avatar', currentState: 'idle', mood: 'good', location: { zoneId: 'hq_lounge', x: 3, y: 3 } },
  { id: 'agent-leela', displayName: 'Leela', avatarId: 'leela_avatar', currentState: 'working', mood: 'focused', location: { zoneId: 'hq_office_floor', x: 15, y: 8 } },
];

worldRouter.get('/state', (req: Request, res: Response) => {
  const agentsInZones: Record<string, number> = {};
  demoAgents.forEach(agent => { const z = agent.location.zoneId; agentsInZones[z] = (agentsInZones[z] || 0) + 1; });
  res.json({ worldId: 'planet-express-hq', name: 'Planet Express HQ', timestamp: new Date().toISOString(), stats: { totalZones: Object.keys(ZONES).length, totalAgents: demoAgents.length, activePlayers: worldState.players.size, agentsByZone: agentsInZones }, hqZones: getZonesByLocation(ZoneLocation.HQ).map(z => z.id), cityZones: getZonesByLocation(ZoneLocation.CITY).map(z => z.id) });
});

worldRouter.get('/zones', (req: Request, res: Response) => {
  const location = req.query.location as ZoneLocation | undefined;
  let zones = Object.values(ZONES);
  if (location) zones = zones.filter(z => z.location === location);
  res.json({ zones: zones.map(z => ({ id: z.id, name: z.name, type: z.type, location: z.location, description: z.description, connectedZones: z.connectedZones, objectCount: z.objects.length })), total: zones.length });
});

worldRouter.get('/zones/:id', (req: Request, res: Response) => {
  const { id } = req.params; const zone = getZoneById(id);
  if (!zone) return res.status(404).json({ error: 'Zone not found', zoneId: id });
  const agentsInZone = demoAgents.filter(a => a.location.zoneId === id);
  const connectedZoneDetails = getConnectedZones(id).map(z => ({ id: z.id, name: z.name, type: z.type }));
  res.json({ id: zone.id, name: zone.name, type: zone.type, location: zone.location, description: zone.description, connectedZones: connectedZoneDetails, objects: zone.objects, properties: zone.properties, agents: agentsInZone.map(a => ({ id: a.id, displayName: a.displayName, avatarId: a.avatarId, currentState: a.currentState, mood: a.mood, location: a.location })), playerCount: worldState.players.size });
});

worldRouter.post('/enter', (req: Request, res: Response) => {
  const { userId, playerId, zoneId, x, y } = req.body;
  if (!userId || !playerId || !zoneId) return res.status(400).json({ error: 'Missing required fields: userId, playerId, zoneId' });
  const zone = getZoneById(zoneId);
  if (!zone) return res.status(404).json({ error: 'Zone not found', zoneId });
  const location: Location = { zoneId, x: x ?? Math.floor(Math.random() * 20), y: y ?? Math.floor(Math.random() * 10) };
  worldState.players.set(playerId, { userId, location, lastSeen: Date.now() });
  res.json({ success: true, playerId, location, zone: { id: zone.id, name: zone.name, type: zone.type }, message: 'Welcome to ' + zone.name + '!' });
});

worldRouter.post('/move', (req: Request, res: Response) => {
  const { entityId, entityType, zoneId, x, y } = req.body;
  if (!entityId || !entityType || !zoneId || x === undefined || y === undefined) return res.status(400).json({ error: 'Missing required fields: entityId, entityType, zoneId, x, y' });
  const zone = getZoneById(zoneId);
  if (!zone) return res.status(404).json({ error: 'Zone not found', zoneId });
  if (entityType !== 'agent' && entityType !== 'player') return res.status(400).json({ error: 'entityType must be "agent" or "player"' });
  const newLocation: Location = { zoneId, x, y };
  if (entityType === 'agent') {
    const agent = demoAgents.find(a => a.id === entityId);
    if (!agent) return res.status(404).json({ error: 'Agent not found', agentId: entityId });
    agent.location = newLocation;
  } else {
    const player = worldState.players.get(entityId);
    if (!player) return res.status(404).json({ error: 'Player not found in world', playerId: entityId });
    player.location = newLocation; player.lastSeen = Date.now();
  }
  res.json({ success: true, entityId, entityType, location: newLocation, zone: { id: zone.id, name: zone.name } });
});

// Simulation control
let simulationRunning = false;

worldRouter.get('/sim/status', (req: Request, res: Response) => {
  res.json({ running: simulationRunning, agentCount: demoAgents.length });
});

worldRouter.post('/sim/start', (req: Request, res: Response) => {
  simulationRunning = true;
  res.json({ success: true, running: true, message: 'Simulation started' });
});

worldRouter.post('/sim/stop', (req: Request, res: Response) => {
  simulationRunning = false;
  res.json({ success: true, running: false, message: 'Simulation stopped' });
});
