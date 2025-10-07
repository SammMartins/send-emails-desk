import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import ticketsRouter from './routes/tickets';
import contactsRouter from './routes/contacts';
import dashboardRouter from './routes/dashboard';
import gmailRouter from './routes/gmail';
import aiRouter from './routes/ai';
import slaRouter from './routes/sla';

let server: any = null;

export async function startBackendServer() {
  const app = express();
  const PORT = 3001;

  app.use(cors());
  app.use(express.json());

  // Initialize database
  initDatabase();

  // Routes
  app.use('/api/tickets', ticketsRouter);
  app.use('/api/contacts', contactsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/gmail', gmailRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/sla', slaRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

export function stopBackendServer() {
  if (server) {
    server.close();
  }
}
