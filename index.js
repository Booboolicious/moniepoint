// --- Pure Logic & Config ---
const CONFIG = {
    selectors: {
        amount: { input: 'amount', display: 'displayAmount', prefix: '₦' },
        biller: { input: 'biller', display: 'displayBiller' },
        beneficiary: { input: 'beneficiaryId', display: 'displayBeneficiaryId' },
        address: { input: 'address', display: 'displayAddress' },
        date: { input: 'transactionDate', display: 'displayTransactionDate' },
        ref: { input: 'transactionRef', display: 'displayTransactionRef' },
        business: { input: 'businessName', display: 'displayBusinessName' }
    },
    canvasOptions: {
        scale: 3,
        backgroundColor: null,
        logging: false,
        useCORS: true
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

// --- Initialization (Side Effects) ---
const init = () => {
    // Load existing data if any
    loadReceiptData();

    // Listen for inputs if on index page
    document.querySelectorAll('input').forEach(input => 
        input.addEventListener('input', () => updateReceipt(false))
    );
    
    // If we are on index.html, the button should trigger direct navigation
    const generateBtn = document.querySelector('.btn-generate');
    if (generateBtn) {
        generateBtn.onclick = () => updateReceipt(true);
    }
};

init();
