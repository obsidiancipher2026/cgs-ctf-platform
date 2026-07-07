import { Response } from 'express'

interface SSEClient {
  id: string
  res: Response
  userId?: number
  instanceId?: string
}

export class SSEManager {
  private clients: Map<string, SSEClient> = new Map()

  addClient(id: string, res: Response, userId?: number, instanceId?: string): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId: id })}\n\n`)

    const client: SSEClient = { id, res, userId, instanceId }
    this.clients.set(id, client)

    res.on('close', () => {
      this.clients.delete(id)
    })
  }

  sendToInstance(instanceId: string, event: string, data: any): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of this.clients.values()) {
      if (client.instanceId === instanceId) {
        try { client.res.write(message) } catch { this.clients.delete(client.id) }
      }
    }
  }

  sendToUser(userId: number, event: string, data: any): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        try { client.res.write(message) } catch { this.clients.delete(client.id) }
      }
    }
  }

  broadcast(event: string, data: any): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of this.clients.values()) {
      try { client.res.write(message) } catch { this.clients.delete(client.id) }
    }
  }

  getClientCount(): number {
    return this.clients.size
  }
}

export const sseManager = new SSEManager()
