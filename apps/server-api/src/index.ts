import express from 'express';
import { demoRouter } from './demo-routes';
import { worldRouter } from './routes/world';
import { tasksRouter } from './routes/tasks';
import { bountiesRouter } from './routes/bounties';
import economyRouter from './routes/economy';
import { agentsRouter } from './routes/agents';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/demo', demoRouter);
app.use('/api/world', worldRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/bounties', bountiesRouter);
app.use('/api/economy', economyRouter);
app.use('/api/agents', agentsRouter);
app.use(express.static('public'));

app.listen(PORT, () => console.log(`World of NPCs on ${PORT}`));
export default app;
