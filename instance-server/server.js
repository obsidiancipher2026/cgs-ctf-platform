const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

let Docker;
try { Docker = require('dockerode'); } catch { Docker = null; }

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.INSTANCE_PORT || 3100;
const INSTANCE_TTL = parseInt(process.env.INSTANCE_TTL || '2700', 10);
const MAX_INSTANCES_PER_USER = parseInt(process.env.MAX_INSTANCES || '3', 10);
const CHALLENGE_APPS_DIR = process.env.CHALLENGE_APPS_DIR || path.join(__dirname, '..', 'challenge-apps');
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'localhost';

// In-memory instance store (production would use Redis/DB)
const instances = new Map();
const docker = Docker ? new Docker() : null;

/* ─── Helpers ─── */

function generateFlag(challengeId, userId) {
  const secret = process.env.FLAG_SECRET || 'dev-flag-secret';
  const hmac = crypto.createHmac('sha256', secret).update(`${challengeId}:${userId}`).digest('hex').slice(0, 16);
  return `CGS{${challengeId}_${userId}_${hmac}}`;
}

function hashFlag(flag) {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

/* ─── API Routes ─── */

// Start an instance
app.post('/api/start', async (req, res) => {
  const { challengeId, userId, imageName } = req.body;
  if (!challengeId || !userId) return res.status(400).json({ error: 'challengeId and userId required' });

  // Check user instance limit
  const userInstances = Array.from(instances.values()).filter(i => i.userId === userId && i.status === 'running');
  if (userInstances.length >= MAX_INSTANCES_PER_USER) {
    return res.status(429).json({ error: 'Max concurrent instances reached' });
  }

  // Check if already running this challenge
  const existing = Array.from(instances.values()).find(i => i.userId === userId && i.challengeId === challengeId && i.status === 'running');
  if (existing) return res.json({ instanceId: existing.id, url: existing.url, expiresAt: existing.expiresAt });

  const instanceId = uuidv4().slice(0, 8);
  const flag = generateFlag(challengeId, userId);
  const port = 40000 + Math.floor(Math.random() * 20000);
  const expiresAt = Date.now() + INSTANCE_TTL * 1000;

  let containerId = null;
  let url = null;
  let containerPort = port;

  if (docker) {
    try {
      const appDir = path.join(CHALLENGE_APPS_DIR, imageName || `easy/robots-only`);
      const container = await docker.createContainer({
        Image: `ctf-challenge-${challengeId}:latest`,
        name: `ctf-${challengeId}-${instanceId}`,
        Env: [`FLAG=${flag}`, `PORT=3000`, `INSTANCE_ID=${instanceId}`],
        ExposedPorts: { '3000/tcp': {} },
        HostConfig: {
          PortBindings: { '3000/tcp': [{ HostPort: String(port) }] },
          Memory: 256 * 1024 * 1024,
          MemorySwap: 256 * 1024 * 1024,
          CpuShares: 256,
        },
        NetworkMode: 'ctf-network',
      });
      await container.start();
      containerId = container.id;
      url = `http://localhost:${port}`;
    } catch (err) {
      // Fall back to direct process mode
      console.error('Docker failed, using direct mode:', err.message);
      url = null;
    }
  }

  // Fallback: record the instance info; the Next.js proxy will handle routing
  if (!url) {
    url = `/api/challenge-instances/${challengeId}/${instanceId}`;
    containerPort = null;
  }

  const instance = {
    id: instanceId,
    challengeId,
    userId,
    flag,
    flagHash: hashFlag(flag),
    containerId,
    url,
    port: containerPort,
    status: 'running',
    createdAt: Date.now(),
    expiresAt,
  };
  instances.set(instanceId, instance);

  // Auto-expire
  setTimeout(() => stopInstance(instanceId), INSTANCE_TTL * 1000);

  res.json({ instanceId, url, expiresAt, ttl: INSTANCE_TTL });
});

// Stop an instance
app.post('/api/stop', async (req, res) => {
  const { instanceId, userId } = req.body;
  const instance = instances.get(instanceId);
  if (!instance) return res.status(404).json({ error: 'Instance not found' });
  if (instance.userId !== userId) return res.status(403).json({ error: 'Not your instance' });
  await stopInstance(instanceId);
  res.json({ success: true });
});

async function stopInstance(instanceId) {
  const instance = instances.get(instanceId);
  if (!instance) return;
  if (instance.containerId && docker) {
    try {
      const container = docker.getContainer(instance.containerId);
      await container.stop();
      await container.remove();
    } catch (err) {
      console.error('Error stopping container:', err.message);
    }
  }
  instance.status = 'stopped';
}

// Get instance status
app.get('/api/status/:instanceId', (req, res) => {
  const instance = instances.get(req.params.instanceId);
  if (!instance) return res.status(404).json({ error: 'Instance not found' });
  res.json({
    instanceId: instance.id,
    challengeId: instance.challengeId,
    status: instance.status,
    url: instance.url,
    expiresAt: instance.expiresAt,
    ttl: Math.max(0, Math.floor((instance.expiresAt - Date.now()) / 1000)),
  });
});

// Get user's instances
app.get('/api/instances/:userId', (req, res) => {
  const userInstances = Array.from(instances.values())
    .filter(i => i.userId === req.params.userId && i.status === 'running')
    .map(i => ({ instanceId: i.id, challengeId: i.challengeId, url: i.url, expiresAt: i.expiresAt, status: i.status }));
  res.json(userInstances);
});

// Verify a flag for an instance
app.post('/api/verify', (req, res) => {
  const { instanceId, flag } = req.body;
  const instance = instances.get(instanceId);
  if (!instance) return res.status(404).json({ error: 'Instance not found' });
  const correct = instance.flag === flag;
  res.json({ correct, flagHash: correct ? instance.flagHash : null });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', instances: instances.size, docker: !!docker });
});

app.listen(PORT, () => {
  console.log(`Instance orchestrator running on port ${PORT}`);
  console.log(`Docker available: ${!!docker}`);
  console.log(`Challenge apps dir: ${CHALLENGE_APPS_DIR}`);
});
