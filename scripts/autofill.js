function setupHourCalculations() {
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach(row => {
        const startInput = row.querySelector('input[type="time"][name$="_start"]');
        const endInput = row.querySelector('input[type="time"][name$="_end"]');
        const overtimeInput = row.querySelector('input[name$="_overtime"]');
        const breakInput = row.querySelector('input[name$="_break"]');
        const regularTd = row.querySelector('.regular-hours');
        const totalTd = row.querySelector('.total-hours');

        function calculate() {
            let regular = 0;
            if (startInput.value && endInput.value) {
                const [sh, sm] = startInput.value.split(':').map(Number);
                const [eh, em] = endInput.value.split(':').map(Number);
                regular = (eh + em / 60) - (sh + sm / 60);
                if (regular < 0) regular = 0; // prevent negative hours
            }
            regularTd.textContent = regular.toFixed(1);

            const overtime = parseFloat(overtimeInput.value) || 0;
            const breakHours = parseFloat(breakInput.value) || 0;
            let total = regular + overtime - breakHours;
            if (total < 0) total = 0;
            totalTd.textContent = total.toFixed(1);
        }

        [startInput, endInput, overtimeInput, breakInput].forEach(input => {
            input.addEventListener('input', calculate);
        });
    });
}

setupHourCalculations();

function fillOutInfoBasedOnMondayDate() {
    const mondayDateInput = document.getElementById('monday_date');
    const dayOffsets = {
        'tuesday_date': 1,
        'wednesday_date': 2,
        'thursday_date': 3,
        'friday_date': 4,
        'saturday_date': 5,
        'sunday_date': 6
    };

    mondayDateInput.addEventListener('change', () => {
        const mondayDate = new Date(mondayDateInput.value);
        if (isNaN(mondayDate)) return;

        for (const [inputId, offset] of Object.entries(dayOffsets)) {
            const date = new Date(mondayDate);
            date.setDate(mondayDate.getDate() + offset);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            document.getElementById(inputId).value = `${date.getFullYear()}-${month}-${day}`;
        }
    });

    updateWeekNumber();
}

fillOutInfoBasedOnMondayDate();

function updateWeekNumber() {
    const mondayDateInput = document.getElementById('monday_date');
    const weekNumberInput = document.getElementById('week_number');
    mondayDateInput.addEventListener('change', () => {
        const date = new Date(mondayDateInput.value);
        if (isNaN(date)) {
            weekNumberInput.value = '';
            return;
        }
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + firstJan.getDay() + 1) / 7);
        weekNumberInput.value = weekNumber;
    });
}