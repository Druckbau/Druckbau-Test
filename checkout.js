// js/checkout.js
import { state } from './store.js';
import { showWarning, showError, setSuccess, setError, showSuccess, t, escapeHtml } from './utils.js';
import { getCustomEmailDetails, renderCustomDetails } from './cart.js';

let currentCheckoutStep = 1;

export function checkout() {
    console.log("Checkout initiated. Cart items:", state.cart.length);
    if (state.cart.length === 0) {
        showWarning(t('cart_empty'));
        return;
    }
    currentCheckoutStep = 1;

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error', 'success'));

    // Reset inputs
    ['checkout-name', 'checkout-email', 'checkout-address', 'checkout-zip', 'checkout-city'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('show');
    showCheckoutStep(1);
}

export function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('show');
}

export function showCheckoutStep(step) {
    currentCheckoutStep = step;

    document.querySelectorAll('.checkout-step').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });

    const targetStep = document.getElementById(`checkout-step-${step}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        targetStep.classList.add('active');

        const modalContent = targetStep.closest('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    } else {
        showError('Ein technischer Fehler ist aufgetreten. Bitte laden Sie die Seite neu.');
    }

    document.querySelectorAll('.progress-step').forEach(el => {
        const stepNum = parseInt(el.getAttribute('data-step'));
        el.classList.remove('active', 'completed');
        if (stepNum === step) {
            el.classList.add('active');
        } else if (stepNum < step) {
            el.classList.add('completed');
        }
    });

    if (step === 4) {
        renderCheckoutSummary();
    }
}

export function nextCheckoutStep() {
    if (validateCheckoutStep(currentCheckoutStep)) {
        showCheckoutStep(currentCheckoutStep + 1);
    }
}

export function prevCheckoutStep() {
    if (currentCheckoutStep > 1) {
        showCheckoutStep(currentCheckoutStep - 1);
    }
}

function validateCheckoutStep(step) {
    let isValid = true;

    if (step === 1) {
        const nameInput = document.getElementById('checkout-name');
        const emailInput = document.getElementById('checkout-email');

        if (nameInput && nameInput.value.trim().length < 2) {
            setError(nameInput, 'Bitte geben Sie Ihren Namen ein (min. 2 Zeichen).');
            isValid = false;
        } else if (nameInput) {
            setSuccess(nameInput);
        }

        if (emailInput && (!emailInput.value.includes('@') || emailInput.value.length < 5)) {
            setError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
            isValid = false;
        } else if (emailInput) {
            setSuccess(emailInput);
        }
    } else if (step === 2) {
        const addressInput = document.getElementById('checkout-address');
        const zipInput = document.getElementById('checkout-zip');
        const cityInput = document.getElementById('checkout-city');

        if (addressInput && addressInput.value.trim().length < 5) {
            setError(addressInput, 'Bitte Ihre Adresse eingeben (min. 5 Zeichen).');
            isValid = false;
        } else if (addressInput) {
            setSuccess(addressInput);
        }

        if (zipInput && !/^[0-9]{4,5}$/.test(zipInput.value.trim())) {
            setError(zipInput, 'Gültige PLZ eingeben.');
            isValid = false;
        } else if (zipInput) {
            setSuccess(zipInput);
        }

        if (cityInput && cityInput.value.trim().length < 1) {
            setError(cityInput, 'Bitte Ihren Ort eingeben.');
            isValid = false;
        } else if (cityInput) {
            setSuccess(cityInput);
        }
    } else if (step === 3) {
        const paymentMethod = document.querySelector('input[name="payment-method"]');
        if (!paymentMethod || !paymentMethod.value) {
            isValid = false;
        }
    }

    if (!isValid) {
        showWarning('Bitte füllen Sie alle markierten Felder korrekt aus.');
    }
    return isValid;
}

function renderCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    if (!summary) return;

    const cartItems = state.cart;

    const name = document.getElementById('checkout-name')?.value || '';
    const email = document.getElementById('checkout-email')?.value || '';
    const address = document.getElementById('checkout-address')?.value || '';
    const zip = document.getElementById('checkout-zip')?.value || '';
    const city = document.getElementById('checkout-city')?.value || '';
    const socialConsent = document.getElementById('checkout-social-media')?.checked || false;

    let itemsHtml = cartItems.map(item => {
        if (item.isCustom) {
            return `<li>${escapeHtml(item.name)} × ${Number(item.qty) || 1}<div class="checkout-custom-details">${renderCustomDetails(item)}</div></li>`;
        } else {
            return `<li>${item.qty}x ${escapeHtml(item.name)} (${escapeHtml(item.colorName)})</li>`;
        }
    }).join('');

    const shippingAddrHeader = t('summary_shipping_address');
    const orderPreviewHeader = t('summary_order_preview');

    summary.innerHTML = `
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>${shippingAddrHeader}</strong><br>
            ${escapeHtml(name)}<br>
            ${escapeHtml(address)}<br>
            ${escapeHtml(zip)} ${escapeHtml(city)}<br>
            E-Mail: ${escapeHtml(email)}
        </div>
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>Weiteres Vorgehen:</strong><br>
            Keine Zahlung im Checkout; ein unverbindliches Angebot folgt.
        </div>
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">
            <strong>${orderPreviewHeader}</strong>
            <div style="margin: 0.5rem 0 0.25rem; font-weight: 600;">Anfrageinhalt:</div>
            <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${itemsHtml}</ul>
            <p>${t('inquiry_cart_note')}</p>
            ${cartItems.some(item => item.isCustom) ? `<p class="custom-withdrawal-note">${t('custom_withdrawal_note')}</p>` : ''}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Freiwillige Social-Media-Einwilligung:</strong><br>
            ${socialConsent ? 'Ja' : 'Nein'}
        </div>
    `;

}

export function submitCheckout() {
    const finalBtn = document.getElementById('final-checkout-btn');
    const orderId = finalBtn?.dataset.orderId || generateOrderId();

    const cartSnapshot = state.cart;
    if (cartSnapshot.length === 0) {
        showWarning(t('cart_empty'));
        return;
    }

    const name = document.getElementById('checkout-name')?.value || '',
          email = document.getElementById('checkout-email')?.value || '',
          address = document.getElementById('checkout-address')?.value || '',
          zip = document.getElementById('checkout-zip')?.value || '',
          city = document.getElementById('checkout-city')?.value || '';

    const socialConsent = document.getElementById('checkout-social-media')?.checked || false;

    // Construct order details
    let orderDetails = cartSnapshot.map(item => {
        if (item.isCustom) {
            const itemDetails = [
                getCustomEmailDetails(item),
                t('product_order_custom_files_warning')
            ].filter(Boolean);

            return `- ${item.name} × ${Number(item.qty) || 1}\n  ${itemDetails.join('\n  ')}`;
        } else {
            return `- ${item.qty}x ${item.name} (${item.colorName})`;
        }
    }).join('\n');
    orderDetails += `\n${t('inquiry_cart_note')}\nSocial Media Einwilligung: ${socialConsent ? 'Ja' : 'Nein'}`;

    // 1. Open native email client synchronously first (to preserve user gesture click context)
    const currentLang = document.documentElement.lang === 'en' ? 'Englisch' : 'Deutsch';
    const offerDocumentReminder = document.documentElement.lang === 'en'
        ? '\n\nReminder for Druckbau: Before the customer accepts a binding offer, send the contract details and AGB and, where a right of withdrawal applies, the withdrawal notice and model withdrawal form in text form on a durable medium (for example, as email attachments).'
        : '\n\nHinweis für Druckbau: Vor Annahme eines verbindlichen Angebots Vertragsinhalt und AGB sowie – sofern ein Widerrufsrecht besteht – Widerrufsbelehrung und Muster-Widerrufsformular in Textform auf einem dauerhaften Datenträger mitsenden (z. B. als E-Mail-Anhänge).';
    let mailtoBody = `Hallo Druckbau Team,\n\nIch möchte ein unverbindliches Angebot anfragen:\nAnfrage-ID: ${orderId}\n\nSprache des Nutzers: ${currentLang}\n\nKundendaten:\nName: ${name}\nAdresse: ${address}\nOrt: ${zip} ${city}\nE-Mail: ${email}\n\nAngefragte Artikel:\n${orderDetails}\n\nDiese Nachricht ist eine unverbindliche Anfrage und noch keine Bestellung.${offerDocumentReminder}`;

    mailtoBody += `\n\nVielen Dank!`;
    const mailtoLink = `mailto:bestellungen.druckbau@gmail.com?subject=${encodeURIComponent(`Angebotsanfrage ${orderId}`)}&body=${encodeURIComponent(mailtoBody)}`;
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // The customer must send the message in their email application.
    showSuccess(t('checkout_prepare_success'));
}






function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DB-${dateStr}-${randomSuffix}`;
}
