const sleepForm = document.getElementById("sleepForm");
const historyList = document.getElementById("historyList");
const chart = document.getElementById("chart");
const avgSleep = document.getElementById("avgSleep");
const bestNight = document.getElementById("bestNight");
const streak = document.getElementById("streak");
const sleepTip = document.getElementById("sleepTip");
const clearBtn = document.getElementById("clearBtn");

let sleepEntries = JSON.parse(localStorage.getItem("dreamlogEntries")) || [];

function calculateSleepHours(bedTime, wakeTime) {
    let bed = new Date(`2000-01-01T${bedTime}`);
    let wake = new Date(`2000-01-01T${wakeTime}`);

    if (wake <= bed) {
        wake.setDate(wake.getDate() + 1);
    }

    const diffMs = wake - bed;
    const hours = diffMs / (1000 * 60 * 60);

    return hours.toFixed(1);
}

function getQuality(hours) {
    hours = parseFloat(hours);

    if (hours < 6) {
        return {
            label: "Poor",
            color: "#ef4444"
        };
    } else if (hours >= 6 && hours < 7) {
        return {
            label: "Fair",
            color: "#f59e0b"
        };
    } else if (hours >= 7 && hours < 8) {
        return {
            label: "Good",
            color: "#3b82f6"
        };
    } else {
        return {
            label: "Great",
            color: "#10b981"
        };
    }
}

function getSleepTip(hours) {
    hours = parseFloat(hours);

    if (hours < 6) {
        return "You are not getting enough sleep. Try sleeping earlier and reduce screen time before bed.";
    } else if (hours >= 6 && hours < 7) {
        return "Your sleep is fair, but adding another hour could improve concentration and energy.";
    } else if (hours >= 7 && hours < 8) {
        return "Good sleep! Maintain a consistent bedtime routine for even better recovery.";
    } else {
        return "Excellent sleep duration! Keep maintaining your healthy sleep habits.";
    }
}

function saveToLocalStorage() {
    localStorage.setItem("dreamlogEntries", JSON.stringify(sleepEntries));
}

function renderHistory() {
    historyList.innerHTML = "";

    if (sleepEntries.length === 0) {
        historyList.innerHTML = `<p class="empty-text">No sleep entries yet.</p>`;
        return;
    }

    const sortedEntries = [...sleepEntries].reverse();

    sortedEntries.forEach(entry => {
        const qualityData = getQuality(entry.hours);

        const item = document.createElement("div");
        item.classList.add("history-item");

        item.innerHTML = `
            <h4>${entry.date}</h4>
            <p><strong>Bed Time:</strong> ${entry.bedTime}</p>
            <p><strong>Wake Time:</strong> ${entry.wakeTime}</p>
            <p><strong>Sleep Duration:</strong> ${entry.hours} hrs</p>
            <p><strong>Mood:</strong> ${entry.mood}</p>
            <span class="quality" style="background:${qualityData.color}">
                ${qualityData.label}
            </span>
        `;

        historyList.appendChild(item);
    });
}

function renderChart() {
    chart.innerHTML = "";

    const latestEntries = sleepEntries.slice(-7);

    latestEntries.forEach(entry => {
        const qualityData = getQuality(entry.hours);

        const barContainer = document.createElement("div");
        barContainer.classList.add("bar-container");

        const barHours = document.createElement("div");
        barHours.classList.add("bar-hours");
        barHours.textContent = `${entry.hours}h`;

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${entry.hours * 22}px`;
        bar.style.background = qualityData.color;

        const label = document.createElement("div");
        label.classList.add("bar-label");

        const shortDate = new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        label.textContent = shortDate;

        barContainer.appendChild(barHours);
        barContainer.appendChild(bar);
        barContainer.appendChild(label);

        chart.appendChild(barContainer);
    });
}

function updateStats() {
    if (sleepEntries.length === 0) {
        avgSleep.textContent = "0 hrs";
        bestNight.textContent = "0 hrs";
        streak.textContent = "0 Days";
        return;
    }

    const total = sleepEntries.reduce((sum, entry) => {
        return sum + parseFloat(entry.hours);
    }, 0);

    const average = (total / sleepEntries.length).toFixed(1);

    const highest = Math.max(...sleepEntries.map(entry => parseFloat(entry.hours)));

    avgSleep.textContent = `${average} hrs`;
    bestNight.textContent = `${highest} hrs`;
    streak.textContent = `${calculateStreak()} Days`;
}

function calculateStreak() {
    if (sleepEntries.length === 0) return 0;

    const dates = sleepEntries
        .map(entry => new Date(entry.date))
        .sort((a, b) => b - a);

    let streakCount = 1;

    for (let i = 0; i < dates.length - 1; i++) {
        const current = dates[i];
        const next = dates[i + 1];

        const diff = (current - next) / (1000 * 60 * 60 * 24);

        if (Math.round(diff) === 1) {
            streakCount++;
        } else {
            break;
        }
    }

    return streakCount;
}

sleepForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const date = document.getElementById("sleepDate").value;
    const bedTime = document.getElementById("bedTime").value;
    const wakeTime = document.getElementById("wakeTime").value;
    const mood = document.getElementById("mood").value;

    const hours = calculateSleepHours(bedTime, wakeTime);

    const entry = {
        date,
        bedTime,
        wakeTime,
        mood,
        hours
    };

    sleepEntries.push(entry);

    saveToLocalStorage();
    renderHistory();
    renderChart();
    updateStats();

    sleepTip.textContent = getSleepTip(hours);

    sleepForm.reset();
});

clearBtn.addEventListener("click", function() {
    const confirmDelete = confirm("Are you sure you want to clear all sleep records?");

    if (confirmDelete) {
        sleepEntries = [];

        saveToLocalStorage();
        renderHistory();
        renderChart();
        updateStats();

        sleepTip.textContent = "Your personalized sleep tips will appear here.";
    }
});

renderHistory();
renderChart();
updateStats();