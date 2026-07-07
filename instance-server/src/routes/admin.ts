import { Router, Request, Response } from 'express'
import { InstanceManager } from '../services/instance-manager'
import { sseManager } from '../services/sse-manager'

export function createAdminRoutes(manager: InstanceManager): Router {
  const router = Router()

  // Admin auth middleware
  function requireAdmin(req: Request, res: Response, next: Function): void {
    const apiKey = req.headers['x-api-key']
    if (apiKey !== process.env.ADMIN_API_KEY) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }
    next()
  }

  router.use(requireAdmin)

  // Dashboard metrics
  router.get('/admin/metrics', (_req: Request, res: Response) => {
    const counts = manager.getInstanceCount()
    const allInstances = manager.getAllInstances()

    res.json({
      ...counts,
      activeUsers: new Set(allInstances.map(i => i.userId)).size,
      sseConnections: sseManager.getClientCount(),
      instances: allInstances.map(i => ({
        id: i.id,
        userId: i.userId,
        challengeId: i.challengeId,
        status: i.status,
        url: i.url,
        expiresAt: i.expiresAt,
        uptime: i.status === 'running'
          ? Math.floor((Date.now() - new Date(i.expiresAt).getTime() + 1000 * 60 * 30) / 1000)
          : 0,
      })),
    })
  })

  // Bulk destroy all instances for a user
  router.post('/admin/users/:userId/instances/destroy', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId)
      const instances = manager.getUserInstances(userId)
      let destroyed = 0
      for (const inst of instances) {
        await manager.destroyInstance(inst.id)
        destroyed++
      }
      res.json({ message: `Destroyed ${destroyed} instances for user ${userId}` })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Destroy all instances
  router.post('/admin/instances/destroy-all', async (_req: Request, res: Response) => {
    try {
      const all = manager.getAllInstances()
      let destroyed = 0
      for (const inst of all) {
        await manager.destroyInstance(inst.id)
        destroyed++
      }
      res.json({ message: `Destroyed all ${destroyed} instances` })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Global SSE broadcast
  router.post('/admin/broadcast', (req: Request, res: Response) => {
    const { event, data } = req.body
    if (!event || !data) {
      res.status(400).json({ error: 'event and data required' })
      return
    }
    sseManager.broadcast(event, data)
    res.json({ message: 'Broadcast sent' })
  })

  return router
}
