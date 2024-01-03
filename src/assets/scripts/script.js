function fetchCalendarData() {
    fetch('http://127.0.0.1:5000/calendar')
    .then(response => response.json())
    .then(data => {
        generateCalendar(data); // Call renderCalendar with the fetched data
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
        .then(data => {
            applyGlowEffectToWeeks(data);
        })
        .catch(error => console.error('Error fetching milestones data:', error));
}

// renderCalendar function
function renderCalendar() {
    if (!validateAndSetupBirthday()) return;
    generateLegends();
    fetchCalendarData()
}

// Helper functions
function validateAndSetupBirthday() {
    const birthdayValue = document.getElementById('birthdayInput').value;
    if (!birthdayValue) {
        alert('Please enter your birthday.');
        return false;
    }
    birthday = new Date(birthdayValue);
    return true;
}

function generateLegends() {
    const legendX = document.getElementById('legendX');
    const legendY = document.getElementById('legendY');

    // Generate X legend (Weeks)
    for (let i = 1; i <= 52; i++) {
        const weekLabel = document.createElement('div');
        weekLabel.classList.add('legend-cell');
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

    const birthday = new Date(document.getElementById('birthdayInput').value);
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
    if (startDate < birthday && startDate.getFullYear() === birthday.getFullYear()) {
        week.classList.add('unborn');
    }
    if (startDate < today && startDate.getFullYear() <= today.getFullYear()) {
        week.classList.add('passed');
    }
    if (startDate > today) {
        week.classList.add('future-week');
    }
    if (parseInt(week.getAttribute('data-index')) === birthWeekNumber && startDate.getFullYear() === birthday.getFullYear()) {
        week.classList.add('birth-week');
        week.innerHTML += ' &#x1F476;'; // Unicode for baby emoji
    }
}

function appendWeekToCalendar(calendar, week) {
    calendar.appendChild(week);
}


function highlightInspiration() {
    const birthday = new Date(document.getElementById('birthdayInput').value);
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
function applyGlowEffectToWeeks(milestoneData) {
    const weeks = document.querySelectorAll('#calendar .week');

    weeks.forEach((week, index) => {

        let hasPersonalUpdate = false;
        let hasInspirationMilestone = false;

        const startDate = new Date(week.getAttribute('start-date'));
        const age = calculateAge(birthday, startDate);
        const weekOfYear = index % 52 + 1;// Holds the milestone content

        // Check for personal journal entries or ratings
        for (let i = 0; i < 7; i++) {
            if (localStorage.getItem(`journal_${index}_day${i + 1}`) ||
                localStorage.getItem(`rating_${index}_day${i + 1}`)) {
                hasPersonalUpdate = true;
                break;
            }
        }
        // Check for milestones from fetched data
        milestoneData.forEach(milestone => {
            if (milestone[2] === age && milestone[3] === weekOfYear) {
                hasInspirationMilestone = true;
                week.setAttribute('milestone', milestone[1] + ', ' + milestone[4]); // Set the milestone attribute')
            }
        });

        // Apply the appropriate glow effect
        week.classList.remove('personal-glow', 'inspiration-glow');
        if (hasPersonalUpdate) {
            week.classList.add('personal-glow');
        }
        if (hasInspirationMilestone) {
            week.classList.add('inspiration-glow');
        }
    });
}

// Event listener setup
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    renderCalendar();
});

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
    
        modal.style.display = "block";
    });
    
    saveButton.addEventListener('click', function() {
        let hasEntry = false; // Flag to check if any day has an entry
        const weeks = document.querySelectorAll('#calendar .week');

        for (let i = 0; i < 7; i++) {
            const dayJournalEntry = document.getElementById(`journalDay${i + 1}`);
            const entryContent = dayJournalEntry.value.trim();
            // Save the journal entry for each day
            localStorage.setItem(`journal_${currentWeekIndex}_day${i + 1}`, entryContent);

            // Check if the day has an entry
            if (entryContent !== "") {
                hasEntry = true;
            }

            // Retrieve and save the selected rating for each day
            const ratingRadio = document.querySelector(`input[name="rating${currentWeekIndex}_day${i + 1}"]:checked`);
            console.log(ratingRadio);
            if (ratingRadio) {
                const selectedRating = ratingRadio.value;
                localStorage.setItem(`rating_${currentWeekIndex}_day${i + 1}`, selectedRating);
            }
        }

        if (hasEntry) {
            const weekElement = weeks[currentWeekIndex];
            if (weekElement) {
                weekElement.classList.add('personal-glow');
                console.log('adding the personal glow')
            }
        }

        updateGlowEffectForWeek(currentWeekIndex);

        alert('Journal entries and ratings saved.');
        modal.style.display = "none";
    });
}

// Function to create a day column with journal entry and emoji ratings
function createDayColumn(date, dayIndex, currentWeekIndex) {
    const dayColumn = createDayColumnContainer();
    const dayDate = new Date(date);

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
    dayLabel.textContent = `Day ${dayIndex + 1} - ${dayDateString}`;
    dayColumn.appendChild(dayLabel);
}

function createJournalEntry(dayColumn, dayIndex, currentWeekIndex) {
    const dayJournalEntry = document.createElement('textarea');
    dayJournalEntry.id = `journalDay${dayIndex + 1}`;
    dayJournalEntry.rows = 3;
    dayJournalEntry.classList.add('journal-entry');
    dayJournalEntry.placeholder = "Write your journal entry for this day...";
    dayJournalEntry.value = localStorage.getItem(`journal_${currentWeekIndex}_day${dayIndex + 1}`) || '';
    dayColumn.appendChild(dayJournalEntry);
}

function createEmojiRatings(dayColumn, dayIndex, currentWeekIndex) {
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('day-rating');
    dayColumn.appendChild(ratingContainer);

    const emojis = ['\uD83D\uDE14', '\uD83D\uDE15', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE04'];
    const savedRating = localStorage.getItem(`rating_${currentWeekIndex}_day${dayIndex + 1}`);

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

        if (savedRating && savedRating == ratingInput.value) {
            emojiLabel.classList.add('currently-selected-emoji');
            emojiLabel.style.opacity = '1';
        }

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

// Helper function to clear element content
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
    console.log('week element is..:', currentWeekIndex)
    
    if (weekElement) {
        if (hasJournalEntryOrRating) {
            weekElement.classList.add('personal-glow');
        } else {
            weekElement.classList.remove('personal-glow');
        }
    }
}