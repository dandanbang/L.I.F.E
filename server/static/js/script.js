let birthday;
let journalWeeks = []; // Will store weeks that have journal entries
let combinedGlowData = [];
let showingLifeProgress = true;

function fetchCalendarData() {
    fetch('http://127.0.0.1:5000/calendar')
    .then(response => response.json())
    .then(data => {
        generateCalendar(data); // Call renderCalendar with the fetched data
        generateMonthlyCalendar();
        generateYearlyCalendar();
    })
    .catch(error => console.error('Error fetching calendar data:', error))
    .then(() => { // Add a function declaration here
        highlightInspiration();
        fetchMilestonesData();
    });
}

function fetchMilestonesData() {
    fetch('http://127.0.0.1:5000/milestones')
        .then(response => response.json())
        .then(milestoneData => {
            combineMilestoneData(milestoneData);
            applyGlowEffectToWeeks(combinedGlowData);
        })
        .catch(error => console.error('Error fetching milestones data:', error))
        .then(() => { // Add a function declaration here
            fetchJournalWeeks(); // Call this function to fetch and store weeks with journal entries
        });
}

function fetchJournalWeeks() {
    fetch('/api/journal/weeks')
        .then(response => response.json())
        .then(journalWeeks => {
            if (!Array.isArray(journalWeeks)) {
                throw new Error('Expected an array of journal weeks');
            }
            combineJournalData(journalWeeks); // Append the array returned from combineJournalData to combinedGlowData            
            applyGlowEffectToWeeks(combinedGlowData);
        })
        .catch(error => console.error('Error fetching journal weeks:', error));
}

function combineMilestoneData(milestoneData) {
    const combinedData = [];

    // Process milestone data
    milestoneData.forEach(milestone => {
        const weekIndex = calculateWeekIndexFromMilestone(milestone);
        combinedGlowData[weekIndex] = combinedGlowData[weekIndex] || {};
        combinedGlowData[weekIndex] = combinedGlowData[weekIndex];
        combinedGlowData[weekIndex].milestone = true;
        combinedGlowData[weekIndex].inspirationFigure = milestone[1];
        combinedGlowData[weekIndex].age = milestone[2];
        combinedGlowData[weekIndex].week = milestone[3];
        combinedGlowData[weekIndex].event = milestone[4];
    });
    // return combinedData;
}

function combineJournalData(journalWeeks) {
    const combinedData = [];

    // Process journal weeks data
    journalWeeks.forEach(date => {
        const weekIndex = calculateWeekIndexFromDate(date);
        combinedGlowData[weekIndex] = combinedGlowData[date] || {};
        combinedGlowData[weekIndex].journal = true;
        combinedGlowData[weekIndex].date = weekIndex;
    });
}

function calculateWeekIndexFromMilestone(milestone) {
    // Assuming milestone data is structured as [milestoneId, description, age, weekOfYear, additionalInfo]
    const age = milestone[2];
    const weekOfYear = milestone[3];

    // Assuming each year has exactly 52 weeks
    // Calculate the index based on the age and week of the year
    return age * 52 + weekOfYear - 1; // -1 for zero-based index
}

/**
 * Calculate the week index within the calendar based on the person's birth year and a specific date.
 * This function assumes that the calendar is structured by age and week of the year,
 * with each year having exactly 52 weeks.
 * @param {Date} birthday - The person's birthday.
 * @param {Date} date - The date from which to calculate the week index.
 * @returns {number} The index of the week in the calendar.
 */
function calculateWeekIndexFromDate(date) {
    // Ensure date is a Date object
    if (typeof date === 'string') {
        date = new Date(date);
    }

    // Calculate the full years since January 1st of the birth year
    const fullYears = date.getFullYear() - birthday.getFullYear();

    // Get the week number for the given date
    const weekOfYear = getWeekNumber(date);
    // Calculate the index based on the full years and week of the year
    return fullYears * 52 + weekOfYear - 1; // -1 for zero-based index
}


// renderCalendar function
function renderCalendar() {
    if (!birthday) return;

    // Hide the initial container
    document.getElementById('initial-container').style.display = 'none';
    document.getElementById('lifeProgressBarContainer').style.visibility = 'visible';
    document.getElementById('lifeProgressTitle').style.display = 'block';

    generateLegends();
    fetchCalendarData()    
    // After generating the calendar, make sure it's visible
    // document.getElementById('calendar').style.display = 'grid'; 
    // Assuming the calendar is using a grid layout
}

// Helper functions
function validateAndSetupBirthday() {
    const birthdayValue = document.getElementById('birthdayInput').value;

    if (!birthdayValue) {
        // Show some error to the user or handle the lack of input
        return false;
    }

    // Send the birthday to the server to store it
    fetch('/set_birthday', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `birthday=${encodeURIComponent(birthdayValue)}`,
        // You can add credentials: 'include' if your API requires session cookies to be sent
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(result => {
        console.log('successresult from set_birthday', result); // Success message from server
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

    birthday = new Date(birthdayValue); // This should probably be moved to fetchCalendarData or called after the fetch promise resolves
    renderCalendar();
    return true;
}

function generateLegends() {
    const legendX = document.getElementById('legendX');
    const legendY = document.getElementById('legendY');

    // Generate X legend (Weeks)
    for (let i = 1; i <= 52; i++) {
        const weekLabel = document.createElement('div');
        weekLabel.classList.add('legend-cell');
        weekLabel.classList.add('weekLabel');
        weekLabel.innerText = i;
        legendX.appendChild(weekLabel);
    }

    // Generate Y legend (Age)
    for (let i = 0; i < 91; i++) {
        const yearLabel = document.createElement('div');
        yearLabel.classList.add('legend-cell');
        yearLabel.innerText = i;
        legendY.appendChild(yearLabel);

    }
}

function generateCalendar(calendarData) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Clear existing calendar data

    // const birthday = new Date(document.getElementById('birthdayInput').value);
    const startYear = birthday.getFullYear();
    const endYear = startYear + 90; // Assuming lifespan of 90 years
    const today = new Date();
    const birthWeekNumber = getWeekNumber(birthday);

    const filteredData = filterCalendarData(calendarData, startYear, endYear);

    filteredData.forEach(weekData => {
        const week = createWeekElement(weekData);
        classifyWeek(week, weekData, birthday, today, birthWeekNumber);
        appendWeekToCalendar(calendar, week);
    });

    updateLifeProgress(birthday);
}

function filterCalendarData(calendarData, startYear, endYear) {
    return calendarData.filter(weekData => {
        const year = new Date(weekData.start_date).getFullYear();
        return year >= startYear && year <= endYear;
    });
}

function createWeekElement(weekData) {
    const week = document.createElement('div');
    week.classList.add('week');
    week.classList.add(weekData.year);
    week.setAttribute('start-date', weekData.start_date);
    week.setAttribute('days-in-week', weekData.days);
    week.setAttribute('data-index', weekData.week);
    return week;
}

function classifyWeek(week, weekData, birthday, today, birthWeekNumber) {
    const startDate = new Date(weekData.start_date);
    const endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + 6); // End of the week

    // Classify if the week is before birth
    if (startDate < birthday && startDate.getFullYear() === birthday.getFullYear()) {
        week.classList.add('unborn');
    }

    // Classify if the week is in the past
    if (startDate < today && today > endDate) {
        week.classList.add('passed');
    }

    // Classify if the week is in the future
    if (startDate > today) {
        week.classList.add('future-week');
    }

    // Classify if the week is the birth week
    if (parseInt(week.getAttribute('data-index')) === birthWeekNumber && startDate.getFullYear() === birthday.getFullYear()) {
        week.classList.add('birth-week');
        week.innerHTML += ' &#x1F476;'; // Unicode for baby emoji
    }

    // Highlight the current week
    if (today >= startDate && today <= endDate) {
        week.classList.add('current-week');
    }
}
function appendWeekToCalendar(calendar, week) {
    calendar.appendChild(week);
}


function generateMonthlyCalendar(calendarData) {
    const calendar = document.getElementById('calendar-monthly');
    calendar.innerHTML = ''; // Clear existing calendar data

    // Assuming a lifespan of 90 years, each month's data
    const monthsPerYear = 12;
    const lifespan = 90;

    // Create 12 x 90 grid for monthly view
    for (let year = 0; year < lifespan; year++) {
        for (let month = 0; month < monthsPerYear; month++) {
            const monthElement = createMonthElement(year, month);
            classifyMonth(monthElement, year, month);
            calendar.appendChild(monthElement);
        }
    }
    console.log('before generateMonthlyLegend');
    // generateMonthlyLegend();
}

function createMonthElement(year, month) {
    const monthElement = document.createElement('div');
    monthElement.classList.add('month');
    monthElement.classList.add('year-' + year);
    monthElement.setAttribute('data-year', year);
    monthElement.setAttribute('data-month', month + 1); // +1 because months are 1-indexed
    return monthElement;
}

function classifyMonth(monthElement, year, month) {
    // Add classification logic similar to classifyWeek function
    // You can add classes based on the month being in the past, present, or future
}

function generateMonthlyLegend() {
    const legendX = document.getElementById('legendX');

    // Create monthly legend (1-12)
    for (let i = 1; i <= 12; i++) {
        const monthLabel = document.createElement('div');
        monthLabel.classList.add('legend-cell');
        monthLabel.innerText = i; // Or month names if preferred
        monthLabel.classList.add('calendar-view')
        monthLabel.classList.add('monthLabel')
        monthLabel.style.visibility = 'hidden';
        legendX.appendChild(monthLabel);
        console.log('appended month label');
    }
}

function generateYearlyCalendar(calendarData) {
    const calendar = document.getElementById('calendar-yearly');
    calendar.innerHTML = ''; // Clear existing calendar data

    // Assuming a lifespan of 90 years, each month's data
    const year = 1;
    const lifespan = 90;

    // Create 12 x 90 grid for monthly view
    for (let year = 0; year < lifespan; year++) {
        const yearElement = createYearElement(year);
        calendar.appendChild(yearElement);
    }
}

function createYearElement(year) {
    const yearElement = document.createElement('div');
    yearElement.classList.add('year');
    yearElement.classList.add('year-' + year);
    yearElement.setAttribute('data-year', year);
    return yearElement;
}

// Function to toggle calendar views
function toggleCalendarView(view) {
    const views = document.querySelectorAll('.calendar-view');
    views.forEach(v => v.classList.remove('active')); // Hide all views
    document.getElementById(`calendar${view}`).classList.add('active'); // Show the selected view
}

function highlightInspiration() {
    // const birthday = new Date(document.getElementById('birthdayInput').value);
    const weeks = document.querySelectorAll('#calendar .week');

    weeks.forEach(week => {
        const weekYear = parseInt(week.classList[1]); // Assuming the year is stored in the class
        const weekIndex = parseInt(week.getAttribute('data-index'));

        // Logic for celebratory weeks (like birthdays)
        let birthdayThisYear = new Date(birthday);
        birthdayThisYear.setFullYear(weekYear);
        const birthdayWeek = getWeekNumber(birthdayThisYear);

        if (weekIndex === birthdayWeek) {
            week.classList.add('celebratory-week');
        }

        // Logic for Christmas weeks
        const christmasDate = new Date(weekYear, 11, 25); // December 25 of the weekYear
        const christmasWeek = getWeekNumber(christmasDate) - 1; // -1 for zero-based index

        if (weekIndex === christmasWeek) {
            week.classList.add('christmas-week');
        }
    });
}

// Helper function to get the week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Function to calculate age based on birthday and a given date
function calculateAge(birthday, date) {
    let age = date.getFullYear() - birthday.getFullYear();
    let m = date.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && date.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
}

// Function to apply glow effects
function applyGlowEffectToWeeks(combinedGlowData) {
    const weeks = document.querySelectorAll('#calendar .week');

    weeks.forEach((week, index) => {
        let hasPersonalUpdate = !!combinedGlowData[index]?.journal;
        let hasInspirationMilestone = !!combinedGlowData[index]?.milestone;

        // Apply the appropriate glow effect
        week.classList.remove('personal-glow', 'inspiration-glow');
        if (hasPersonalUpdate) {
            week.classList.add('personal-glow');
        }
        if (hasInspirationMilestone) {
            week.classList.add('inspiration-glow');
            week.setAttribute('milestone', combinedGlowData[index].inspirationFigure + ', ' + combinedGlowData[index].event);
        }
    });
}

function weekHasJournalEntries(weekIndex) {
    return journalWeeks.includes(weekIndex);
}

// start loading after initial html is loaded, event listener setup
document.addEventListener('DOMContentLoaded', function() {
    const dayColumn = document.querySelectorAll('.day-column');
    setupEventListeners();
    document.getElementById("visualizeButton").addEventListener("click", validateAndSetupBirthday);
    getBirthday();
    const lifespan = 90; // Replace with expected lifespan
    calculateLifeProgress(lifespan);

      // Check if the element exists
    if (document.getElementById("successAlert")) {
        setTimeout(function() {
        document.getElementById("successAlert").style.display = 'none';
    }, 3000); // 3000 milliseconds = 3 seconds
  }
});

function getBirthday() {
    fetch('/get_birthday')
        .then(response => response.json())
        .then(data => {
            if (data.birthday) {
                birthday = new Date(data.birthday);
                renderCalendar();
            } else {
                // Ask the user for their birthday
                validateAndSetupBirthday();
            }
        });
}

function setupEventListeners() {
    const calendar = document.getElementById('calendar');
    const modal = document.getElementById('weekModal');
    const modalText = document.getElementById('modalText');
    const saveButton = document.getElementById('saveJournal');
    let currentWeekIndex;
    setupCalendarMouseEvents(calendar);
    setupModalCloseEvent();
        
    // Click event for weeks
    calendar.addEventListener('click', function(event) {
        // Handle future weeks separately
        if (event.target.classList.contains('future-week')) {
            // Add 'animate-lock' class to the clicked future-week element
            event.target.classList.add('animate-lock');

            // Remove 'animate-lock' class after 3 seconds
            setTimeout(() => event.target.classList.remove('animate-lock'), 3000);
            return; // Exit the function early for future weeks
        }

        if (!event.target.classList.contains('week')) {
            return;
        }

        // Existing logic for handling clicks on weeks
        const weeks = document.querySelectorAll('#calendar .week');
        currentWeekIndex = Array.from(calendar.children).indexOf(event.target);
        console.log('Clicked on Week: ', currentWeekIndex);

        // shows the age and week of the modal
        const clickedDate = new Date(event.target.getAttribute('start-date'));
        const age = calculateAge(birthday, clickedDate);  // Use the new function to calculate age    
        const weekNumber = event.target.getAttribute('data-index');
        modalText.textContent = `Journal Entries for Age ${age}, Week ${weekNumber}`;
    
        // Create the day columns for the week
        const weekView = document.getElementById('weekView');
        
        //clean the element for 7 day journal
        clearElement(weekView);
        const week = weeks[currentWeekIndex];

        const daysInWeek = week.getAttribute('days-in-week');
        console.log('days in week', daysInWeek)
        const dates = daysInWeek.split(',');
    
        dates.forEach((date, dayIndex) => {        
            weekView.appendChild(createDayColumn(date, dayIndex, currentWeekIndex));
        });

        loadJournalEntries();
    
        modal.style.display = "block";
    });
    
    saveButton.addEventListener('click', function() {
        let hasEntry = false; // Flag to check if any day has an entry
        const weeks = document.querySelectorAll('#calendar .week');

        for (let i = 0; i < 7; i++) {
            const dayJournalEntry = document.getElementById(`journalDay${i + 1}`);
            const entryContent = dayJournalEntry.value.trim();
            const daysInWeek = weeks[currentWeekIndex].getAttribute('days-in-week');
            const entryDate = document.getElementsByClassName('day-column').item(i).getAttribute('date');
            // Save the journal entry for each day on the server
            if (entryContent) {
                fetch('/api/journal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ date: entryDate, content: entryContent })
                })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error:', error));
            }

            // Check if the day has an entry
            if (entryContent !== "") {
                hasEntry = true;
            }

            // Retrieve and save the selected rating for each day
            const ratingRadio = document.querySelector(`input[name="rating${currentWeekIndex}_day${i + 1}"]:checked`);
            let selectedRating = "";

            if (ratingRadio) {
                selectedRating = ratingRadio.value;

                // Save the journal entry and emoji for each day on the server
                fetch('/api/journal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        date: entryDate, 
                        content: entryContent,
                        emoji: selectedRating  // Include the emoji in the request
                    })
                })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error:', error));
            }
        }

        if (hasEntry) {
            const weekElement = weeks[currentWeekIndex];
            if (weekElement) {
                weekElement.classList.add('personal-glow');
            }
        }

        applyGlowEffectToWeeks(combinedGlowData);

        modal.style.display = "none";
    });

    // Event listener for keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            // Logic to switch to the previous calendar view
            toggleCalendarView('-monthly');
            // legendX.innerHTML = ''; // Clear existing legend data
            // document.querySelectorAll('.weekLabel').forEach(week => { week.style.visibility = 'hidden' });
            document.querySelectorAll('.monthLabel').forEach(month => { month.style.visibility = 'visible' });
            console.log('Left arrow pressed')
        } else if (event.key === 'ArrowRight') {
            // Logic to switch to the next calendar view
            toggleCalendarView('');
            console.log('right arrow pressed')
        } else if (event.key === 'ArrowUp') {
            // Logic to switch to the next calendar view
            toggleCalendarView('-yearly');
            console.log('up arrow pressed')
        }

    });
}

function loadJournalEntries() {
    fetch('/api/journal')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(entries => {
            const entryMap = createEntryMap(entries);

            // Iterate over each entry in the map
            for (const [date, content] of Object.entries(entryMap)) {
                // Find the day column with the matching date
                const dayColumnWithEntry = document.querySelector(`.day-column[date="${date}"]`);
                
                // If a matching day column is found, update the journal entry
                if (dayColumnWithEntry) {
                    const journalEntry = dayColumnWithEntry.querySelector('.journal-entry');
                    if (journalEntry) {
                        journalEntry.value = content[0];
                    }
                    const dayRating = dayColumnWithEntry.querySelector('.day-rating');
                    const emojiLabel = dayColumnWithEntry.querySelectorAll('.emoji-label');
                    console.log(dayRating);
                    console.log(emojiLabel);
                    if (dayRating) {
                        dayRating.value = content[1];
                        console.log(dayRating.value);
                        emojiLabel[dayRating.value - 1].classList.add('currently-selected-emoji');
                        emojiLabel[dayRating.value - 1].style.opacity = '1';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error loading journal entries:', error);
        });
}

function createEntryMap(entries) {
    const map = {};
    entries.forEach(entry => {
        map[entry.date] = [entry.content, entry.emoji];
    });
    return map;
}

// Function to create a day column with journal entry and emoji ratings
function createDayColumn(date, dayIndex, currentWeekIndex) {
    const dayColumn = createDayColumnContainer();
    const dayDate = new Date(date);
    dayColumn.setAttribute('date', date);

    createDayLabel(dayColumn, dayDate, dayIndex);
    createJournalEntry(dayColumn, dayIndex, currentWeekIndex);
    createEmojiRatings(dayColumn, dayIndex, currentWeekIndex);

    return dayColumn;
}

function createDayColumnContainer() {
    const dayColumn = document.createElement('div');
    dayColumn.classList.add('day-column');
    return dayColumn;
}

function createDayLabel(dayColumn, dayDate, dayIndex) {
    const dayDateString = dayDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const dayLabel = document.createElement('div');
    dayLabel.classList.add('day-label');
    dayLabel.setAttribute('date', dayDateString);
    dayLabel.textContent = `Day ${dayIndex + 1} - ${dayDateString}`;
    dayColumn.appendChild(dayLabel);
}

function createJournalEntry(dayColumn, dayIndex, currentWeekIndex) {
    const dayJournalEntry = document.createElement('textarea');
    dayJournalEntry.id = `journalDay${dayIndex + 1}`;
    dayJournalEntry.rows = 3;
    dayJournalEntry.classList.add('journal-entry');
    dayJournalEntry.placeholder = "Write your journal entry for this day...";
    dayColumn.appendChild(dayJournalEntry);
}

function createEmojiRatings(dayColumn, dayIndex, currentWeekIndex) {
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('day-rating');
    dayColumn.appendChild(ratingContainer);

    const emojis = ['\uD83D\uDE14', '\uD83D\uDE15', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE04'];

    emojis.forEach((emoji, emojiIndex) => {
        const emojiId = `rating${currentWeekIndex}_day${dayIndex + 1}_${emojiIndex + 1}`;
        const ratingInput = document.createElement('input');
        ratingInput.type = 'radio';
        ratingInput.id = emojiId;
        ratingInput.name = `rating${currentWeekIndex}_day${dayIndex + 1}`;
        ratingInput.value = emojiIndex + 1;
        ratingInput.style.display = 'none';

        const emojiLabel = document.createElement('label');
        emojiLabel.setAttribute('for', emojiId);
        emojiLabel.classList.add('emoji-label');
        emojiLabel.innerHTML = emoji;
        ratingContainer.appendChild(ratingInput);
        ratingContainer.appendChild(emojiLabel);

        emojiLabel.addEventListener('click', function () {
            ratingInput.checked = true;
            updateEmojiOpacity(ratingContainer, emoji);
        });
    });
}    

    // Function to update emoji opacity
function updateEmojiOpacity(container, selectedEmoji) {
    container.querySelectorAll('.emoji-label').forEach(label => {
        label.classList.remove('currently-selected-emoji'); // Remove the class from all emojis
        label.style.opacity = '0.5'; // Reset opacity to unselected state

        if (label.innerHTML === selectedEmoji) {
            label.classList.add('currently-selected-emoji'); // Add the class to the selected emoji
            label.style.opacity = '1'; // Set opacity to selected state
        }
    });
}

function setupCalendarMouseEvents(calendar) {
    const popup = document.getElementById('popup');
    calendar.addEventListener('mouseover', event => displayWeekPopup(event, popup));
    calendar.addEventListener('mouseout', event => hideWeekPopup(event, popup));
}

function displayWeekPopup(event, popup) {
    if (!event.target.classList.contains('week')) return;
    // Existing logic for displaying the popup...
    const clickedDate = new Date(event.target.getAttribute('start-date'));
    const age = calculateAge(birthday, clickedDate);
    const week = event.target.getAttribute('data-index'); // Adding 1 since week count starts from 1

    // Update the popup content
    popup.innerHTML = `Age ${age}, Week ${week}, the highlight of this week is...`;
    // Position the popup
    const rect = event.target.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + window.scrollY}px`;
    popup.style.display = 'block';

    const milestoneContent = event.target.getAttribute('milestone');
    // Existing logic to update the popup content
    if (milestoneContent) {
        popup.innerHTML += `<br>${milestoneContent}`; // Append milestone content
    }

    const isChristmasWeek = event.target.classList.contains('christmas-week');
    if (isChristmasWeek) {
        popup.innerHTML += ' &#x1F385;'; // Append Santa emoji for Christmas week
    }
}

function hideWeekPopup(event, popup) {
    if (event.target.classList.contains('week')) {
        popup.style.display = 'none';
    }
}

function setupModalCloseEvent() {
    const modal = document.getElementById('weekModal');
    const span = document.getElementsByClassName("close")[0];
    span.onclick = () => modal.style.display = "none";
    window.onclick = event => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

// Helper function to clear element content, otherwise you will have multiple weeks in the modal
/**
 * Clears the content of an HTML element.
 * @param {HTMLElement} element - The element to be cleared.
 */
function clearElement(element) {
    element.innerHTML = '';
    }

// Update glow effect based on journal entries
function updateGlowEffectForWeek(currentWeekIndex) {
    let hasJournalEntryOrRating = false;
    const weeks = document.querySelectorAll('#calendar .week');

    for (let i = 0; i < 7; i++) {
        if (localStorage.getItem(`journal_${currentWeekIndex}_day${i + 1}`) ||
            localStorage.getItem(`rating_${currentWeekIndex}_day${i + 1}`)) {
            hasJournalEntryOrRating = true;
            break;
        }
    }

    const weekElement = weeks[currentWeekIndex];
    
    if (weekElement) {
        if (hasJournalEntryOrRating) {
            weekElement.classList.add('personal-glow');
        } else {
            weekElement.classList.remove('personal-glow');
        }
    }
}

// Assuming you have a function to get the current week number
function getCurrentWeekNumber(birthday) {
    const now = new Date();
    const startOfYear = new Date(now.getUTCFullYear(), 0, 1);
    const currentWeekNumber = getWeekNumber(now);
    const birthWeekNumber = getWeekNumber(birthday);
    const weeksSinceBirth = (now.getUTCFullYear() - birthday.getUTCFullYear()) * 52 + (currentWeekNumber - birthWeekNumber);
    return weeksSinceBirth;
}

function calculateLifeProgress(birthday) {
    const totalWeeks = 52 * 90; // Total weeks in a 90-year lifespan
    const weeksLived = getCurrentWeekNumber(birthday);
    const percentageLived = Math.min((weeksLived / totalWeeks) * 100, 100);

    // Update the progress bar width
    const progressBar = document.getElementById('lifeProgressBar');
    progressBar.style.width = percentageLived + '%';
    lifeProgressTitle.textContent = 'My Life Progress';
    const progressPercentage = document.getElementById('lifeProgressPercentage');
    progressPercentage.textContent = percentageLived.toFixed(2) + '% lived';
    progressPercentage.style.visibility = 'visible';
}

// Call this function with the user's actual birthday to update the progress bar
function updateLifeProgress(birthdayInput) {
    const birthday = new Date(birthdayInput); // Use the input from user
    calculateLifeProgress(birthday);
}

function showCurrentYearProgress() {
    const now = new Date();
    const percentageLivedThisYear = (getWeekNumber(now) / 52) * 100;
    const progressBar = document.getElementById('lifeProgressBar');
    const progressPercentage = document.getElementById('lifeProgressPercentage');

    progressBar.style.width = percentageLivedThisYear + '%';
    lifeProgressTitle.textContent = percentageLivedThisYear.toFixed(2) + '% lived this year';
    progressPercentage.style.visibility = 'hidden';

}

function toggleProgressDisplay() {
    if (showingLifeProgress) {
        // Show current year progress
        showCurrentYearProgress();
    } else {
        // Show life progress
        calculateLifeProgress(birthday);
    }
    // Toggle the state
    showingLifeProgress = !showingLifeProgress;
}
