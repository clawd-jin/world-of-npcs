import { Router } from 'express';

// Zone positions for NPC placement (0-100 coordinate system)
// HQ Interior Zones (0-50 x range)
const hqZones: Record<string, { x: number; y: number }> = {
  office: { x: 20, y: 30 },
  lounge: { x: 80, y: 30 },
  lab: { x: 50, y: 20 },
  cafeteria: { x: 80, y: 70 },
  hangar: { x: 20, y: 70 },
  'crew-quarters': { x: 50, y: 80 },
};

// City Exterior Zones (50-100 x range, representing outdoor city)
const cityZones = {
  // Streets - main thoroughfares
  'main-street': { x: 55, y: 50 },
  'side-street': { x: 70, y: 30 },
  'alley': { x: 85, y: 75 },
  // Storefronts - shops and businesses
  'robot-shop': { x: 60, y: 25 },
  'food-court': { x: 75, y: 45 },
  'tech-store': { x: 90, y: 60 },
  // Parks - green spaces
  'central-park': { x: 65, y: 70 },
  'plaza': { x: 80, y: 85 },
  // Transit - transportation hubs
  'bus-stop': { x: 55, y: 85 },
  'metro-entrance': { x: 95, y: 40 },
  // Leisure - entertainment
  'cinema': { x: 60, y: 90 },
  'arcade': { x: 85, y: 20 },
  'bar': { x: 70, y: 55 },
};

// Combined zone positions
const zonePositions: Record<string, { x: number; y: number }> = {
  ...hqZones,
  ...cityZones,
};

// Current world location
let currentWorld = 'hq'; // 'hq' or 'city'

// Relationship tracking between agents
interface Relationship {
  checkerId: string;
  checkedId: string;
  checkCount: number;
  lastCheck: string;
  quality: 'good' | 'neutral' | 'poor';
}

interface InteractionEvent {
  id: string;
  type: 'check' | 'comment';
  fromAgent: string;
  toAgent: string;
  message: string;
  timestamp: string;
  moodChange?: { agent: string; delta: number };
}

// Store relationships and interaction events
const relationships: Map<string, Relationship> = new Map();
const interactionEvents: InteractionEvent[] = [];

// Activity log for frontend
let activityLog: any[] = [];

export const demoRouter = Router();

// Fun comments when agents check on each other
function generateCheckComment(checkerName: string, checkedName: string, state: string, mood: string): string {
  const comments: Record<string, string[]> = {
    'working': [
      `"Hey ${checkedName}, looks like you're actually doing work for once!" - ${checkerName}`,
      `"${checkedName} is hard at work. Color me impressed." - ${checkerName}`,
      `"${checkedName}, that project is coming along nicely!" - ${checkerName}`,
      `"Good progress, ${checkedName}! Keep it up!" - ${checkerName}`,
    ],
    'idle': [
      `"${checkedName}! Slacking off again, I see!" - ${checkerName}`,
      `"Hey ${checkedName}, why aren't you working?" - ${checkerName}`,
      `"${checkedName} looks like they could use something to do..." - ${checkerName}`,
      `"${checkedName} is taking a break. Must be nice!" - ${checkerName}`,
    ],
    'walking': [
      `"${checkedName} is on the move! Where ya headed?" - ${checkerName}`,
      `"Hey ${checkedName}, running late for something?" - ${checkerName}`,
      `"${checkedName} is off to ${checkedName.toLowerCase().includes('fry') ? 'get some nappies' : 'somewhere'}!" - ${checkerName}`,
    ],
    'socializing': [
      `"Ooh ${checkedName}, making friends I see!" - ${checkerName}`,
      `"${checkedName}! Chatting it up, eh?" - ${checkerName}`,
      `"${checkedName} looks like they're having fun!" - ${checkerName}`,
    ],
    'busy': [
      `"${checkedName} is swamped! Want some help?" - ${checkerName}`,
      `"Wow ${checkedName}, you've got a lot on your plate!" - ${checkerName}`,
      `"I'll leave you to it, ${checkedName}!" - ${checkerName}`,
    ],
  };

  const stateComments = comments[state] || comments['idle'];
  const comment = stateComments[Math.floor(Math.random() * stateComments.length)];

  // Add mood-based twist
  if (mood === 'happy' || mood === 'excited') {
    return comment + " 😊";
  } else if (mood === 'tired') {
    return comment.replace('"', '"...').replace('!', ', maybe get some rest though!');
  }
  return comment;
}

// Get or create relationship between two agents
function getOrCreateRelationship(checkerId: string, checkedId: string): Relationship {
  const key = `${checkerId}->${checkedId}`;
  const existing = relationships.get(key);
  
  if (existing) {
    existing.checkCount++;
    existing.lastCheck = new Date().toISOString();
    return existing;
  }
  
  const newRel: Relationship = {
    checkerId,
    checkedId,
    checkCount: 1,
    lastCheck: new Date().toISOString(),
    quality: 'neutral',
  };
  relationships.set(key, newRel);
  return newRel;
}

// Add activity to log
function addActivityLog(event: Omit<InteractionEvent, 'id' | 'timestamp'>) {
  const activity = {
    id: `act_${Date.now()}`,
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  interactionEvents.unshift(activity);
  
  // Keep only last 50 events
  if (interactionEvents.length > 50) {
    interactionEvents.pop();
  }
  
  // Also add to frontend-compatible activity format
  const frontendActivity = {
    id: activity.id,
    type: event.type === 'check' ? 'agent_status' : 'interaction',
    title: `${event.fromAgent} checked on ${event.toAgent}`,
    description: event.message,
    agent: event.fromAgent,
    timestamp: activity.timestamp,
    emoji: '👀',
    color: '#00D4FF',
  };
  
  activityLog.unshift(frontendActivity);
  if (activityLog.length > 20) {
    activityLog.pop();
  }
  
  return activity;
}

// Update mood based on interaction
function updateMoodAfterCheck(checker: NPC, checked: NPC): number {
  const moodChanges: Record<string, number> = {
    'happy': 5,
    'neutral': 2,
    'excited': 8,
    'tired': -5,
    'bored': -2,
    'stressed': 3,
  };
  
  const change = moodChanges[checked.mood] || 0;
  
  // Update checked agent's mood slightly
  const moods = ['happy', 'neutral', 'busy', 'excited', 'tired'];
  const newMoodIndex = Math.min(moods.length - 1, Math.max(0, moods.indexOf(checked.mood) + (change > 0 ? -1 : 1)));
  checked.mood = moods[newMoodIndex];
  
  return change;
}

// Movement speed in units per tick (smooth walking)
const MOVE_SPEED = 0.5;

// Demo NPCs mapped to real OpenClaw agents
interface NPC {
  id: string;
  name: string;
  agentId: string;
  state: string;
  zone: string;
  world: 'hq' | 'city';  // Current world location
  mood: string;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  moving: boolean;
  speed: number;
}

const npcs: NPC[] = [
  { id: '1', name: 'Fry', agentId: 'fry', state: 'idle', zone: 'office', world: 'hq', mood: 'happy', x: 20, y: 30, moving: false, speed: MOVE_SPEED },
  { id: '2', name: 'Bender', agentId: 'bender', state: 'working', zone: 'lounge', world: 'hq', mood: 'neutral', x: 80, y: 30, moving: false, speed: MOVE_SPEED * 0.8 },
  { id: '3', name: 'Leela', agentId: 'leela', state: 'idle', zone: 'lab', world: 'hq', mood: 'busy', x: 50, y: 20, moving: false, speed: MOVE_SPEED * 1.2 },
  { id: '4', name: 'Professor', agentId: 'prof_farnsworth', state: 'working', zone: 'lab', world: 'hq', mood: 'busy', x: 50, y: 20, moving: false, speed: MOVE_SPEED * 0.3 },
  { id: '5', name: 'Amy', agentId: 'amy_wong', state: 'socializing', zone: 'lounge', world: 'hq', mood: 'happy', x: 80, y: 30, moving: false, speed: MOVE_SPEED * 1.0 },
  { id: '6', name: 'Zoidberg', agentId: 'main', state: 'idle', zone: 'cafeteria', world: 'hq', mood: 'neutral', x: 80, y: 70, moving: false, speed: MOVE_SPEED * 0.6 },
  { id: '7', name: 'Conrad', agentId: 'conrad', state: 'working', zone: 'office', world: 'hq', mood: 'focused', x: 20, y: 30, moving: false, speed: MOVE_SPEED * 0.9 },
];

const hqZoneList = ['office', 'lounge', 'lab', 'cafeteria', 'hangar', 'crew-quarters'];
const cityZoneList = [
  // Streets
  'main-street', 'side-street', 'alley',
  // Storefronts
  'robot-shop', 'food-court', 'tech-store',
  // Parks
  'central-park', 'plaza',
  // Transit
  'bus-stop', 'metro-entrance',
  // Leisure
  'cinema', 'arcade', 'bar'
];
const zones = [...hqZoneList, ...cityZoneList];
const states = ['idle', 'working', 'walking', 'socializing'];
const moods = ['happy', 'neutral', 'busy', 'excited', 'tired'];

// Helper to get position for a zone (adjusts for world)
function getPositionForZone(zone: string, world: 'hq' | 'city' = 'hq') {
  const pos = zonePositions[zone];
  if (!pos) return { x: 50, y: 50 };
  
  // City zones are in 50-100 range, HQ in 0-50 range
  // Adjust position based on world view
  if (world === 'city' && hqZones[zone]) {
    // Transform HQ coordinates to city view (multiply by 2 to spread across 0-100)
    return { x: pos.x * 2, y: pos.y * 2 };
  }
  return pos;
}

// Linear interpolation
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Distance between two points
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Update NPC movement - call this frequently for smooth animation
function updateMovement() {
  npcs.forEach(npc => {
    if (npc.moving && npc.targetX !== undefined && npc.targetY !== undefined) {
      const dist = distance(npc.x, npc.y, npc.targetX, npc.targetY);
      
      if (dist < npc.speed) {
        // Arrived at destination
        npc.x = npc.targetX;
        npc.y = npc.targetY;
        npc.moving = false;
        npc.targetX = undefined;
        npc.targetY = undefined;
        npc.state = 'idle';
      } else {
        // Move towards target
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const angle = Math.atan2(dy, dx);
        
        npc.x += Math.cos(angle) * npc.speed;
        npc.y += Math.sin(angle) * npc.speed;
        npc.state = 'walking';
      }
    }
  });
}

// Pick a new target zone for wandering - can switch worlds occasionally
function pickNearbyZone(currentZone: string, currentWorld: 'hq' | 'city'): { zone: string; world: 'hq' | 'city' } {
  const currentPos = getPositionForZone(currentZone, currentWorld);
  
  // 15% chance to switch worlds
  const switchWorld = Math.random() < 0.15;
  
  if (switchWorld) {
    const newWorld = currentWorld === 'hq' ? 'city' : 'hq';
    const targetZones = newWorld === 'hq' ? hqZoneList : cityZoneList;
    const newZone = targetZones[Math.floor(Math.random() * targetZones.length)];
    return { zone: newZone, world: newWorld };
  }
  
  // Stay in same world - pick nearby zone
  const zonesInWorld = currentWorld === 'hq' ? hqZoneList : cityZoneList;
  
  // Calculate distance to all zones in current world and sort by proximity
  const zoneDistances = zonesInWorld
    .filter(z => z !== currentZone)
    .map(zone => ({
      zone,
      dist: distance(currentPos.x, currentPos.y, getPositionForZone(zone, currentWorld).x, getPositionForZone(zone, currentWorld).y)
    }))
    .sort((a, b) => a.dist - b.dist);
  
  // Pick from nearby zones (70% chance from top 3 closest, 30% random)
  if (Math.random() < 0.7 && zoneDistances.length >= 3) {
    const nearby = zoneDistances.slice(0, 3);
    const chosen = nearby[Math.floor(Math.random() * nearby.length)];
    return { zone: chosen.zone, world: currentWorld };
  }
  
  const chosenZone = zonesInWorld[Math.floor(Math.random() * zonesInWorld.length)];
  return { zone: chosenZone, world: currentWorld };
}

// Auto-wander every 8 seconds - set new movement targets
setInterval(() => {
  npcs.forEach(npc => {
    // Only start new movement if not currently moving
    if (!npc.moving && Math.random() < 0.7) {
      const { zone: newZone, world: newWorld } = pickNearbyZone(npc.zone, npc.world);
      
      // If world changed, update NPC's world
      if (newWorld !== npc.world) {
        npc.world = newWorld;
      }
      
      const targetPos = getPositionForZone(newZone, npc.world);
      
      // Add some randomness to target position (within 5 units of zone center)
      npc.targetX = targetPos.x + (Math.random() - 0.5) * 10;
      npc.targetY = targetPos.y + (Math.random() - 0.5) * 10;
      npc.zone = newZone;
      npc.moving = true;
    }
    
    // Occasional mood changes
    if (Math.random() < 0.2) {
      npc.mood = moods[Math.floor(Math.random() * moods.length)];
    }
  });
}, 8000);

// Auto NPC-to-NPC checking every ~10 seconds
setInterval(() => {
  // 60% chance to trigger a check event
  if (Math.random() < 0.6 && npcs.length >= 2) {
    // Pick two different random NPCs
    const checkerIndex = Math.floor(Math.random() * npcs.length);
    let checkedIndex = Math.floor(Math.random() * npcs.length);
    
    // Make sure they're different
    while (checkedIndex === checkerIndex) {
      checkedIndex = Math.floor(Math.random() * npcs.length);
    }
    
    const checker = npcs[checkerIndex];
    const checked = npcs[checkedIndex];
    
    // Generate fun comment
    const comment = generateCheckComment(checker.name, checked.name, checked.state, checked.mood);
    
    // Update relationship
    const relationship = getOrCreateRelationship(checker.id, checked.id);
    
    // Update moods
    const moodDelta = updateMoodAfterCheck(checker, checked);
    
    // Add to activity log
    addActivityLog({
      type: 'check',
      fromAgent: checker.name,
      toAgent: checked.name,
      message: comment,
      moodChange: { agent: checked.name, delta: moodDelta }
    });
    
    console.log(`🤖 ${checker.name} checked on ${checked.name}: ${comment.substring(0, 50)}...`);
  }
}, 10000);

// Run movement updates every 100ms for smooth animation
setInterval(updateMovement, 100);

// Get world status
demoRouter.get('/status', (req, res) => {
  res.json({
    world: currentWorld === 'hq' ? 'Planet Express HQ' : 'New New York City',
    currentWorld,
    npcs: npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      agentId: npc.agentId,
      state: npc.state,
      zone: npc.zone,
      world: npc.world,
      mood: npc.mood,
      x: Math.round(npc.x * 10) / 10,
      y: Math.round(npc.y * 10) / 10,
      moving: npc.moving,
      targetX: npc.targetX ? Math.round(npc.targetX * 10) / 10 : null,
      targetY: npc.targetY ? Math.round(npc.targetY * 10) / 10 : null
    })),
    activities: activityLog.slice(0, 10), // Include recent activities
    zones,
    hqZones,
    cityZones,
    zonePositions,
    timestamp: new Date().toISOString()
  });
});

// Get specific agent details
demoRouter.get('/agents/:id', (req, res) => {
  const { id } = req.params;
  
  // Try to find by id or agentId
  let npc = npcs.find(n => n.id === id || n.agentId === id);
  
  if (!npc) {
    return res.status(404).json({ error: 'Agent not found', agentId: id });
  }
  
  res.json({
    id: npc.id,
    name: npc.name,
    agentId: npc.agentId,
    state: npc.state,
    zone: npc.zone,
    world: npc.world,
    mood: npc.mood,
    position: {
      x: Math.round(npc.x * 10) / 10,
      y: Math.round(npc.y * 10) / 10
    },
    movement: {
      moving: npc.moving,
      speed: npc.speed,
      targetX: npc.targetX ? Math.round(npc.targetX * 10) / 10 : null,
      targetY: npc.targetY ? Math.round(npc.targetY * 10) / 10 : null
    },
    metadata: {
      personality: getPersonality(npc.name),
      catchphrase: getCatchphrase(npc.name)
    },
    timestamp: new Date().toISOString()
  });
});

// Helper functions for personality info
function getPersonality(name: string): string {
  const personalities: Record<string, string> = {
    'Fry': 'Optimistic, naive delivery boy',
    'Bender': 'Robotic, lazy, loves bending',
    'Leela': 'Competent, no-nonsense captain',
    'Professor': 'Eccentric, mad scientist',
    'Amy': 'Enthusiastic, wealthy intern',
    'Zoidberg': 'Well-meaning, unlucky doctor'
  };
  return personalities[name] || 'Unknown';
}

function getCatchphrase(name: string): string {
  const catchphrases: Record<string, string> = {
    'Fry': "I'm Bender, baby!",
    'Bender': "Bite my shiny metal ass!",
    'Leela': "It's a living.",
    'Professor': "Good news everyone!",
    'Amy': "Like, oh my gosh!",
    'Zoidberg': "Why not Zoidberg?"
  };
  return catchphrases[name] || '';
}

// Ping an agent (sends message via OpenClaw CLI)
demoRouter.post('/ping', async (req, res) => {
  const { agentId, message } = req.body;
  const npc = npcs.find(n => n.agentId === agentId);
  
  if (!npc) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const fullMessage = message || `Hello from ${npc.name}! What's up?`;
  
  try {
    const { execSync } = await import('child_process');
    execSync(`openclaw message --to ${npc.agentId} --message "${fullMessage}"`, { encoding: 'utf8' });
    
    res.json({
      success: true,
      message: `Pinged ${npc.name}!`,
      agentResponse: 'Message sent via Discord!'
    });
  } catch (err) {
    res.json({
      success: true,
      message: `Pinged ${npc.name}!`,
      note: 'Agent may respond on Discord'
    });
  }
});

// Interact with NPC (local interaction)
demoRouter.post('/interact', (req, res) => {
  const { npcId, action } = req.body;
  const npc = npcs.find(n => n.id === npcId);
  
  if (!npc) {
    return res.status(404).json({ error: 'NPC not found' });
  }
  
  const responses: Record<string, string> = {
    greet: `Hey there! I'm ${npc.name}!`,
    wave: `${npc.name} waves back at you!`,
    ask: `${npc.name} looks up from their work...`,
    task: `${npc.name}: "I've got work to do in the ${npc.zone}!"`,
    goto: `${npc.name}: "Sure, I'll head to ${npc.world === 'hq' ? 'the city' : 'the HQ'}!"`,
  };
  
  // Handle world travel request
  if (action === 'travel') {
    const newWorld = npc.world === 'hq' ? 'city' : 'hq';
    const targetZones = newWorld === 'hq' ? hqZoneList : cityZoneList;
    const newZone = targetZones[Math.floor(Math.random() * targetZones.length)];
    const targetPos = getPositionForZone(newZone, newWorld);
    
    npc.world = newWorld;
    npc.zone = newZone;
    npc.targetX = targetPos.x + (Math.random() - 0.5) * 10;
    npc.targetY = targetPos.y + (Math.random() - 0.5) * 10;
    npc.moving = true;
    npc.state = 'walking';
  }
  
  res.json({
    message: `${action} with ${npc.name}`,
    npc: {
      id: npc.id,
      name: npc.name,
      agentId: npc.agentId,
      state: npc.state,
      zone: npc.zone,
      world: npc.world,
      mood: npc.mood,
      x: Math.round(npc.x * 10) / 10,
      y: Math.round(npc.y * 10) / 10
    },
    response: responses[action] || `${npc.name} acknowledges you!`
  });
});

// Switch world view (HQ <-> City)
demoRouter.post('/world/switch', (req, res) => {
  currentWorld = currentWorld === 'hq' ? 'city' : 'hq';
  res.json({
    success: true,
    world: currentWorld,
    worldName: currentWorld === 'hq' ? 'Planet Express HQ' : 'New New York City'
  });
});

// Get/set current world
demoRouter.get('/world', (req, res) => {
  res.json({
    world: currentWorld,
    worldName: currentWorld === 'hq' ? 'Planet Express HQ' : 'New New York City'
  });
});

// Get all agents (summary)
demoRouter.get('/agents', (req, res) => {
  res.json({
    agents: npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      agentId: npc.agentId,
      state: npc.state,
      zone: npc.zone,
      world: npc.world,
      mood: npc.mood,
      x: Math.round(npc.x * 10) / 10,
      y: Math.round(npc.y * 10) / 10,
      moving: npc.moving
    })),
    total: npcs.length
  });
});

// Agent-to-agent: One agent checks on another
demoRouter.post('/check/:targetAgentId', (req, res) => {
  const { targetAgentId } = req.params;
  const { checkerAgentId } = req.body;
  
  // If no checker specified, pick a random one
  const checker = checkerAgentId 
    ? npcs.find(n => n.agentId === checkerAgentId || n.id === checkerAgentId)
    : npcs[Math.floor(Math.random() * npcs.length)];
    
  const checked = npcs.find(n => n.agentId === targetAgentId || n.id === targetAgentId);
  
  if (!checker || !checked) {
    return res.status(404).json({ 
      error: 'Agent not found',
      message: checker ? `Target ${targetAgentId} not found` : `Checker not found`
    });
  }
  
  // Can't check on yourself
  if (checker.id === checked.id) {
    return res.status(400).json({ error: "Can't check on yourself!" });
  }
  
  // Generate fun comment
  const comment = generateCheckComment(checker.name, checked.name, checked.state, checked.mood);
  
  // Update relationship
  const relationship = getOrCreateRelationship(checker.id, checked.id);
  
  // Update moods
  const moodDelta = updateMoodAfterCheck(checker, checked);
  
  // Add to activity log
  const activity = addActivityLog({
    type: 'check',
    fromAgent: checker.name,
    toAgent: checked.name,
    message: comment,
    moodChange: { agent: checked.name, delta: moodDelta }
  });
  
  res.json({
    success: true,
    message: comment,
    checker: {
      id: checker.id,
      name: checker.name,
      state: checker.state,
      mood: checker.mood
    },
    checked: {
      id: checked.id,
      name: checked.name,
      state: checked.state,
      zone: checked.zone,
      mood: checked.mood,
      moodChange: moodDelta
    },
    relationship: {
      checkCount: relationship.checkCount,
      quality: relationship.quality
    },
    activityId: activity.id
  });
});

// Get relationships for an agent
demoRouter.get('/relationships/:agentId', (req, res) => {
  const { agentId } = req.params;
  
  const agent = npcs.find(n => n.agentId === agentId || n.id === agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // Find all relationships involving this agent
  const agentRelationships: Relationship[] = [];
  relationships.forEach((rel) => {
    if (rel.checkerId === agent.id || rel.checkedId === agent.id) {
      agentRelationships.push(rel);
    }
  });
  
  // Enrich with agent names
  const enriched = agentRelationships.map(rel => ({
    ...rel,
    checkerName: npcs.find(n => n.id === rel.checkerId)?.name || 'Unknown',
    checkedName: npcs.find(n => n.id === rel.checkedId)?.name || 'Unknown'
  }));
  
  res.json({
    agentId: agent.id,
    agentName: agent.name,
    relationships: enriched
  });
});

// Get interaction events
demoRouter.get('/interactions', (req, res) => {
  const { limit } = req.query;
  const maxEvents = Math.min(Number(limit) || 20, 50);
  
  res.json({
    events: interactionEvents.slice(0, maxEvents),
    total: interactionEvents.length
  });
});

// Get activity log for frontend
demoRouter.get('/activity-log', (req, res) => {
  res.json({
    activities: activityLog,
    total: activityLog.length
  });
});

// Trigger manual random check (for testing or UI button)
demoRouter.post('/trigger-check', (req, res) => {
  // Pick two different random NPCs
  const checkerIndex = Math.floor(Math.random() * npcs.length);
  let checkedIndex = Math.floor(Math.random() * npcs.length);
  
  // Make sure they're different
  while (checkedIndex === checkerIndex) {
    checkedIndex = Math.floor(Math.random() * npcs.length);
  }
  
  const checker = npcs[checkerIndex];
  const checked = npcs[checkedIndex];
  
  const comment = generateCheckComment(checker.name, checked.name, checked.state, checked.mood);
  const relationship = getOrCreateRelationship(checker.id, checked.id);
  const moodDelta = updateMoodAfterCheck(checker, checked);
  
  const activity = addActivityLog({
    type: 'check',
    fromAgent: checker.name,
    toAgent: checked.name,
    message: comment,
    moodChange: { agent: checked.name, delta: moodDelta }
  });
  
  res.json({
    success: true,
    message: comment,
    checker: { id: checker.id, name: checker.name },
    checked: { id: checked.id, name: checked.name, mood: checked.mood, state: checked.state },
    activity
  });
});
