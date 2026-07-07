import express from 'express'
import cors from 'cors'
import { InstanceManager } from './services/instance-manager'
import { sseManager } from './services/sse-manager'
import { createInstanceRoutes } from './routes/instances'
import { createAdminRoutes } from './routes/admin'

const PORT = parseInt(process.env.PORT || '3100')
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''

if (!ADMIN_API_KEY) {
  console.warn('[SERVER] ADMIN_API_KEY not set. Admin endpoints will be accessible without auth.')
}

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

const manager = new InstanceManager()

// Wire up SSE callbacks
manager.onStatus = (instanceId, status, progress) => {
  sseManager.sendToInstance(instanceId, 'status', { instanceId, status, progress })
}

manager.onLog = (instanceId, level, message) => {
  sseManager.sendToInstance(instanceId, 'log', { instanceId, level, message, timestamp: new Date().toISOString() })
}

manager.onEvent = (instanceId, eventType, details) => {
  sseManager.broadcast('instance_event', { instanceId, event: eventType, details, timestamp: new Date().toISOString() })
}

// Mount routes
app.use('/api', createInstanceRoutes(manager))
app.use('/api', createAdminRoutes(manager))

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SERVER] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received, shutting down...')
  await manager.shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[SERVER] SIGINT received, shutting down...')
  await manager.shutdown()
  process.exit(0)
})

async function main(): Promise<void> {
  await manager.init()
  app.listen(PORT, () => {
    console.log(`[SERVER] Instance orchestrator running on http://0.0.0.0:${PORT}`)
    console.log(`[SERVER] API base: http://0.0.0.0:${PORT}/api`)
  })
}

main().catch(err => {
  console.error('[SERVER] Failed to start:', err)
  process.exit(1)
})
