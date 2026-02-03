// --- Pure Logic & Config ---
const CONFIG = {
    selectors: {
        amount: {
            input: 'amount',
            label: 'Amount (₦)',
            placeholder: '1,000.00',
            defaultValue: '1,000.00',
            display: 'displayAmount',
            prefix: '₦'
        },
        biller: {
            input: 'biller',
            label: 'Biller Name',
            placeholder: 'Port Harcourt Electricity Distribution Postpaid',
            defaultValue: 'Port Harcourt Electricity Distribution Postpaid',
            display: 'displayBiller'
        },
        beneficiary: {
            input: 'beneficiaryId',
            label: 'Beneficiary ID',
            placeholder: '841305815001',
            defaultValue: '841305815001',
            display: 'displayBeneficiaryId'
        },
        address: {
            input: 'address',
            label: 'Address',
            placeholder: '40 OBOT STR. N/A',
            defaultValue: '40 OBOT STR. N/A',
            display: 'displayAddress'
        },
        date: {
            input: 'transactionDate',
            label: 'Transaction Date',
            placeholder: 'Monday, February 2nd, 2026',
            defaultValue: 'Monday, February 2nd, 2026',
            display: 'displayTransactionDate'
        },
        ref: {
            input: 'transactionRef',
            label: 'Transaction Reference',
            placeholder: 'BPT|2MPTbe0z1|2018372898801610752',
            defaultValue: 'BPT|2MPTbe0z1|2018372898801610752',
            display: 'displayTransactionRef'
        },
        business: {
            input: 'businessName',
            label: 'Business Name',
            placeholder: 'EZEKIEL ABAESSIEN AUGUSTINE',
            defaultValue: 'EZEKIEL ABAESSIEN AUGUSTINE',
            display: 'displayBusinessName'
        }
    },
    canvasOptions: {
        scale: 4,             // Increased for extra sharpness
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,     // Helps with cross-origin images
        dpi: 300,             // Professional print resolution
    }
};

// --- Impure / Side Effect Helpers ---
const getElement = (id) => document.getElementById(id);
const getValue = (id) => getElement(id)?.value || '';
const setText = (id, text) => {
    const el = getElement(id);
    if (el) el.textContent = text;
};

const applyStyle = (el, styles) => Object.assign(el.style, styles);

// --- Functional Transformations ---
const getFormData = () => {
    return Object.entries(CONFIG.selectors).reduce((acc, [key, config]) => {
        acc[key] = getValue(config.input);
        return acc;
    }, {});
};

const updateReceiptField = ({ input, display, prefix = '' }) =>
    setText(display, `${prefix}${getValue(input)}`);

const updateReceipt = (shouldRedirect = false) => {
    const data = getFormData();
    
    // Save to session storage for persistence across pages
    sessionStorage.setItem('receiptData', JSON.stringify(data));

    // Update fields if they exist on the current page
    Object.values(CONFIG.selectors).forEach(updateReceiptField);

    // Isolated animation side effect if receipt exists
    const receipt = getElement('receipt');
    if (receipt) {
        applyStyle(receipt, { transform: 'scale(0.98)' });
        setTimeout(() => {
            applyStyle(receipt, { 
                transition: 'transform 0.3s ease', 
                transform: 'scale(1)' 
            });
        }, 100);
    }

    if (shouldRedirect) {
        window.location.href = 'receipt.html';
    }
};

const loadReceiptData = () => {
    const savedData = sessionStorage.getItem('receiptData');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    
    Object.entries(CONFIG.selectors).forEach(([key, config]) => {
        const value = data[key];
        // Update input if on index page
        const input = getElement(config.input);
        if (input) input.value = value;
        
        // Update display if on receipt page
        const prefix = config.prefix || '';
        setText(config.display, `${prefix}${value}`);
    });
};

const downloadReceipt = () => {
    const receipt = getElement('receipt');
    if (!receipt) return;
    
    html2canvas(receipt, CONFIG.canvasOptions)
        .then(canvas => {
            const link = document.createElement('a');
            link.download = 'moniepoint-receipt.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
};

// --- UI Rendering ---
const createFormField = (id, field) => `
    <div class="form-group">
        <label for="${field.input}">${field.label}</label>
        <input type="text" id="${field.input}" placeholder="${field.placeholder}" value="${field.defaultValue}" required>
    </div>
`;

const renderForm = () => {
    const form = getElement('receiptForm');
    if (!form) return;

    const fieldsHtml = Object.entries(CONFIG.selectors)
        .map(([id, field]) => createFormField(id, field))
        .join('');

    form.innerHTML = `
        ${fieldsHtml}
        <button type="button" class="btn-generate">Update Receipt</button>
    `;
};

// --- Initialization (Side Effects) ---
const init = () => {
    // 1. Render UI from Config
    renderForm();

    // 2. Load existing data if any
    loadReceiptData();

    // 3. Listen for inputs if on index page
    document.querySelectorAll('input').forEach(input => 
        input.addEventListener('input', () => updateReceipt(false))
    );
    
    // 4. Handle Navigation
    const generateBtn = document.querySelector('.btn-generate');
    if (generateBtn) {
        generateBtn.onclick = () => updateReceipt(true);
    }
};

init();
