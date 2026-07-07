import { Router, Request, Response } from 'express'
import { InstanceManager } from '../services/instance-manager'
import { sseManager } from '../services/sse-manager'

export function createInstanceRoutes(manager: InstanceManager): Router {
  const router = Router()

  // Health check
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Launch a new instance
  router.post('/instances', async (req: Request, res: Response) => {
    try {
      const { userId, challengeId, challengeSlug, dockerImage, internalPort, cpuLimit, memoryLimit, envVariables, healthCheckType, healthCheckPath, healthCheckInterval, ttl } = req.body

      if (!userId || !challengeId || !challengeSlug || !dockerImage) {
        res.status(400).json({ error: 'Missing required fields: userId, challengeId, challengeSlug, dockerImage' })
        return
      }

      console.log(`[API] Launch: user=${userId} challenge=${challengeSlug} image=${dockerImage}`)

      const instance = await manager.launchInstance({
        userId,
        challengeId,
        challengeSlug,
        dockerImage,
        internalPort: internalPort || 80,
        cpuLimit: cpuLimit || '0.5',
        memoryLimit: memoryLimit || '128m',
        envVariables: envVariables || {},
        healthCheckType,
        healthCheckPath,
        healthCheckInterval,
        ttl: ttl || 1800,
      })

      res.status(201).json(instance)
    } catch (err: any) {
      console.error(`[API] Launch error: ${err.message}`)
      res.status(500).json({ error: err.message || 'Failed to launch instance' })
    }
  })

  // Get all instances for a user
  router.get('/instances/user/:userId', (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId)
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid userId' })
        return
      }
      const instances = manager.getUserInstances(userId)
      res.json(instances)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Get specific user's challenge instance
  router.get('/instances/user/:userId/challenge/:challengeId', (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId)
      const challengeId = parseInt(req.params.challengeId)
      if (isNaN(userId) || isNaN(challengeId)) {
        res.status(400).json({ error: 'Invalid userId or challengeId' })
        return
      }
      const instance = manager.getUserChallengeInstance(userId, challengeId)
      if (!instance) {
        res.status(404).json({ error: 'Instance not found' })
        return
      }
      res.json(instance)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Get a single instance
  router.get('/instances/:id', (req: Request, res: Response) => {
    try {
      const instance = manager.getInstance(req.params.id)
      if (!instance) {
        res.status(404).json({ error: 'Instance not found' })
        return
      }
      res.json(instance)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Destroy an instance
  router.delete('/instances/:id', async (req: Request, res: Response) => {
    try {
      const success = await manager.destroyInstance(req.params.id)
      if (!success) {
        res.status(404).json({ error: 'Instance not found' })
        return
      }
      res.json({ message: 'Instance destroyed' })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Restart an instance
  router.post('/instances/:id/restart', async (req: Request, res: Response) => {
    try {
      const ttl = req.body.ttl || 1800
      const instance = await manager.restartInstance(req.params.id, ttl)
      res.json(instance)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Extend an instance's lifetime
  router.post('/instances/:id/extend', async (req: Request, res: Response) => {
    try {
      const additionalSeconds = req.body.seconds || 300
      const maxTotalMinutes = req.body.maxMinutes || 120
      const instance = await manager.extendInstance(req.params.id, additionalSeconds, maxTotalMinutes)
      res.json(instance)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Get instance logs
  router.get('/instances/:id/logs', async (req: Request, res: Response) => {
    try {
      const logs = await manager.getInstanceLogs(req.params.id)
      res.json({ logs })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // SSE endpoint for instance events
  router.get('/instances/:id/events', (req: Request, res: Response) => {
    const clientId = `sse-${req.params.id}-${Date.now()}`
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined
    sseManager.addClient(clientId, res, userId, req.params.id)
  })

  // SSE endpoint for user events (all instances)
  router.get('/events/user/:userId', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid userId' })
      return
    }
    const clientId = `sse-user-${userId}-${Date.now()}`
    sseManager.addClient(clientId, res, userId)
  })

  return router
}
