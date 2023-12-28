const buffettMilestones = [
    { age: 26, week: 10, event: "Started Buffett Partnership Ltd." },
    { age: 32, week: 22, event: "Became a millionaire" },
    { age: 35, week: 15, event: "Took control of Berkshire Hathaway" },
    { age: 39, week: 5, event: "Berkshire Hathaway began buying stock in ABC" },
    { age: 47, week: 30, event: "Buffett's net worth reached $140 million" },
    { age: 56, week: 12, event: "Berkshire Hathaway made a $6.3 billion investment in Coca-Cola" },
    { age: 59, week: 18, event: "Became the wealthiest person in the United States" },
    { age: 60, week: 25, event: "Berkshire Hathaway purchased Duracell" },
    { age: 70, week: 33, event: "Pledged to give away 99% of his fortune" },
    { age: 75, week: 40, event: "Berkshire Hathaway acquired PacifiCorp" },
    { age: 80, week: 7, event: "Awarded the Presidential Medal of Freedom" },
    { age: 88, week: 29, event: "Berkshire Hathaway invested in Paytm, an Indian digital payment company" }
    // Additional milestones can be added here
];

const steveMilestones = [
    { age: 21, week: 15, event: "Co-founded Apple Computer Inc. with Steve Wozniak and Ronald Wayne" },
    { age: 26, week: 30, event: "Introduced the Apple II" },
    { age: 29, week: 10, event: "Saw the demo of Xerox PARC's mouse-driven graphical interface" },
    { age: 30, week: 22, event: "Introduced the Macintosh" },
    { age: 30, week: 40, event: "Ousted from Apple" },
    { age: 34, week: 12, event: "Founded NeXT Inc." },
    { age: 35, week: 28, event: "Purchased The Graphics Group, later renamed Pixar" },
    { age: 40, week: 33, event: "Apple bought NeXT; Jobs returned to Apple" },
    { age: 42, week: 18, event: "Named interim CEO of Apple" },
    { age: 45, week: 44, event: "Introduced the iPod" },
    { age: 51, week: 37, event: "Announced the iPhone" },
    { age: 54, week: 26, event: "Introduced the iPad" },
    { age: 56, week: 35, event: "Resigned as CEO of Apple" }
    // Additional milestones can be added here
];

// renderCalendar function
function renderCalendar() {
    if (!validateAndSetupBirthday()) return;
    const totalWeeks = 90 * 52; // Average life expectancy of 90 years, every year has 52 weeks

    generateLegends();
    generateCalendar(totalWeeks);
    highlightInspiration(totalWeeks);
    applyGlowEffectToWeeks();
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
    for (let i = 0; i < 90; i++) {
        const yearLabel = document.createElement('div');
        yearLabel.classList.add('legend-cell');
        yearLabel.innerText = i;
        legendY.appendChild(yearLabel);
        if (i < 89) {
            const gap = document.createElement('div');
            gap.classList.add('gap');
            legendY.appendChild(gap);
        }
    }
}

function generateCalendar(totalWeeks) {
    const calendar = document.getElementById('calendar');
    const birthday = new Date(document.getElementById('birthdayInput').value);
    const today = new Date();
    let year = new Date(birthday).getFullYear(); // starting with brithday year

    for (let i = 0; i < totalWeeks; i++) {
        const week = document.createElement('div');
        week.classList.add('week');
        week.classList.add(year);
        week.setAttribute('data-index', i);  // Starts from 0
        
        // Calculate the date of the current week (assuming the first week starts on January 1st)
        const currentDate = new Date(birthday.getFullYear(), 0, 1 + i * 7);
        // console.log('its week ' + i);
        // console.log('currentDate: ', currentDate);
        
        // Mark as 'unborn' if the week is before the birthday in the birth year
        if (currentDate < birthday && currentDate.getFullYear() === birthday.getFullYear()) {
            week.classList.add('unborn');
        }
        // Mark as 'passed' if the week is before the current week in the current year
        if (currentDate < today && currentDate.getFullYear() <= today.getFullYear()) {
            // console.log('weekNumber: ', i);
            // console.log('currentDate: ', currentDate);
            // console.log('today: ', today);
            week.classList.add('passed');
        }
        
        // Increase the year if it's the last week of the year
        if (i % 52 === 51 & i !== 0) {
            year += 1; 
        }

        calendar.appendChild(week);
    }
}

function highlightInspiration(totalWeeks) {
    const weeks = document.querySelectorAll('#calendar .week');

    // Highlight the birthday week
    for (let year = 0; year < 90; year++) {
        let birthdayThisYear = new Date(birthday);
        birthdayThisYear.setFullYear(birthday.getFullYear() + year);

        const birthdayWeek = getWeekNumber(birthdayThisYear) - 1; // -1 for zero-based index
        const index = year * 52 + birthdayWeek;
        if (index < totalWeeks && weeks[index]) {
            weeks[index].classList.add('celebratory-week');
        }
    }

    // Mark Christmas week for each year
    for (let year = 0; year < 90; year++) {
        const christmasDate = new Date(year + 1900, 11, 25); // December 25 of each year
        const christmasWeek = getWeekNumber(christmasDate) - 1;
        const index = year * 52 + christmasWeek;
        if (index < totalWeeks && weeks[index]) {
            weeks[index].classList.add('christmas-week');
        }
    }
}

// Function to apply glow effects
function applyGlowEffectToWeeks() {
    const weeks = document.querySelectorAll('#calendar .week');

    weeks.forEach((week, index) => {
        const age = Math.floor(index / 52);
        const weekOfYear = index % 52 + 1;
        let hasPersonalUpdate = false;
        let hasInspirationMilestone = false;

        // Check for personal journal entries or ratings
        for (let i = 1; i <= 7; i++) {
            if (localStorage.getItem(`journal_${index}_day${i}`) ||
                localStorage.getItem(`rating_${index}_day${i}`)) {
                hasPersonalUpdate = true;
                break;
            }
        }

        // Check for milestones from inspirational figures
        const inspirationalFigures = [buffettMilestones, steveMilestones]; // Array of milestone arrays
        inspirationalFigures.forEach(milestones => {
            if (milestones.some(milestone => milestone.age === age && milestone.week === weekOfYear)) {
                hasInspirationMilestone = true;
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

// Helper function to get the week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Update glow effect based on journal entries
function updateGlowEffectForWeek(weekIndex) {
    let hasJournalEntryOrRating = false;

    for (let i = 1; i <= 7; i++) {
        if (localStorage.getItem(`journal_${weekIndex}_day${i}`) ||
            localStorage.getItem(`rating_${weekIndex}_day${i}`)) {
            hasJournalEntryOrRating = true;
            break;
        }
    }

    const weekElement = document.querySelector(`#calendar .week[data-index="${weekIndex}"]`);
    if (weekElement) {
        if (hasJournalEntryOrRating) {
            weekElement.classList.add('personal-glow');
        } else {
            weekElement.classList.remove('personal-glow');
        }
    }
}

// Event listener setup
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    renderCalendar();
});

function setupEventListeners() {
    const calendar = document.getElementById('calendar');
    const columns = 52; // Assuming 52 weeks per year
    const popup = document.getElementById('popup');
    const modal = document.getElementById('weekModal');
    const modalText = document.getElementById('modalText');

    const span = document.getElementsByClassName("close")[0];
    let currentWeekIndex;

    calendar.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('week')) {
            // Calculate age and week based on the square's index
            const index = Array.from(calendar.children).indexOf(event.target);
            const age = Math.floor(index / columns);
            const week = index % columns + 1; // Adding 1 since week count starts from 1

            // Update the popup content
            popup.innerHTML = `Age ${age}, Week ${week}, the highlight of this week is...`;
            // Position the popup
            const rect = event.target.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + window.scrollY}px`;
            popup.style.display = 'block';

            const isChristmasWeek = event.target.classList.contains('christmas-week');
            if (isChristmasWeek) {
                popup.innerHTML += ' &#x1F385;'; // Append Santa emoji for Christmas week
            }
        }
    });

    calendar.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('week')) {
            popup.style.display = 'none';
        }
    });
    
    // Helper function to clear element content
    /**
     * Clears the content of an HTML element.
     * @param {HTMLElement} element - The element to be cleared.
     */
    function clearElement(element) {
    element.innerHTML = '';
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

    // Function to create a day column with journal entry and emoji ratings
    function createDayColumn(dayIndex, currentWeekIndex, birthDate) {
        const dayColumn = document.createElement('div');
        dayColumn.classList.add('day-column');
        
        // Create the days for the week
        CreateDates(dayIndex, birthDate, dayColumn, currentWeekIndex);

        // Create the emoji ratings
        createEmojis(dayColumn, currentWeekIndex, dayIndex, updateEmojiOpacity);

        return dayColumn;
    }
  
    // Click event for weeks
    calendar.addEventListener('click', function(event) {
        if (!event.target.classList.contains('week')) {
        return;
        }
    
        currentWeekIndex = Array.from(calendar.children).indexOf(event.target) + 1;
        console.log('Clicked on Week: ', currentWeekIndex);

        const birthdayValue = document.getElementById('birthdayInput').value;
        // Calculate the birth date for the week
        let birthDate = new Date(birthdayValue);    
    
        const age = Math.floor(currentWeekIndex / 52);
        const week = currentWeekIndex % 52;
        modalText.textContent = `Journal Entries for Age ${age}, Week ${week}`;
    
        const weekView = document.getElementById('weekView');
        clearElement(weekView);
    
        for (let i = 1; i <= 7; i++) {
        weekView.appendChild(createDayColumn(i, currentWeekIndex, birthDate));
        }
    
        modal.style.display = "block";
    });
    
    // Example: Saving logic for day entries (you will need to adapt this based on your save mechanism)
    const saveButton = document.getElementById('saveJournal');
    saveButton.addEventListener('click', function() {
        let hasEntry = false; // Flag to check if any day has an entry

        for (let i = 1; i <= 7; i++) {
            const dayJournalEntry = document.getElementById(`journalDay${i}`);
            const entryContent = dayJournalEntry.value.trim();
            // Save the journal entry for each day
            localStorage.setItem(`journal_${currentWeekIndex}_day${i}`, entryContent);

            // Check if the day has an entry
            if (entryContent !== "") {
                hasEntry = true;
            }

            // Retrieve and save the selected rating for each day
            const ratingRadio = document.querySelector(`input[name="rating${currentWeekIndex}_day${i}"]:checked`);
            if (ratingRadio) {
                const selectedRating = ratingRadio.value;
                localStorage.setItem(`rating_${currentWeekIndex}_day${i}`, selectedRating);
            }
        }

        if (hasEntry) {
            const weekElement = document.querySelector(`#calendar .week[data-index="${currentWeekIndex}"]`);
            if (weekElement) {
                weekElement.classList.add('personal-glow');
                console.log('adding the personal glow')
            }
        }

        updateGlowEffectForWeek(currentWeekIndex);
        alert('Journal entries and ratings saved.');
        modal.style.display = "none";
    });

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
// Code for creating day columns, it makes sure partial weeks are accounted for
function CreateDates(dayIndex, birthDate, dayColumn, currentWeekIndex) {
    // Calculate the date for the day
    const currentYearValue = document.getElementsByClassName('week')[currentWeekIndex].classList[1]; // get current year
    const currentYear = new Date(currentYearValue, 0, 1); // get first day of current year
    // const currentDate = new Date(birthday.getFullYear(), 0, 1 + i * 7);
    const yearPassed = currentYear.getFullYear() - birthDate.getFullYear(); // get years passed
    const daysPassed = (currentWeekIndex - yearPassed * 52) * 7 + dayIndex - 1;
    currentYear.setDate(daysPassed)
      
    // Check if the day falls within the current year, how to get current year? 
    if (currentYear >= new Date(currentYearValue, 0, 1) && currentYear <= new Date(currentYearValue, 12, 31)) {
        // Format the date (e.g., Dec 26th, 2023)
        const dayDateString = currentYear.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        console.log(dayDateString);

        const dayLabel = document.createElement('div');
        dayLabel.textContent = `Day ${dayIndex} - ${dayDateString}`;
        dayColumn.appendChild(dayLabel);

        const dayJournalEntry = document.createElement('textarea');
        dayJournalEntry.id = `journalDay${dayIndex}`;
        dayJournalEntry.rows = 3;
        dayJournalEntry.classList.add('journal-entry');
        dayJournalEntry.placeholder = "Write your journal entry for this day...";
        dayJournalEntry.value = localStorage.getItem(`journal_${currentWeekIndex}_day${dayIndex}`) || '';
        dayColumn.appendChild(dayJournalEntry);
    } else {
        dayColumn.style.display = 'none'; 
        // console.log('Its ' + dayDate + ' , not current year');
    }
}

// Code for creating emojis
function createEmojis(dayColumn, currentWeekIndex, dayIndex, updateEmojiOpacity) {
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('day-rating');
    dayColumn.appendChild(ratingContainer);

    // Use the provided emoji array
    const emojis = ['\uD83D\uDE14', '\uD83D\uDE15', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE04'];
    const savedRating = localStorage.getItem(`rating_${currentWeekIndex}_day${dayIndex}`);

    // Create the radio buttons for each emoji
    emojis.forEach((emoji, index) => {
        const emojiId = `rating${currentWeekIndex}_day${dayIndex}_${index}`;

        const ratingInput = document.createElement('input');
        ratingInput.type = 'radio';
        ratingInput.id = emojiId;
        ratingInput.name = `rating${currentWeekIndex}_day${dayIndex}`;
        ratingInput.value = index + 1; // Assuming the ratings are numerical 1-5
        ratingInput.style.display = 'none'; // Hide the default radio button

        const emojiLabel = document.createElement('label');
        emojiLabel.setAttribute('for', emojiId);
        emojiLabel.classList.add('emoji-label');
        emojiLabel.innerHTML = emoji; // Setting the emoji from the array
        ratingContainer.appendChild(ratingInput);
        ratingContainer.appendChild(emojiLabel);

        if (savedRating && savedRating == ratingInput.value) {
            emojiLabel.classList.add('currently-selected-emoji');
            emojiLabel.style.opacity = '1'; // Ensure the selected emoji has full opacity
        }

        // Event listener for changing the selected rating
        emojiLabel.addEventListener('click', function () {
            ratingInput.checked = true;
            updateEmojiOpacity(ratingContainer, emoji);
        });
    });
}