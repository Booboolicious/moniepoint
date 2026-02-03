// 1. Setup our data - a simple list of fields we need
const formFields = [
    {
        id: 'beneficiaryId',
        label: 'Beneficiary ID',
        placeholder: '841305815001',
        defaultValue: '841305815001',
        displayId: 'displayBeneficiaryId'
    },
    {
        id: 'address',
        label: 'Address',
        placeholder: '40 OBOT STR. N/A',
        defaultValue: '40 OBOT STR. N/A',
        displayId: 'displayAddress'
    },
    {
        id: 'businessName',
        label: 'Business Name',
        placeholder: 'EZEKIEL ABAESSIEN AUGUSTINE',
        defaultValue: 'EZEKIEL ABAESSIEN AUGUSTINE',
        displayId: 'displayBusinessName'
    }
];

// Helper to generate reaching "Wednesday, February 4th, 2026" format
function getFormattedDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();

    // Add suffix (st, nd, rd, th)
    let suffix = 'th';
    if (date === 1 || date === 21 || date === 31) suffix = 'st';
    else if (date === 2 || date === 22) suffix = 'nd';
    else if (date === 3 || date === 23) suffix = 'rd';

    return `${dayName}, ${monthName} ${date}${suffix}, ${year}`;
}

// Helper to generate a random 15-digit number
function generateRandom15Digits() {
    let result = '';
    for (let i = 0; i < 15; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

// Function to update automatic fields (Reference and Date)
function updateAutoFields() {
    // 1. Update Random Transaction Reference
    const refElement = document.getElementById('displayTransactionRef');
    if (refElement) {
        const randomNumber = generateRandom15Digits();
        refElement.textContent = `BPT|2MPTbe0z1|2018${randomNumber}`;
    }

    // 2. Update Current Date
    const dateElement = document.getElementById('displayTransactionDate');
    if (dateElement) {
        dateElement.textContent = getFormattedDate();
    }
}

function renderForm() {
    const formContainer = document.getElementById('receiptForm');
    if (!formContainer) return; 

    let html = '';
    for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        html += `
            <div class="form-group">
                <label for="${field.id}">${field.label}</label>
                <input type="text" id="${field.id}" placeholder="${field.placeholder}" value="${field.defaultValue}" required>
            </div>
        `;
    }

    // Add the button at the end
    html += '<button type="button" class="btn-generate" id="generateBtn">Update Receipt</button>';

    formContainer.innerHTML = html;

    // After rendering, attach event listeners to the new inputs
    const inputs = formContainer.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', function () {
            updateReceipt(false); // Update preview without redirecting
        });
    }

    // Attach click listener to the generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.onclick = function () {
            updateReceipt(true); // Update and redirect
        };
    }
}

// 3. This function saves data and updates the live preview
function updateReceipt(shouldRedirect) {
    const receiptData = {};

    // Grab values from all inputs and update the live text
    for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        const inputElement = document.getElementById(field.id);

        if (inputElement) {
            let value = inputElement.value;

            // --- FEATURE: Force Uppercase for Business Name ---
            if (field.id === 'businessName') {
                value = value.toUpperCase();
                inputElement.value = value; // Update the input box itself too
            }

            receiptData[field.id] = value;

            const displayElement = document.getElementById(field.displayId);
            if (displayElement) {
                const prefix = field.prefix || '';
                displayElement.textContent = prefix + value;
            }
        }
    }

    sessionStorage.setItem('receiptData', JSON.stringify(receiptData));

    const receipt = document.getElementById('receipt');
    if (receipt) {
        receipt.style.transform = 'scale(0.98)';
        setTimeout(function () {
            receipt.style.transition = 'transform 0.3s ease';
            receipt.style.transform = 'scale(1)';
        }, 100);
    }

    if (shouldRedirect === true) {
        window.location.href = 'receipt.html';
    }
}

function loadSavedData() {
    const rawData = sessionStorage.getItem('receiptData');
    if (!rawData) return;

    const data = JSON.parse(rawData);
    for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        const savedValue = data[field.id];

        if (savedValue) {
            const input = document.getElementById(field.id);
            if (input) input.value = savedValue;

            const display = document.getElementById(field.displayId);
            if (display) {
                const prefix = field.prefix || '';
                display.textContent = prefix + savedValue;
            }
        }
    }
}

function downloadReceipt() {
    const receipt = document.getElementById('receipt');
    if (!receipt) return;

    const options = {
        scale: 4,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        dpi: 300
    };

    html2canvas(receipt, options).then(function (canvas) {
        const link = document.createElement('a');
        link.download = 'moniepoint-receipt.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Start everything up
renderForm();
loadSavedData();
updateAutoFields();
