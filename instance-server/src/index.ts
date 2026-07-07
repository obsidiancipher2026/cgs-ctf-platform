import express from 'express'
import cors from 'cors'
import Docker from 'dockerode'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

const app = express()
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' })

app.use(cors())
app.use(express.json())

const PORT = parseInt(process.env.INSTANCE_PORT || '3100')
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'localhost'
const INSTANCE_PREFIX = process.env.INSTANCE_PREFIX || 'ctf'
const TTL_DEFAULT = parseInt(process.env.INSTANCE_TTL || '1800') // 30 minutes
const MAX_INSTANCES_PER_USER = parseInt(process.env.MAX_INSTANCES || '3')
const CHALLENGE_SITES_DIR = process.env.CHALLENGE_SITES_DIR || path.join(__dirname, '../../challenge-sites')

interface InstanceRecord {
  id: string
  userId: number
  challengeId: number
  challengeSlug: string
  containerId?: string
  port?: number
  status: 'starting' | 'running' | 'expired' | 'error'
  url?: string
  expiresAt: Date
  createdAt: Date
}

const instances = new Map<string, InstanceRecord>()
const userInstances = new Map<number, Set<string>>()

async function cleanupExpiredInstances() {
  const now = new Date()
  for (const [id, instance] of instances) {
    if (instance.expiresAt <= now && instance.status === 'running') {
      console.log(`[CLEANUP] Destroying expired instance ${id} for user ${instance.userId}`)
      await destroyInstance(id)
    }
  }
}

setInterval(cleanupExpiredInstances, 30_000)

async function destroyInstance(instanceId: string): Promise<boolean> {
  const instance = instances.get(instanceId)
  if (!instance) return false

  if (instance.containerId) {
    try {
      const container = docker.getContainer(instance.containerId)
      await container.stop({ t: 5 })
      await container.remove({ force: true })
      console.log(`[DOCKER] Container ${instance.containerId} destroyed`)
    } catch (err: any) {
      console.error(`[DOCKER] Failed to destroy container: ${err.message}`)
    }
  }

  instance.status = 'expired'
  instances.delete(instanceId)

  const userSet = userInstances.get(instance.userId)
  if (userSet) {
    userSet.delete(instanceId)
    if (userSet.size === 0) userInstances.delete(instance.userId)
  }

  return true
}

async function launchDockerInstance(
  userId: number,
  challengeId: number,
  challengeSlug: string,
  dockerImage: string,
  ttl: number
): Promise<InstanceRecord> {
  const instanceId = uuidv4()
  const port = 10000 + Math.floor(Math.random() * 50000)

  console.log(`[LAUNCH] Creating container for user=${userId} challenge=${challengeSlug} image=${dockerImage}`)

  const container = await docker.createContainer({
    Image: dockerImage,
    ExposedPorts: { '80/tcp': {} },
    HostConfig: {
      PortBindings: { '80/tcp': [{ HostPort: String(port), HostIp: '0.0.0.0' }] },
      AutoRemove: true,
      Memory: 256 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 50000,
    },
    Labels: {
      'cgs.ctf': 'true',
      'cgs.user': String(userId),
      'cgs.challenge': challengeSlug,
      'cgs.instance': instanceId,
    },
  })

  await container.start()
  const info = await container.inspect()

  const instance: InstanceRecord = {
    id: instanceId,
    userId,
    challengeId,
    challengeSlug,
    containerId: info.Id,
    port,
    status: 'running',
    url: `http://${INSTANCE_PREFIX}-${challengeSlug}-${instanceId.slice(0, 8)}.${BASE_DOMAIN}:${port}`,
    expiresAt: new Date(Date.now() + ttl * 1000),
    createdAt: new Date(),
  }

  instances.set(instanceId, instance)
  const userSet = userInstances.get(userId) || new Set()
  userSet.add(instanceId)
  userInstances.set(userId, userSet)

  console.log(`[LAUNCH] Container started: ${info.Id.slice(0, 12)} on port ${port}`)
  return instance
}

function serveChallengeSite(req: express.Request, res: express.Response) {
  const { slug } = req.params
  const siteDir = path.join(CHALLENGE_SITES_DIR, slug)

  if (!fs.existsSync(siteDir)) {
    res.status(404).json({ detail: 'Challenge site not found' })
    return
  }

  const filePath = path.join(siteDir, req.path === '/' ? 'index.html' : req.path)
  if (!fs.existsSync(filePath)) {
    const indexPath = path.join(siteDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).json({ detail: 'File not found' })
    }
    return
  }

  res.sendFile(filePath)
}

app.get('/api/instances/health', (_req, res) => {
  res.json({ status: 'ok', instances: instances.size })
})

app.post('/api/instances/launch', async (req, res) => {
  try {
    const { userId, challengeId, challengeSlug, dockerImage, instanceUrl, ttl } = req.body

    if (!userId || !challengeId || !challengeSlug) {
      res.status(400).json({ detail: 'userId, challengeId, challengeSlug required' })
      return
    }

    const userSet = userInstances.get(userId) || new Set()
    if (userSet.size >= MAX_INSTANCES_PER_USER) {
      res.status(429).json({ detail: `Maximum ${MAX_INSTANCES_PER_USER} instances per user. Destroy an existing instance first.` })
      return
    }

    for (const instId of userSet) {
      const inst = instances.get(instId)
      if (inst && inst.challengeId === challengeId && inst.status === 'running') {
        res.json({ instance: inst })
        return
      }
    }

    if (dockerImage) {
      const instance = await launchDockerInstance(userId, challengeId, challengeSlug, dockerImage, ttl || TTL_DEFAULT)
      res.json({ instance })
      return
    }

    if (instanceUrl) {
      const instanceId = uuidv4()
      const instance: InstanceRecord = {
        id: instanceId,
        userId,
        challengeId,
        challengeSlug,
        status: 'running',
        url: instanceUrl,
        expiresAt: new Date(Date.now() + (ttl || TTL_DEFAULT) * 1000),
        createdAt: new Date(),
      }
      instances.set(instanceId, instance)
      userSet.add(instanceId)
      userInstances.set(userId, userSet)
      res.json({ instance })
      return
    }

    const sitesPath = path.join(CHALLENGE_SITES_DIR, challengeSlug)
    if (fs.existsSync(sitesPath)) {
      const instanceId = uuidv4()
      const instance: InstanceRecord = {
        id: instanceId,
        userId,
        challengeId,
        challengeSlug,
        status: 'running',
        url: `/api/instances/site/${challengeSlug}`,
        expiresAt: new Date(Date.now() + (ttl || TTL_DEFAULT) * 1000),
        createdAt: new Date(),
      }
      instances.set(instanceId, instance)
      userSet.add(instanceId)
      userInstances.set(userId, userSet)
      res.json({ instance })
      return
    }

    res.status(400).json({ detail: 'No dockerImage, instanceUrl, or challenge-site found' })
  } catch (err: any) {
    console.error('[LAUNCH ERROR]', err.message)
    res.status(500).json({ detail: 'Failed to launch instance' })
  }
})

app.get('/api/instances/:instanceId', (req, res) => {
  const instance = instances.get(req.params.instanceId)
  if (!instance) {
    res.status(404).json({ detail: 'Instance not found' })
    return
  }
  if (instance.expiresAt <= new Date()) {
    instance.status = 'expired'
  }
  res.json({ instance })
})

app.post('/api/instances/:instanceId/destroy', async (req, res) => {
  const destroyed = await destroyInstance(req.params.instanceId)
  if (!destroyed) {
    res.status(404).json({ detail: 'Instance not found' })
    return
  }
  res.json({ message: 'Instance destroyed' })
})

app.get('/api/instances/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)
  const userSet = userInstances.get(userId) || new Set()
  const userInsts = Array.from(userSet)
    .map(id => instances.get(id))
    .filter(Boolean)
  res.json({ instances: userInsts })
})

app.get('/api/instances/site/:slug/*', serveChallengeSite)
app.get('/api/instances/site/:slug', serveChallengeSite)

app.listen(PORT, () => {
  console.log(`[CTF Instance Server] Running on port ${PORT}`)
  console.log(`[CTF Instance Server] Docker socket: ${process.env.DOCKER_SOCKET || '/var/run/docker.sock'}`)
  console.log(`[CTF Instance Server] Challenge sites: ${CHALLENGE_SITES_DIR}`)
})
