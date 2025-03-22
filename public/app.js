// Frontend JavaScript for Partybank demo application

// API base URL - change this to your deployed Azure App Service URL when deployed
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://partybank-demo-nikolai-ehd6a8b7f4eebtcu.eastus2-01.azurewebsites.net/api';

// DOM elements
const eventsContainer = document.getElementById('events-container');
const serverInfoDiv = document.getElementById('server-info');
const refreshServerInfoBtn = document.getElementById('refresh-server-info');
const purchaseModal = document.getElementById('purchase-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const closeModalBtn = document.querySelector('.close-modal');
const closeConfirmationBtn = document.querySelector('.close-confirmation');
const closeConfirmationButton = document.getElementById('close-confirmation');
const purchaseForm = document.getElementById('purchase-form');
const eventIdInput = document.getElementById('event-id');
const eventNameSpan = document.getElementById('modal-event-name');
const quantityInput = document.getElementById('quantity');
const totalPriceSpan = document.getElementById('total-price');
const confirmationDetailsDiv = document.getElementById('confirmation-details');
const runStressTestBtn = document.getElementById('run-stress-test');
const stressResultDiv = document.getElementById('stress-result');

// Current events data
let eventsData = [];
let currentEvent = null;

// Load server info
async function loadServerInfo() {
    try {
        serverInfoDiv.textContent = 'Loading server information...';
        const response = await fetch(`${API_BASE_URL}/server-info`);
        const data = await response.json();
        
        // Format the server info nicely
        const formattedInfo = `Hostname: ${data.hostname}
Platform: ${data.platform}
CPUs: ${data.cpus}
Free Memory: ${data.memory} MB
Total Memory: ${data.totalMemory} MB
Uptime: ${Math.floor(data.uptime / 60)} minutes`;
        
        serverInfoDiv.textContent = formattedInfo;
    } catch (error) {
        serverInfoDiv.textContent = `Error loading server info: ${error.message}`;
    }
}

// Load all events
async function loadEvents() {
    try {
        eventsContainer.innerHTML = '<p>Loading events...</p>';
        const response = await fetch(`${API_BASE_URL}/events`);
        eventsData = await response.json();
        
        displayEvents();
    } catch (error) {
        eventsContainer.innerHTML = `<p>Error loading events: ${error.message}</p>`;
    }
}

// Display events in grid
function displayEvents() {
    if (eventsData.length === 0) {
        eventsContainer.innerHTML = '<p>No events found</p>';
        return;
    }
    
    eventsContainer.innerHTML = eventsData.map(event => `
        <div class="event-card">
            <div class="event-image">Event Image Placeholder</div>
            <div class="event-details">
                <h3 class="event-name">${event.name}</h3>
                <p class="event-price">$${event.price} per ticket</p>
                <p class="event-availability">
                    ${event.tickets - event.sold} tickets available out of ${event.tickets}
                </p>
                <button class="btn-primary buy-tickets" data-event-id="${event.id}">
                    Buy Tickets
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to Buy Tickets buttons
    document.querySelectorAll('.buy-tickets').forEach(button => {
        button.addEventListener('click', handleBuyTicketsClick);
    });
}

// Handle buy tickets button click
function handleBuyTicketsClick(event) {
    const eventId = parseInt(event.target.getAttribute('data-event-id'));
    currentEvent = eventsData.find(e => e.id === eventId);
    
    if (currentEvent) {
        // Set the modal content
        eventIdInput.value = currentEvent.id;
        eventNameSpan.textContent = currentEvent.name;
        quantityInput.value = 1;
        totalPriceSpan.textContent = currentEvent.price;
        
        // Show the modal
        purchaseModal.style.display = 'block';
    }
}

// Update total price when quantity changes
function updateTotalPrice() {
    if (currentEvent) {
        const quantity = parseInt(quantityInput.value);
        totalPriceSpan.textContent = (currentEvent.price * quantity).toFixed(2);
    }
}

// Handle form submission
async function handlePurchaseSubmit(event) {
    event.preventDefault();
    
    const ticketData = {
        eventId: parseInt(eventIdInput.value),
        quantity: parseInt(quantityInput.value),
        customerName: document.getElementById('customer-name').value,
        email: document.getElementById('email').value
    };
    
    try {
        // Disable the submit button
        event.target.querySelector('button[type="submit"]').disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to purchase tickets');
        }
        
        const purchaseData = await response.json();
        
        // Close purchase modal and show confirmation
        purchaseModal.style.display = 'none';
        
        // Display confirmation details
        confirmationDetailsDiv.innerHTML = `
            <p><strong>Event:</strong> ${purchaseData.eventName}</p>
            <p><strong>Tickets:</strong> ${purchaseData.quantity}</p>
            <p><strong>Total Price:</strong> $${purchaseData.totalPrice.toFixed(2)}</p>
            <p><strong>Confirmation ID:</strong> ${purchaseData.id}</p>
            <p><strong>Purchase Time:</strong> ${new Date(purchaseData.timestamp).toLocaleString()}</p>
        `;
        
        confirmationModal.style.display = 'block';
        
        // Reload events to update availability
        loadEvents();
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        // Re-enable the submit button
        event.target.querySelector('button[type="submit"]').disabled = false;
    }
}

// Run stress test
async function runStressTest() {
    const duration = document.getElementById('stress-duration').value;
    const intensity = document.getElementById('stress-intensity').value;
    
    stressResultDiv.textContent = 'Running stress test...';
    runStressTestBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/stress-test?duration=${duration}&intensity=${intensity}`);
        const data = await response.json();
        
        stressResultDiv.textContent = `
Stress test completed
Duration: ${data.duration} ms
Server: ${data.hostname}
        `;
        
        // Refresh server info after stress test
        loadServerInfo();
    } catch (error) {
        stressResultDiv.textContent = `Error running stress test: ${error.message}`;
    } finally {
        runStressTestBtn.disabled = false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadServerInfo();
    loadEvents();
    
    refreshServerInfoBtn.addEventListener('click', loadServerInfo);
    
    // Modal close buttons
    closeModalBtn.addEventListener('click', () => {
        purchaseModal.style.display = 'none';
    });
    
    closeConfirmationBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });
    
    closeConfirmationButton.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });
    
    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === purchaseModal) {
            purchaseModal.style.display = 'none';
        }
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Purchase form
    quantityInput.addEventListener('change', updateTotalPrice);
    purchaseForm.addEventListener('submit', handlePurchaseSubmit);
    
    // Stress test
    runStressTestBtn.addEventListener('click', runStressTest);
});