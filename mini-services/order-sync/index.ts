import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()

const io = new Server(httpServer, {
  path: '/',
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Rooms: "admin" for admin dashboard, "order:<orderId>" per order, "kitchen" for live kitchen
io.on('connection', (socket) => {
  console.log(`[order-sync] client connected: ${socket.id}`)

  // Join admin room (admin dashboard receives all order events)
  socket.on('join:admin', () => {
    socket.join('admin')
    console.log(`[order-sync] ${socket.id} joined admin room`)
  })

  // Join a specific order room (customer tracking their order)
  socket.on('join:order', (orderId: string) => {
    if (orderId) {
      socket.join(`order:${orderId}`)
      console.log(`[order-sync] ${socket.id} joined order:${orderId}`)
    }
  })

  // Join kitchen room (live kitchen pipeline)
  socket.on('join:kitchen', () => {
    socket.join('kitchen')
    console.log(`[order-sync] ${socket.id} joined kitchen room`)
  })

  // Admin pushes a status update for an order
  // Payload: { orderId, status, progress }
  socket.on('order:status', (payload: { orderId: string; status: string; progress: number }) => {
    console.log(`[order-sync] order:status ${payload.orderId} → ${payload.status}`)
    // Notify the specific order room
    io.to(`order:${payload.orderId}`).emit('order:updated', payload)
    // Notify all admins
    io.to('admin').emit('order:updated', payload)
    // Notify kitchen
    io.to('kitchen').emit('order:updated', payload)
  })

  // New order placed (notify admins + kitchen)
  socket.on('order:created', (payload: { orderId: string; total: number; items: any[] }) => {
    console.log(`[order-sync] order:created ${payload.orderId}`)
    io.to('admin').emit('order:created', payload)
    io.to('kitchen').emit('order:created', payload)
  })

  socket.on('disconnect', () => {
    console.log(`[order-sync] client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`[order-sync] socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[order-sync] WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('[order-sync] SIGTERM received, shutting down...')
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('[order-sync] SIGINT received, shutting down...')
  httpServer.close(() => process.exit(0))
})
