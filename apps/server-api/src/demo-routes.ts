import { Router } from 'express';

export const demoRouter = Router();

// Demo NPCs
const npcs = [
  { id: '1', name: 'Fry', state: 'idle', zone: 'office', mood: 'happy' },
  { id: '2', name: 'Bender', state: 'working', zone: 'lounge', mood: 'neutral' },
  { id: '3', name: 'Leela', state: 'idle', zone: 'lab', mood: 'busy' },
  { id: '4', name: 'Professor', state: 'working', zone: 'lab', mood: 'busy' },
  { id: '5', name: 'Amy', state: 'socializing', zone: 'lounge', mood: 'happy' },
  { id: '6', name: 'Zoidberg', state: 'idle', zone: 'cafeteria', mood: 'neutral' },
];

// Available zones and states
const zones = ['office', 'lounge', 'lab', 'cafeteria', 'hangar', 'crew-quarters'];
const states = ['idle', 'working', 'walking', 'socializing'];
const moods = ['happy', 'neutral', 'busy', 'excited', 'tired'];

// Auto-wandering NPCs - moves every 5 seconds
setInterval(() => {
  npcs.forEach(npc => {
    // 70% chance to move to a new zone
    if (Math.random() < 0.7) {
      const currentZoneIndex = zones.indexOf(npc.zone);
      let newZoneIndex;
      do {
        newZoneIndex = Math.floor(Math.random() * zones.length);
      } while (newZoneIndex === currentZoneIndex && zones.length > 1);
      npc.zone = zones[newZoneIndex];
    }
    
    // Random state change
    const stateIndex = Math.floor(Math.random() * states.length);
    npc.state = states[stateIndex];
    
    // Random mood change (30% chance)
    if (Math.random() < 0.3) {
      const moodIndex = Math.floor(Math.random() * moods.length);
      npc.mood = moods[moodIndex];
    }
  });
}, 5000);

// Get world status
demoRouter.get('/status', (req, res) => {
  res.json({
    world: 'Planet Express HQ',
    npcs,
    timestamp: new Date().toISOString()
  });
});

// Interact with NPC
demoRouter.post('/interact', (req, res) => {
  const { npcId, action } = req.body;
  const npc = npcs.find(n => n.id === npcId);
  
  if (!npc) {
    return res.status(404).json({ error: 'NPC not found' });
  }
  
  res.json({
    message: `${action} with ${npc.name}`,
    npc,
    response: `Hello! I'm ${npc.name} and I'm currently ${npc.state} in the ${npc.zone}.`
  });
});
