// API endpoint (change this to your server address)
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const eventsContainer = document.getElementById('events-container');
const eventDetailsSection = document.getElementById('event-details');
const eventNameElement = document.getElementById('event-name');
const eventPriceElement = document.getElementById('event-price');
const availabilityStatusElement = document.getElementById('availability-status');
const quantityInput = document.getElementById('quantity');
const purchaseButton = document.getElementById('purchase-button');
const backButton = document.getElementById('back-button');
const purchaseResultElement = document.getElementById('purchase-result');

// Load testing elements
const startLoadTestButton = document.getElementById('start-load-test');
const stopLoadTestButton = document.getElementById('stop-load-test');
const concurrentUsersInput = document.getElementById('concurrent-users');
const requestIntervalInput = document.getElementById('request-interval');
const requestsCountElement = document.getElementById('requests-count');
const successRateElement = document.getElementById('success-rate');
const avgResponseTimeElement = document.getElementById('avg-response-time');

// State variables
let selectedEventId = null;
let loadTestRunning = false;
let loadTestInterval = null;
let requestsSent = 0;
let requestsSucceeded = 0;
let totalResponseTime = 0;

// Fetch all events
async function fetchEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            displayEvents(data.events);
        } else {
            eventsContainer.innerHTML = '<p>No events found</p>';
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        eventsContainer.innerHTML = '<p class="error">Failed to load events. Please try again later.</p>';
    }
}

// Display events in grid
function displayEvents(events) {
    eventsContainer.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        eventCard.innerHTML = `
            <div class="event-info">
                <h3 class="event-name">${event.name}</h3>
                <p class="event-price">$${event.price}</p>
                <button class="view-button" data-event-id="${event.id}">View Details</button>
            </div>
        `;
        
        eventCard.querySelector('.view-button').addEventListener('click', () => showEventDetails(event.id));
        
        eventsContainer.appendChild(eventCard);
    });
}

// Show event details
async function showEventDetails(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const event = await response.json();
        
        selectedEventId = eventId;
        eventNameElement.textContent = event.name;
        eventPriceElement.textContent = event.price;
        availabilityStatusElement.textContent = event.available > 0 ? 'Yes' : 'Sold Out';
        
        // Update UI
        eventsContainer.parentElement.classList.add('hidden');
        eventDetailsSection.classList.remove('hidden');
        purchaseResultElement.classList.add('hidden');
        
        // Disable purchase button if sold out
        purchaseButton.disabled = event.available <= 0;
    } catch (error) {
        console.error('Error fetching event details:', error);
        alert('Failed to load event details. Please try again later.');
    }
}

// Purchase tickets
async function purchaseTickets() {
    const quantity = parseInt(quantityInput.value);
    
    if (!selectedEventId || quantity < 1) {
        showPurchaseResult('Please select a valid quantity', false);
        return;
    }
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${API_BASE_URL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventId: selectedEventId,
                quantity: quantity
            })
        });
        
        const responseTime = Date.now() - startTime;
        
        const result = await response.json();
        
        if (response.ok) {
            showPurchaseResult(`
                <h3>Purchase Successful!</h3>
                <p>Event: ${result.order.eventName}</p>
                <p>Tickets: ${result.order.quantity}</p>
                <p>Total: $${result.order.totalPrice}</p>
                <p>Order Time: ${new Date(result.order.timestamp).toLocaleString()}</p>
                <p><small>Response time: ${responseTime}ms</small></p>
            `, true);
        } else {
            showPurchaseResult(`Error: ${result.error}`, false);
        }
    } catch (error) {
        console.error('Error purchasing tickets:', error);
        showPurchaseResult('Failed to process purchase. Please try again later.', false);
    }
}

// Show purchase result message
function showPurchaseResult(message, isSuccess) {
    purchaseResultElement.innerHTML = message;
    purchaseResultElement.className = `purchase-result ${isSuccess ? 'success' : 'error'}`;
    purchaseResultElement.classList.remove('hidden');
}

// Load testing functions
function startLoadTest() {
    const concurrentUsers = parseInt(concurrentUsersInput.value);
    const requestInterval = parseInt(requestIntervalInput.value);
    
    if (concurrentUsers < 1 || requestInterval < 10) {
        alert('Please enter valid test parameters');
        return;
    }
    
    loadTestRunning = true;
    requestsSent = 0;
    requestsSucceeded = 0;
    totalResponseTime = 0;
    
    // Update UI
    startLoadTestButton.disabled = true;
    stopLoadTestButton.disabled = false;
    requestsCountElement.textContent = '0';
    successRateElement.textContent = '0%';
    avgResponseTimeElement.textContent = '0 ms';
    
    // Start the test
    loadTestInterval = setInterval(() => {
        for (let i = 0; i < concurrentUsers; i++) {
            simulatePurchase();
        }
    }, requestInterval);
}

function stopLoadTest() {
    loadTestRunning = false;
    clearInterval(loadTestInterval);
    
    // Update UI
    startLoadTestButton.disabled = false;
    stopLoadTestButton.disabled = true;
}

async function simulatePurchase() {
    if (!loadTestRunning) return;
    
    // Increment before the request
    requestsSent++;
    updateMetrics();
    
    // Generate random event ID and quantity
    const eventIds = ['concert-123', 'festival-456', 'comedy-789'];
    const randomEventId = eventIds[Math.floor(Math.random() * eventIds.length)];
    const randomQuantity = Math.floor(Math.random() * 4) + 1; // 1-4 tickets
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${API_BASE_URL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventId: randomEventId,
                quantity: randomQuantity
            })
        });
        
        const responseTime = Date.now() - startTime;
        
        // Only count success and add response time if we got a successful response
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                requestsSucceeded++;
                totalResponseTime += responseTime;
            }
        }
    } catch (error) {
        console.error('Error in simulated purchase:', error);
        // Don't increment success counter on error
    }
    
    // Update metrics after processing
    updateMetrics();
}

function updateMetrics() {
    requestsCountElement.textContent = requestsSent;
    
    const successRate = requestsSent > 0 ? Math.round((requestsSucceeded / requestsSent) * 100) : 0;
    successRateElement.textContent = `${successRate}%`;
    
    const avgResponseTime = requestsSucceeded > 0 ? Math.round(totalResponseTime / requestsSucceeded) : 0;
    avgResponseTimeElement.textContent = `${avgResponseTime} ms`;
}

// Event listeners
backButton.addEventListener('click', () => {
    eventDetailsSection.classList.add('hidden');
    eventsContainer.parentElement.classList.remove('hidden');
});

purchaseButton.addEventListener('click', purchaseTickets);
startLoadTestButton.addEventListener('click', startLoadTest);
stopLoadTestButton.addEventListener('click', stopLoadTest);

// Initialize the application
fetchEvents();