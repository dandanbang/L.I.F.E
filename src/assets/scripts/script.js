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


// Refactored renderCalendar function
function renderCalendar() {
    if (!validateAndSetupBirthday()) return;

    const currentYear = new Date().getFullYear();
    const today = new Date();
    const yearsLived = calculateYearsLived(today);
    const weeksInCurrentYear = calculateWeeksInCurrentYear(today);
    const totalWeeksLived = yearsLived * 52 + weeksInCurrentYear;
    const totalWeeks = 90 * 52; // Average life expectancy of 90 years

    clearExistingContent();
    generateLegends();
    generateCalendar(totalWeeks, totalWeeksLived);
    highlightSpecialWeeks(totalWeeks);
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

function calculateYearsLived(today) {
    let years = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) {
        years--;
    }
    return years;
}

function calculateWeeksInCurrentYear(today) {
    const lastBirthdayYear = today.getFullYear() - (today < new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()) ? 1 : 0);
    const lastBirthday = new Date(lastBirthdayYear, birthday.getMonth(), birthday.getDate());
    return Math.ceil((today - lastBirthday) / (1000 * 60 * 60 * 24 * 7));
}

function clearExistingContent() {
    document.getElementById('calendar').innerHTML = '';
    document.getElementById('legendX').innerHTML = '';
    document.getElementById('legendY').innerHTML = '';
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

function generateCalendar(totalWeeks, totalWeeksLived) {
    const calendar = document.getElementById('calendar');

    for (let i = 0; i < totalWeeks; i++) {
        const week = document.createElement('div');
        week.classList.add('week');
        if (i <= totalWeeksLived) {
            week.classList.add('passed');
        }
        calendar.appendChild(week);
    }
}

function highlightSpecialWeeks(totalWeeks) {
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
    // console.log(weekElement)
    if (weekElement) {
        if (hasJournalEntryOrRating) {
            weekElement.classList.add('personal-glow');
        } else {
            weekElement.classList.remove('personal-glow');
        }
    }
}

// Function to update emoji opacity only for a specific day
function updateEmojiOpacityForDay(name) {
    const dayEmojis = document.querySelectorAll(`input[name="${name}"] + label`);
    dayEmojis.forEach(label => {
        label.style.opacity = '0.5';
    });

    const selectedEmoji = document.querySelector(`input[name="${name}"]:checked + label`);
    if (selectedEmoji) {
        selectedEmoji.style.opacity = '1';
    }
}

// Event listener setup
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    renderCalendar();
    initializeRichTextEditor();
});

function setupEventListeners() {
    const calendar = document.getElementById('calendar');
    const rows = 80; // Assuming 80 years
    const columns = 52; // Assuming 52 weeks per year
    const popup = document.getElementById('popup');
    const modal = document.getElementById('weekModal');
    const modalText = document.getElementById('modalText');

    const span = document.getElementsByClassName("close")[0];
    let currentWeekIndex;
    const journalEntry = document.getElementById('journalEntry');
    const saveJournalButton = document.getElementById('saveJournal');

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

            if (showBuffettMilestones) {
                const milestone = buffettMilestones.find(m => m.age === age && m.week === week);
                if (milestone) {
                    popup.innerHTML += `<br>Warren Buffet - ${milestone.event}`;
                }
            }

            if (showSteveMilestones) {
                const milestone = steveMilestones.find(m => m.age === age && m.week === week);
                if (milestone) {
                    popup.innerHTML += `<br>Steve Jobs - ${milestone.event}`;
                }
            }

        }
    });

    calendar.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('week')) {
            popup.style.display = 'none';
        }
    });

    // Click event for weeks
    calendar.addEventListener('click', function(event) {
        if (event.target.classList.contains('week')) {
            currentWeekIndex = Array.from(calendar.children).indexOf(event.target);
            const age = Math.floor(currentWeekIndex / 52);
            const week = currentWeekIndex % 52 + 1;

            modalText.innerHTML = `Journal Entries for Age ${age}, Week ${week}`;

            // Clear previous week view content
            const weekView = document.getElementById('weekView');
            weekView.innerHTML = '';

            // Populate weekView with day columns, journal entries, and ratings
            for (let i = 1; i <= 7; i++) {
                const dayColumn = document.createElement('div');
                dayColumn.classList.add('day-column');

                const dayLabel = document.createElement('div');
                dayLabel.textContent = `Day ${i}`;

                const dayJournalEntry = document.createElement('textarea');
                dayJournalEntry.id = `journalDay${i}`;
                dayJournalEntry.rows = 3;
                dayJournalEntry.classList.add('journal-entry'); // Apply CSS class for styling
                dayJournalEntry.placeholder = "Write your journal entry for this day...";
                dayJournalEntry.value = localStorage.getItem(`journal_${currentWeekIndex}_day${i}`) || ''; // Retrieve saved journal entry

                const ratingContainer = document.createElement('div');
                ratingContainer.classList.add('day-rating');
                ratingContainer.innerHTML = 'Rate your day: ';

                const emojis = ['\uD83D\uDE14', '\uD83D\uDE15', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE04'];
                const savedRating = localStorage.getItem(`rating_${currentWeekIndex}_day${i}`);

                emojis.forEach((emoji, index) => {
                    const emojiId = `rating${currentWeekIndex}_day${i}_${index}`;

                    const ratingInput = document.createElement('input');
                    ratingInput.type = 'radio';
                    ratingInput.id = emojiId;
                    ratingInput.name = `rating${currentWeekIndex}_day${i}`;
                    ratingInput.value = emoji;
                    ratingInput.style.display = 'none';

                    const emojiLabel = document.createElement('label');
                    emojiLabel.innerHTML = emoji;
                    emojiLabel.htmlFor = emojiId;
                    emojiLabel.classList.add('emoji-label');
                    emojiLabel.style.opacity = savedRating === emoji ? '1' : '0.5';

                    // Attach the event listener within the same forEach loop
                     emojiLabel.addEventListener('click', function() {
                         // Remove 'selected-emoji' class from all labels in the same day column
                         ratingContainer.querySelectorAll('.emoji-label').forEach(label => {
                             label.classList.remove('selected-emoji');
                         });

                         // Add 'selected-emoji' class to clicked label
                         this.classList.add('selected-emoji');
                     });

                    ratingInput.addEventListener('change', () => {
                        updateEmojiOpacityForDay(`rating${currentWeekIndex}_day${i}`);
                    });

                    ratingContainer.appendChild(ratingInput);
                    ratingContainer.appendChild(emojiLabel);
                });

                dayColumn.appendChild(dayLabel);
                dayColumn.appendChild(dayJournalEntry);
                dayColumn.appendChild(ratingContainer);
                weekView.appendChild(dayColumn);
            }

            modal.style.display = "block";

            //After appending all elements, set the checked status
            for (let i = 1; i <= 7; i++) {
                const savedRating = localStorage.getItem(`rating_${currentWeekIndex}_day${i}`);
                if (savedRating) {
                    const ratingRadio = document.querySelector(`input[name="rating${currentWeekIndex}_day${i}"][value="${savedRating}"]`);
                    console.log('checking the ratingRadio:', ratingRadio); // Corrected line with a comma
                    if (ratingRadio) {
                        ratingRadio.checked = true;
                    }
                }
            }
        }
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
            } else {
                // Optional: Handle the case where no rating is selected
                console.log(`No rating selected for day ${i}`);
            }
        }

        if (hasEntry) {
            const weekElement = document.querySelector(`#calendar .week[data-index="${currentWeekIndex}"]`);
            console.log('weekElement')
            console.log(weekElement)
            if (weekElement) {
                weekElement.classList.add('personal-glow');
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

function initializeRichTextEditor() {
    // Code to initialize the rich text editor...
    tinymce.init({
      selector: '#journalEditor',
      plugins: 'ai tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Author name',
      mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
    });
}

// Code for toggle buttons for milestones
let showBuffettMilestones = true;
document.getElementById('toggleBuffettMilestones').addEventListener('click', function() {
    showBuffettMilestones = !showBuffettMilestones;
    this.textContent = showBuffettMilestones ? "Hide Buffett's Milestones" : "Show Buffett's Milestones";
});

let showSteveMilestones = true;
document.getElementById('toggleSteveMilestones').addEventListener('click', function() {
    showSteveMilestones = !showSteveMilestones;
    this.textContent = showSteveMilestones ? "Hide Steve's Milestones" : "Show Steve's Milestones";
});
