// Zone colors for visual mapping
export const zoneColors: Record<string, string> = {
  office: '#3498db',
  lounge: '#e74c3c',
  lab: '#2ecc71',
  cafeteria: '#f39c12',
  hangar: '#9b59b6',
  'crew-quarters': '#1abc9c',
};

// Agent avatar colors
export const agentColors: Record<string, string> = {
  fry: '#3498db',
  bender: '#2ecc71',
  leela: '#9b59b6',
  prof_farnsworth: '#e67e22',
  amy_wong: '#e91e63',
  main: '#e74c3c',
};

// Emoji avatars for each NPC
export const agentEmojis: Record<string, string> = {
  fry: '👨‍🚀',
  bender: '🤖',
  leela: '👩‍🦰',
  prof_farnsworth: '👨‍🔬',
  amy_wong: '👩‍🎓',
  main: '🦀',
};

// Zone positions for UI placement (x, y as percentage 0-100)
export const zonePositions: Record<string, { x: number; y: number }> = {
  office: { x: 20, y: 30 },
  lounge: { x: 80, y: 30 },
  lab: { x: 50, y: 20 },
  cafeteria: { x: 80, y: 70 },
  hangar: { x: 20, y: 70 },
  'crew-quarters': { x: 50, y: 80 },
};
