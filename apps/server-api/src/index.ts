import express from 'express';
import agentsRouter from './routes/agents';
import tasksRouter from './routes/tasks';
import bountiesRouter from './routes/bounties';
import playersRouter from './routes/players';
import worldRouter from './routes/world';
import economyRouter from './routes/economy';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/bounties', bountiesRouter);
app.use('/api/players', playersRouter);
app.use('/api/world', worldRouter);
app.use('/api/economy', economyRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
