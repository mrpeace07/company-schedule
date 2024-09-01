// script.js

let today = new Date();
let currentMonth = today.getMonth(); // Initialize with the current month
let currentYear = today.getFullYear();
let currentDay = today.getDate(); // Get the current day

// Update the current date display
function updateCurrentDate() {
    const options = { month: 'long', year: 'numeric' };
    document.getElementById('current-date').textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', options);
}

// Create clickable date items for the current month
function createDateItems() {
    const datesContainer = document.getElementById('dates-container');
    datesContainer.innerHTML = ''; // Clear existing dates

    // Calculate the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dateItem = document.createElement('div');
        dateItem.textContent = i;
        dateItem.className = 'date-item';
        dateItem.dataset.date = i;
        dateItem.addEventListener('click', showEventModal);

        // Check if this is the current date
        if (i === currentDay && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dateItem.classList.add('current-date'); // Add special class for the current date
        }

        datesContainer.appendChild(dateItem);

        // Load any existing event for this date
        const eventKey = `event-${i}-${currentMonth}-${currentYear}`;
        chrome.storage.local.get([eventKey], function (result) {
            if (result[eventKey]) {
                dateItem.textContent = `${i} - ${result[eventKey]}`;
                dateItem.classList.add('event');
            }
        });
    }
}

// Show the event modal for a selected date
function showEventModal(event) {
    const selectedDate = event.target.dataset.date;
    document.getElementById('modal-date').textContent = `Date: ${selectedDate} ${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    document.getElementById('event-input').value = '';
    document.getElementById('event-input').dataset.date = selectedDate; // Store date in input field
    document.getElementById('event-modal').style.display = 'flex';

    // Load any existing event for this date
    const eventKey = `event-${selectedDate}-${currentMonth}-${currentYear}`;
    chrome.storage.local.get([eventKey], function (result) {
        if (result[eventKey]) {
            document.getElementById('event-input').value = result[eventKey];
        }
    });
}

// Close the event modal
function closeModal() {
    document.getElementById('event-modal').style.display = 'none';
}

// Save an event for a specific date
function saveEvent() {
    const date = document.getElementById('event-input').dataset.date;
    const eventDetails = document.getElementById('event-input').value;
    const eventKey = `event-${date}-${currentMonth}-${currentYear}`;

    chrome.storage.local.set({ [eventKey]: eventDetails }, function () {
        // Update the date item with the new event details
        const dateItem = document.querySelector(`.date-item[data-date='${date}']`);
        if (dateItem) {
            dateItem.textContent = `${date} - ${eventDetails}`;
            dateItem.classList.add('event');
        }
        closeModal();
    });
}

// Delete an event for a specific date
function deleteEvent() {
    const date = document.getElementById('event-input').dataset.date;
    const eventKey = `event-${date}-${currentMonth}-${currentYear}`;

    chrome.storage.local.remove([eventKey], function () {
        // Clear the date item content
        const dateItem = document.querySelector(`.date-item[data-date='${date}']`);
        if (dateItem) {
            dateItem.textContent = date;
            dateItem.classList.remove('event');
        }
        document.getElementById('event-input').value = '';
        closeModal();
    });
}

// Navigate to the next month
function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) { // Wrap around to January of the next year
        currentMonth = 0;
        currentYear++;
    }
    updateCurrentDate();
    createDateItems();
}

// Navigate to the previous month
function goToPreviousMonth() {
    currentMonth--;
    if (currentMonth < 0) { // Wrap around to December of the previous year
        currentMonth = 11;
        currentYear--;
    }
    updateCurrentDate();
    createDateItems();
}

// Event listeners
document.querySelector('.close-button').addEventListener('click', closeModal);
document.getElementById('save-event').addEventListener('click', saveEvent);
document.getElementById('delete-event').addEventListener('click', deleteEvent);
document.getElementById('next-button').addEventListener('click', goToNextMonth);
document.getElementById('prev-button').addEventListener('click', goToPreviousMonth);

// Initialize the calendar
updateCurrentDate();
createDateItems();
