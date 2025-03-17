const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Make sure your app.listen uses this port variable (should already be there)
// app.listen(port, () => {
//     console.log(`Partybank demo app listening on port ${port}`);
//   });

// Simulate database connection
const tickets = {
  'concert-123': { name: 'Taylor Swift Concert', available: 1000, price: 150 },
  'festival-456': { name: 'Summer Music Festival', available: 5000, price: 85 },
  'comedy-789': { name: 'Comedy Night', available: 300, price: 45 }
};

// Add artificial delay to simulate processing time
const simulateProcessingDelay = (req, res, next) => {
  // More complex processing for purchase endpoints
  if (req.path.includes('/api/purchase')) {
    const delay = Math.random() * 200 + 100; // 100-300ms delay
    setTimeout(next, delay);
  } else {
    next();
  }
};

app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());
app.use(simulateProcessingDelay);

// Events listing endpoint
app.get('/api/events', (req, res) => {
  const eventList = Object.keys(tickets).map(id => ({
    id,
    name: tickets[id].name,
    price: tickets[id].price,
    available: tickets[id].available > 0
  }));
  
  res.json({ events: eventList });
});

// Event details endpoint
app.get('/api/events/:id', (req, res) => {
  const event = tickets[req.params.id];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json({
    id: req.params.id,
    name: event.name,
    price: event.price,
    available: event.available
  });
});

// Purchase ticket endpoint (will create load)
app.post('/api/purchase', (req, res) => {
  const { eventId, quantity } = req.body;
  
  if (!eventId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  
  const event = tickets[eventId];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (event.available < quantity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }
  
  // Simulate more intensive processing
  let total = 0;
  for (let i = 0; i < 5000000; i++) {
    total += Math.random();
  }
  
  // Update ticket count
  event.available -= quantity;
  
  // Return purchase confirmation
  res.json({
    success: true,
    order: {
      eventId,
      eventName: event.name,
      quantity,
      totalPrice: event.price * quantity,
      timestamp: new Date().toISOString()
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Serve static files
app.use(express.static('public'));

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});
// Start server
app.listen(port, () => {
  console.log(`Partybank demo app listening on port ${port}`);
});