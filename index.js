// 1. Setup our data - a simple list of fields we need
const formFields = [
    {
        id: 'amount',
        label: 'Amount (₦)',
        placeholder: '1,000.00',
        defaultValue: '1,000.00',
        displayId: 'displayAmount',
        prefix: '₦'
    },
    {
        id: 'biller',
        label: 'Biller Name',
        placeholder: 'Port Harcourt Electricity Distribution Postpaid',
        defaultValue: 'Port Harcourt Electricity Distribution Postpaid',
        displayId: 'displayBiller'
    },
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
        id: 'transactionDate',
        label: 'Transaction Date',
        placeholder: 'Monday, February 2nd, 2026',
        defaultValue: 'Monday, February 2nd, 2026',
        displayId: 'displayTransactionDate'
    },
    {
        id: 'transactionRef',
        label: 'Transaction Reference',
        placeholder: 'BPT|2MPTbe0z1|2018372898801610752', defaultValue: 'BPT|2MPTbe0z1|2018372898801610752', displayId: 'displayTransactionRef'
    },
    {
        id: 'businessName',
        label: 'Business Name',
        placeholder: 'EZEKIEL ABAESSIEN AUGUSTINE',
        defaultValue: 'EZEKIEL ABAESSIEN AUGUSTINE',
        displayId: 'displayBusinessName'
    }
];

// 2. This function builds the form on the page
function renderForm() {
    const formContainer = document.getElementById('receiptForm');
    if (!formContainer) return; // Exit if the form isn't on this page

    let html = '';

    // Loop through each field and create the HTML for it
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
            const value = inputElement.value;
            receiptData[field.id] = value; // Store for saving

            // Update the display text on the receipt
            const displayElement = document.getElementById(field.displayId);
            if (displayElement) {
                const prefix = field.prefix || '';
                displayElement.textContent = prefix + value;
            }
        }
    }

    // Save all the data to the browser session so the next page can see it
    sessionStorage.setItem('receiptData', JSON.stringify(receiptData));

    // If we are on the page with the receipt, run a quick animation
    const receipt = document.getElementById('receipt');
    if (receipt) {
        receipt.style.transform = 'scale(0.98)';
        setTimeout(function () {
            receipt.style.transition = 'transform 0.3s ease';
            receipt.style.transform = 'scale(1)';
        }, 100);
    }

    // Go to the receipt page if the user clicked "Update Receipt"
    if (shouldRedirect === true) {
        window.location.href = 'receipt.html';
    }
}

// 4. This function loads saved data when the page opens
function loadSavedData() {
    const rawData = sessionStorage.getItem('receiptData');
    if (!rawData) return;

    const data = JSON.parse(rawData);

    for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        const savedValue = data[field.id];

        if (savedValue) {
            // Put the value back into the input box if it exists
            const input = document.getElementById(field.id);
            if (input) input.value = savedValue;

            // Put the value into the receipt display text if it exists
            const display = document.getElementById(field.displayId);
            if (display) {
                const prefix = field.prefix || '';
                display.textContent = prefix + savedValue;
            }
        }
    }
}

// 5. This function handles the image download
function downloadReceipt() {
    const receipt = document.getElementById('receipt');
    if (!receipt) return;

    // Settings for the screenshot library
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

// 6. Start everything up when the script loads
renderForm();
loadSavedData();
