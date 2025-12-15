function setupHourCalculations() {
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach(row => {
        const startInput = row.querySelector('input[type="time"][name$="_start"]');
        const hoursInput = row.querySelector('input[type="number"][name$="_hours"]');
        const overtimeInput = row.querySelector('input[name$="_overtime"]');
        const breakInput = row.querySelector('input[name$="_break"]');
        const regularTd = row.querySelector('.regular-hours');
        const totalTd = row.querySelector('.total-hours');

        if (startInput) {
            const day = row.getAttribute('data-day');
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day)) {
                startInput.value = "08:00";
            }
        }

        function calculate() {
            let regular = 0;
            if (hoursInput && hoursInput.value) {
                regular = parseFloat(hoursInput.value) || 0;
            }
            regularTd.textContent = regular.toFixed(1);

            const overtime = overtimeInput ? parseFloat(overtimeInput.value) || 0 : 0;
            const breakHours = breakInput ? parseFloat(breakInput.value) || 0 : 0;

            let total = regular + overtime - breakHours;
            if (total < 0) total = 0;
            totalTd.textContent = total.toFixed(1);
        }

        [startInput, hoursInput, overtimeInput, breakInput].forEach(input => {
            if (input) input.addEventListener('input', calculate);
        });

        calculate();
    });
}

function fillOutInfoBasedOnMondayDate() {
    const mondayDateInput = document.getElementById('monday_date');
    if (!mondayDateInput) return;

    const dayOffsets = {
        'tuesday_date': 1,
        'wednesday_date': 2,
        'thursday_date': 3,
        'friday_date': 4,
        'saturday_date': 5,
        'sunday_date': 6
    };

    const updateWeekAndDays = () => {
        const mondayDate = new Date(mondayDateInput.value);
        if (isNaN(mondayDate)) return;

        for (const [inputId, offset] of Object.entries(dayOffsets)) {
            const dateInput = document.getElementById(inputId);
            if (!dateInput) continue;

            const date = new Date(mondayDate);
            date.setDate(mondayDate.getDate() + offset);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            dateInput.value = `${date.getFullYear()}-${month}-${day}`;
        }

        updateWeekNumber();
    };

    mondayDateInput.addEventListener('change', updateWeekAndDays);

    const observer = new MutationObserver(updateWeekAndDays);
    observer.observe(mondayDateInput, { attributes: true, attributeFilter: ['value'] });

    updateWeekAndDays();
}

function updateWeekNumber() {
    const mondayDateInput = document.getElementById('monday_date');
    const weekNumberInput = document.getElementById('week_number');
    if (!mondayDateInput || !weekNumberInput) return;

    const date = new Date(mondayDateInput.value);
    if (isNaN(date)) {
        weekNumberInput.value = '';
        return;
    }

    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + firstJan.getDay() + 1) / 7);
    weekNumberInput.value = weekNumber;
}

window.addEventListener('DOMContentLoaded', () => {
    setupHourCalculations();
    fillOutInfoBasedOnMondayDate();

    document.querySelectorAll('.clear-row').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            const startInput = row.querySelector('input[type="time"][name$="_start"]');
            const hoursInput = row.querySelector('input[type="number"][name$="_hours"]');
            const overtimeInput = row.querySelector('input[name$="_overtime"]');
            const breakInput = row.querySelector('input[name$="_break"]');
            const regularTd = row.querySelector('.regular-hours');
            const totalTd = row.querySelector('.total-hours');

            if (startInput) startInput.value = '';
            if (hoursInput) hoursInput.value = '';
            if (overtimeInput) overtimeInput.value = '';
            if (breakInput) breakInput.value = '';
            if (regularTd) regularTd.textContent = '0.0';
            if (totalTd) totalTd.textContent = '0.0';
        });
    });
});