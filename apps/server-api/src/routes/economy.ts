import { Router, Request, Response } from 'express';
import { Wallet } from '@world-of-npcs/shared-types';

const router = Router();

// In-memory wallet store
const wallets: Map<string, Wallet> = new Map();

// Marketplace item categories
export type ItemCategory = 'ship' | 'upgrade' | 'consumable' | 'license' | 'skill_book' | 'food' | 'office';

// Marketplace item interface
export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: ItemCategory;
  effect?: {
    type: 'energy' | 'xp' | 'skill';
    value: number;
  };
}

// Sample marketplace items
const marketplaceItems: MarketplaceItem[] = [
  // Ship upgrades
  {
    id: 'ship-hull-1',
    name: 'Reinforced Hull Plating',
    description: 'Basic protection against asteroid impacts and debris',
    price: 2500,
    emoji: '🛸',
    category: 'ship',
  },
  {
    id: 'ship-engine-1',
    name: 'Quantum Drive Engine',
    description: 'Faster-than-light travel capability for long-distance deliveries',
    price: 8000,
    emoji: '🚀',
    category: 'ship',
  },
  {
    id: 'ship-cargo-1',
    name: 'Expanded Cargo Bay',
    description: 'Increase carrying capacity by 50%',
    price: 3200,
    emoji: '📦',
    category: 'ship',
  },
  
  // Consumables
  {
    id: 'fuel-cell',
    name: 'Quantum Fuel Cell',
    description: 'High-efficiency fuel for long-range deliveries',
    price: 500,
    emoji: '⚡',
    category: 'consumable',
    effect: { type: 'energy', value: 50 },
  },
  {
    id: 'emergency-rations',
    name: 'Emergency Rations',
    description: 'Food supplies for long-haul flights',
    price: 150,
    emoji: '🍔',
    category: 'food',
    effect: { type: 'energy', value: 25 },
  },
  {
    id: 'coffee-deluxe',
    name: 'Premium Coffee Blend',
    description: 'The finest 31st-century coffee beans. +20% efficiency!',
    price: 80,
    emoji: '☕',
    category: 'consumable',
    effect: { type: 'energy', value: 20 },
  },
  {
    id: 'energy-drink',
    name: 'Turbo Energy Drink',
    description: 'Maximum power! +40 energy but watch out for the crash.',
    price: 200,
    emoji: '🥤',
    category: 'consumable',
    effect: { type: 'energy', value: 40 },
  },
  
  // Office supplies
  {
    id: 'desk-plant',
    name: 'Luminescent Desk Plant',
    description: 'Boosts agent mood and workspace satisfaction',
    price: 300,
    emoji: '🪴',
    category: 'office',
  },
  {
    id: 'ergonomic-chair',
    name: 'Zero-G Ergonomic Chair',
    description: 'Perfect posture for long shifts at the terminal',
    price: 1200,
    emoji: '🪑',
    category: 'office',
  },
  {
    id: 'holo-computer',
    name: 'Holographic Terminal',
    description: 'State-of-the-art display for maximum productivity',
    price: 3500,
    emoji: '💻',
    category: 'office',
  },
  
  // Skill books
  {
    id: 'skill-coding-basic',
    name: 'Basic Coding Manual',
    description: 'Learn fundamental programming concepts',
    price: 500,
    emoji: '📘',
    category: 'skill_book',
    effect: { type: 'xp', value: 100 },
  },
  {
    id: 'skill-navigation-advanced',
    name: 'Advanced Navigation Systems',
    description: 'Master deep-space route planning',
    price: 1500,
    emoji: '🧭',
    category: 'skill_book',
    effect: { type: 'xp', value: 300 },
  },
  {
    id: 'skill-pilot-master',
    name: 'Master Pilot\'s Guide',
    description: 'The secrets of elite space pilots',
    price: 2500,
    emoji: '✈️',
    category: 'skill_book',
    effect: { type: 'xp', value: 500 },
  },
  
  // Licenses
  {
    id: 'license-agent',
    name: 'Autonomous Agent License',
    description: 'License to operate autonomous delivery agents',
    price: 1000,
    emoji: '📜',
    category: 'license',
  },
  {
    id: 'license-weapons',
    name: 'Weapons Certification',
    description: 'Permission to equip defensive systems',
    price: 5000,
    emoji: '🔫',
    category: 'license',
  },
  
  // Upgrades
  {
    id: 'nav-module',
    name: 'Advanced Navigation Module',
    description: 'Advanced GPS for deep space navigation',
    price: 1800,
    emoji: '📡',
    category: 'upgrade',
  },
  {
    id: 'shield-generator',
    name: 'Personal Shield Generator',
    description: 'Protects agent from environmental hazards',
    price: 4500,
    emoji: '🛡️',
    category: 'upgrade',
  },
];

// Agent info cache (for display names)
const agentNames: Record<string, string> = {
  'agent-bender': 'Bender',
  'agent-fry': 'Fry',
  'agent-leela': 'Leela',
  'agent-amy': 'Amy',
  'agent-zoidberg': 'Zoidberg',
};

// Initialize with some sample wallets
const sampleWallets: Record<string, Wallet> = {
  'agent-bender': { balance: 5000, lifetimeEarnings: 15000 },
  'agent-fry': { balance: 3250, lifetimeEarnings: 12500 },
  'agent-leela': { balance: 8750, lifetimeEarnings: 35000 },
};

// Initialize wallets
Object.entries(sampleWallets).forEach(([id, wallet]) => {
  wallets.set(id, wallet);
});

// Helper to get or create wallet
function getWallet(agentId: string): Wallet {
  if (!wallets.has(agentId)) {
    wallets.set(agentId, { balance: 0, lifetimeEarnings: 0 });
  }
  return wallets.get(agentId)!;
}

// GET /api/economy - Get economy overview
router.get('/', (req: Request, res: Response) => {
  const totalCredits = Array.from(wallets.values()).reduce((sum: number, w) => sum + w.balance, 0);
  
  res.json({
    credits: totalCredits, // For mobile app compatibility
    totalCredits,
    agentCount: wallets.size,
    items: marketplaceItems,
    lastUpdated: new Date().toISOString(),
  });
});

// GET /api/economy/items - List items for sale
router.get('/items', (req: Request, res: Response) => {
  const category = req.query.category as ItemCategory | undefined;
  
  let items = marketplaceItems;
  if (category) {
    items = marketplaceItems.filter(item => item.category === category);
  }
  
  res.json({
    items,
    categories: [...new Set(marketplaceItems.map(i => i.category))],
  });
});

// GET /api/economy/items/:id - Get specific item
router.get('/items/:id', (req: Request, res: Response) => {
  const item = marketplaceItems.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

// POST /api/economy/buy - Buy item
router.post('/buy', (req: Request, res: Response) => {
  const { agentId, itemId } = req.body;
  
  if (!agentId || !itemId) {
    return res.status(400).json({ error: 'agentId and itemId are required' });
  }
  
  const wallet = getWallet(agentId);
  const item = marketplaceItems.find(i => i.id === itemId);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  if (wallet.balance < item.price) {
    return res.status(400).json({ 
      error: 'Insufficient funds',
      required: item.price,
      available: wallet.balance,
    });
  }
  
  // Deduct credits
  wallet.balance -= item.price;
  
  res.json({
    success: true,
    message: `Purchased ${item.name} for ${item.price} credits`,
    purchase: {
      itemId: item.id,
      itemName: item.name,
      emoji: item.emoji,
      cost: item.price,
      newBalance: wallet.balance,
    },
  });
});

// GET /api/economy/agent/:id - Get agent wallet
router.get('/agent/:id', (req: Request, res: Response) => {
  const wallet = wallets.get(req.params.id);
  
  if (!wallet) {
    // Return default wallet for unknown agents
    return res.json({
      agentId: req.params.id,
      agentName: agentNames[req.params.id] || 'Unknown Agent',
      wallet: { balance: 0, lifetimeEarnings: 0 },
    });
  }
  
  res.json({
    agentId: req.params.id,
    agentName: agentNames[req.params.id] || 'Unknown Agent',
    wallet,
  });
});

// POST /api/economy/agent/:id/reward - Add reward to agent wallet (for bounties/tasks)
router.post('/agent/:id/reward', (req: Request, res: Response) => {
  const { amount, source, type } = req.body;
  
  if (!amount || !source || !type) {
    return res.status(400).json({ error: 'amount, source, and type are required' });
  }
  
  const wallet = getWallet(req.params.id);
  wallet.balance += amount;
  wallet.lifetimeEarnings += amount;
  
  res.json({
    success: true,
    message: `Added ${amount} credits from ${source}`,
    agentId: req.params.id,
    agentName: agentNames[req.params.id] || req.params.id,
    wallet: {
      balance: wallet.balance,
      lifetimeEarnings: wallet.lifetimeEarnings,
    },
  });
});

// POST /api/economy/transfer - Transfer credits between agents
router.post('/transfer', (req: Request, res: Response) => {
  const { fromAgentId, toAgentId, amount } = req.body;
  
  if (!fromAgentId || !toAgentId || !amount) {
    return res.status(400).json({ error: 'fromAgentId, toAgentId, and amount are required' });
  }
  
  const fromWallet = wallets.get(fromAgentId);
  const toWallet = getWallet(toAgentId);
  
  if (!fromWallet || fromWallet.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds or source agent not found' });
  }
  
  // Transfer
  fromWallet.balance -= amount;
  toWallet.balance += amount;
  
  res.json({
    success: true,
    message: `Transferred ${amount} credits from ${agentNames[fromAgentId] || fromAgentId} to ${agentNames[toAgentId] || toAgentId}`,
    transfer: {
      amount,
      from: agentNames[fromAgentId] || fromAgentId,
      to: agentNames[toAgentId] || toAgentId,
    },
  });
});

// POST /api/economy/claim-bounty/:bountyId - Claim bounty reward for agent
router.post('/claim-bounty/:bountyId', (req: Request, res: Response) => {
  const { agentId, rewardCredits } = req.body;
  const { bountyId } = req.params;
  
  if (!agentId || !rewardCredits) {
    return res.status(400).json({ error: 'agentId and rewardCredits are required' });
  }
  
  const wallet = getWallet(agentId);
  wallet.balance += rewardCredits;
  wallet.lifetimeEarnings += rewardCredits;
  
  res.json({
    success: true,
    message: `Agent ${agentNames[agentId] || agentId} claimed bounty ${bountyId} for ${rewardCredits} credits!`,
    agentId,
    agentName: agentNames[agentId] || agentId,
    reward: {
      bountyId,
      amount: rewardCredits,
      newBalance: wallet.balance,
    },
  });
});

export default router;
