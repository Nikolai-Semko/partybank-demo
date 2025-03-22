// server.js - Main backend file for Partybank demo application
const express = require('express');
const cors = require('cors');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database for demonstration
let events = [
  { id: 1, name: 'Summer Music Festival', tickets: 1000, price: 50, sold: 0 },
  { id: 2, name: 'Tech Conference 2025', tickets: 500, price: 100, sold: 0 },
  { id: 3, name: 'Food & Wine Expo', tickets: 750, price: 75, sold: 0 }
];

let purchases = [];

// API Routes
// Get server info - useful for demonstrating which instance is responding
app.get('/api/server-info', (req, res) => {
  // Simulate some CPU work to demonstrate load
  const startTime = Date.now();
  while (Date.now() - startTime < 100) {
    // Busy wait to simulate CPU load
    Math.random() * Math.random();
  }
  
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    cpus: os.cpus().length,
    memory: Math.round(os.freemem() / 1024 / 1024),
    totalMemory: Math.round(os.totalmem() / 1024 / 1024),
    uptime: os.uptime()
  });
});

// Get all events
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Get specific event
app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// Purchase ticket
app.post('/api/purchase', (req, res) => {
  // Simulating processing delay for demonstration
  setTimeout(() => {
    const { eventId, quantity, customerName, email } = req.body;
    
    if (!eventId || !quantity || !customerName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.sold + quantity > event.tickets) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    
    // Create purchase record with unique ID
    const purchaseId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const purchase = {
      id: purchaseId,
      eventId,
      eventName: event.name,
      quantity,
      customerName,
      email,
      totalPrice: event.price * quantity,
      timestamp: new Date()
    };
    
    purchases.push(purchase);
    
    // Update event
    event.sold += quantity;
    
    res.status(201).json(purchase);
  }, 200); // 200ms simulated processing time
});

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Create a stress test endpoint that can generate CPU load
app.get('/api/stress-test', (req, res) => {
  const duration = parseInt(req.query.duration) || 5000; // Default 5 seconds
  const intensity = parseInt(req.query.intensity) || 50; // 1-100 scale
  
  const startTime = Date.now();
  
  // Run intensive calculations based on intensity parameter
  while (Date.now() - startTime < duration) {
    // Generate CPU load proportional to intensity
    for (let i = 0; i < intensity * 100000; i++) {
      Math.sqrt(Math.random() * 10000);
    }
    
    // Small break to allow other requests
    if (Date.now() % 100 === 0) {
      break;
    }
  }
  
  res.json({
    message: 'Stress test completed',
    duration: Date.now() - startTime,
    hostname: os.hostname()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Partybank server running on port ${PORT}`);
  console.log(`Server hostname: ${os.hostname()}`);
});