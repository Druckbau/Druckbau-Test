// js/cart.js
import { products, colors, state, saveCartToStorage, saveWishlistToStorage } from './store.js';
import { formatCurrency, showNotification, showWarning, escapeHtml, t, setError, setSuccess } from './utils.js';

let lastAddedIndex = -1;


export function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (product.available === false) {
        showNotification(t('product_coming_soon_message'), 'info');
        return;
    }

    const qtyInput = document.getElementById(`qty-${productId}`);
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;

    if (isNaN(qty) || qty < 1) {
        alert(t('alert_error_qty'));
        return;
    }

    const baseSelect = document.getElementById(`color-base-${productId}`);
    const keycapSelect = document.getElementById(`color-keycaps-${productId}`);

    let colorValue = '';
    let colorName = '';
    let customColor = null;

    if (baseSelect && keycapSelect) {
        const baseColor = baseSelect.options[baseSelect.selectedIndex].text;
        const keycapColor = keycapSelect.options[keycapSelect.selectedIndex].text;
        colorName = `Unterteil: ${baseColor}, Keycaps: ${keycapColor}`;
        colorValue = `base:${baseSelect.value}_keycaps:${keycapSelect.value}`;
    } else {
        const colorSelect = document.getElementById(`color-${productId}`);
        colorValue = colorSelect ? colorSelect.value : 'black';
        colorName = colorSelect ? colorSelect.options[colorSelect.selectedIndex].text : 'Standard';

        if (colorValue === 'custom') {
            const customInput = document.getElementById(`custom-color-input-${productId}`);
            if (customInput && customInput.value.trim() !== '') {
                customColor = customInput.value.trim();
            } else {
                alert("Bitte geben Sie Ihre Wunschfarbe ein.");
                return;
            }
        }
    }

    const finalName = product.name || t(product.nameKey) || product.id;
    const existingItem = state.cart.find(item => 
        item.id === productId && 
        item.color === colorValue && 
        (item.customColor === customColor || (!item.customColor && !customColor))
    );

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        state.cart.push({
            id: product.id,
            name: finalName,
            price: product.price,
            qty: qty,
            color: colorValue,
            colorName: customColor ? `${t('product_custom_color_label')}: ${customColor}` : colorName,
            customColor: customColor,
            isCustom: false
        });
    }

    saveCartToStorage();
    updateCartIcon();
    
    lastAddedIndex = state.cart.indexOf(existingItem || state.cart[state.cart.length - 1]);
    
    if (window.showSection) {
        window.showSection('cart');
        setTimeout(() => {
            const cartItems = document.getElementById('cart-items-container');
            if (cartItems) cartItems.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        renderCart();
    }

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

export function addCustomToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.isCustom) return;

    const descInput = document.getElementById(`custom-desc-${productId}`);
    const dimensionsInput = document.getElementById(`custom-dimensions-${productId}`);
    const desc = descInput ? descInput.value.trim() : '';
    const dimensions = dimensionsInput ? dimensionsInput.value.trim() : '';
    const qtyInput = document.getElementById(`custom-qty-${productId}`);
    const purposeInput = document.getElementById(`custom-purpose-${productId}`);
    const materialInput = document.getElementById(`custom-material-${productId}`);
    const dateInput = document.getElementById(`custom-date-${productId}`);
    const referenceInput = document.getElementById(`custom-reference-${productId}`);
    const rightsInput = document.getElementById(`custom-rights-${productId}`);
    const modelInputs = [...document.querySelectorAll(`input[name="custom-model-${productId}"]`)];
    const qty = qtyInput ? Number(qtyInput.value) : 0;
    let isValid = true;
    let firstInvalid = null;

    const validate = (input, valid, message) => {
        if (!input) return;
        if (!valid) {
            setError(input, message);
            firstInvalid ||= input;
            isValid = false;
        } else {
            setSuccess(input);
        }
    };

    validate(descInput, Boolean(desc), t('custom_error_description'));
    validate(dimensionsInput, Boolean(dimensions), t('custom_error_dimensions'));
    validate(qtyInput, Number.isInteger(qty) && qty >= 1, t('custom_error_quantity'));
    validate(purposeInput, Boolean(purposeInput?.value), t('custom_error_purpose'));

    const reference = referenceInput?.value.trim() || '';
    let validReference = true;
    if (reference) {
        try {
            const parsedReference = new URL(reference);
            validReference = parsedReference.protocol === 'http:' || parsedReference.protocol === 'https:';
        } catch {
            validReference = false;
        }
    }
    validate(referenceInput, validReference, t('custom_error_reference'));

    const selectedModel = modelInputs.find(input => input.checked);
    const modelErrorInput = modelInputs[0];
    validate(modelErrorInput, Boolean(selectedModel), t('custom_error_model'));
    validate(rightsInput, Boolean(rightsInput?.checked), t('custom_error_rights'));

    if (!isValid) {
        showWarning(t('custom_validation_summary'));
        firstInvalid?.focus();
        return;
    }

    const purpose = purposeInput?.value || '';
    const material = materialInput?.value.trim() || '';
    const desiredDate = dateInput?.value || '';

    state.cart.push({
        id: product.id,
        name: product.name || t(product.nameKey),
        price: 0,
        qty: qty,
        isCustom: true,
        customDesc: desc,
        customDimensions: dimensions,
        customPurpose: purpose,
        customMaterial: material,
        customDate: desiredDate,
        customReference: reference,
        customModel: selectedModel?.value || '',
        customRightsConfirmed: true
    });

    [descInput, dimensionsInput, materialInput, dateInput, referenceInput].forEach(input => {
        if (input) input.value = '';
    });
    if (qtyInput) qtyInput.value = '1';
    if (purposeInput) purposeInput.value = '';
    modelInputs.forEach(input => { input.checked = false; });
    if (rightsInput) rightsInput.checked = false;
    document.querySelectorAll(`#custom-project-card .custom-field input, #custom-project-card .custom-field textarea, #custom-project-card .custom-field select`).forEach(input => {
        if (input.classList.contains('error') || input.classList.contains('success')) {
            input.classList.remove('error', 'success');
            input.removeAttribute('aria-invalid');
            const error = input.closest('.custom-field')?.querySelector('.form-error');
            if (error) error.textContent = '';
        }
    });

    saveCartToStorage();
    updateCartIcon();

    lastAddedIndex = state.cart.length - 1;

    if (window.showSection) {
        window.showSection('cart');
        setTimeout(() => {
            const cartItems = document.getElementById('cart-items-container');
            if (cartItems) cartItems.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        renderCart();
    }

    const translatedName = typeof t === 'function' ? t(product.nameKey) : product.name;
    const addedTxt = typeof t === 'function' ? t('alert_success_added') : 'wurde zum Warenkorb hinzugefügt.';
    showNotification(`"${translatedName}" ${addedTxt}`, 'success');
}

export function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartIcon();
    renderCart();
}

export function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    if (!container || !summary) return;

    if (state.cart.length === 0) {
        container.innerHTML = `<p style="text-align:center;">${t('cart_empty')}</p>`;
        summary.style.display = 'none';
        return;
    }

    container.innerHTML = state.cart.map((item, index) => {
        const isNew = index === lastAddedIndex;
        if (isNew) {
            setTimeout(() => { 
                lastAddedIndex = -1; 
                renderCart();
            }, 2000);
        }

        const qty = parseInt(item.qty) || 1;
        const name = item.name || t('cart_item_unknown');

        if (item.isCustom) {
            return `
            <div class="cart-item ${isNew ? 'cart-item-new' : ''}">
                <div class="cart-item-details">
                    <h4>${escapeHtml(name)}</h4>
                    <div class="cart-item-info">
                        ${renderCustomDetails(item)}
                    </div>
                </div>
                <div>
                     <span style="font-weight:bold; color:var(--text-light); margin-right:15px;">${t('cart_price_indiv')}</span>
                     <button type="button" class="remove-btn" data-index="${index}" title="${t('cart_remove')}">
                        ✕
                     </button>
                </div>
            </div>`;
        } else {
            return `
            <div class="cart-item ${isNew ? 'cart-item-new' : ''}">
                <div class="cart-item-details">
                    <h4>${escapeHtml(name)}</h4>
                    <p class="cart-item-info">${escapeHtml(item.colorName || t('product_standard'))} | ${qty}x</p>
                </div>
                <div>
                     <button type="button" class="remove-btn" data-index="${index}" title="${t('cart_remove')}">
                        ✕
                     </button>
                </div>
            </div>`;
        }
    }).join('');

    summary.style.display = 'block';

    summary.innerHTML = `
        <div style="background: var(--accent-blue); padding: 1.2rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(37, 99, 235, 0.2); display: flex; gap: 10px; align-items: flex-start;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p style="font-size: 0.85rem; color: var(--text-dark); margin: 0; line-height: 1.4;">${t('inquiry_cart_note')}</p>
        </div>
        ${state.cart.some(item => item.isCustom) ? `<p class="custom-withdrawal-note">${t('custom_withdrawal_note')}</p>` : ''}
        <button type="button" class="checkout-btn" data-i18n="checkout_title">${t('checkout_title')}</button>
    `;

}

export function renderCustomDetails(item) {
    return getCustomFields(item)
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}<br>`)
        .join('');
}

export function getCustomEmailDetails(item) {
    return getCustomFields(item)
        .map(([label, value]) => `  ${label}: ${value || t('custom_not_provided')}`)
        .join('\n');
}

function getCustomFields(item) {
    return [
        [t('custom_description_label'), item.customDesc],
        [t('product_order_custom_dimensions'), item.customDimensions],
        [t('custom_purpose_label'), item.customPurpose ? t(`custom_use_${item.customPurpose}`) : ''],
        [t('custom_material_label'), item.customMaterial],
        [t('custom_date_label'), item.customDate],
        [t('custom_reference_label'), item.customReference],
        [t('custom_model_choice_label'), item.customModel ? t(`custom_model_${item.customModel === 'have-model' ? 'have' : 'need'}`) : ''],
        [t('custom_rights_confirmation_label'), item.customRightsConfirmed ? t('custom_rights_confirmed') : ''],
    ];
}

export function updateCartIcon() {
    const count = document.getElementById('cart-count');
    if (count) {
        const totalItems = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        count.textContent = totalItems;
    }
}

export function updateWishlistIcon() {
    const count = document.getElementById('wishlist-count');
    if (count) {
        count.textContent = state.wishlist.length;
    }
}

export function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);

    if (index === -1) {
        state.wishlist.push(productId);
        showNotification(`${product ? t(product.nameKey) : productId} zur Wunschliste hinzugefügt!`, 'success');
    } else {
        state.wishlist.splice(index, 1);
        showNotification(`${product ? t(product.nameKey) : productId} von der Wunschliste entfernt.`, 'info');
    }

    saveWishlistToStorage();
    updateWishlistIcon();

    // We defer renderProducts and updateWishlistIcon to main script to avoid circular dependency
    document.dispatchEvent(new CustomEvent('wishlist-updated'));
}

export function renderWishlist() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    if (state.wishlist.length === 0) {
        container.innerHTML = `
            <div class="wishlist-empty">
                <h2>Ihre Wunschliste ist leer</h2>
                <p>Entdecken Sie unsere <a href="#" class="nav-link" data-target="products">Produkte</a> und markieren Sie Ihre Favoriten!</p>
            </div>
        `;
        return;
    }

    const wishlistProducts = state.wishlist.map(id => products.find(p => p.id === id)).filter(p => p);

    container.innerHTML = wishlistProducts.map(product => `
        <div class="cart-item">
            <div class="cart-item-details">
                <h4>${t(product.nameKey)}</h4>
                <p class="cart-item-info">${product.price > 0 ? formatCurrency(product.price) : 'Individueller Preis'}</p>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <button type="button" class="contact-btn wishlist-add-to-cart-btn" data-product-id="${product.id}" ${product.available === false ? 'disabled' : ''} style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                    ${product.available === false ? t('product_coming_soon') : t('product_add_cart')}
                </button>
                <button type="button" class="remove-btn wishlist-remove-btn" data-product-id="${product.id}" title="Entfernen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

export function addToCartFromWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (product.available === false) {
        showNotification(t('product_coming_soon_message'), 'info');
        return;
    }

    if (product.isCustom) {
        showNotification('Bitte konfigurieren Sie die Auftragsarbeit auf der Produktseite', 'info');
        // Triggers section change
        document.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }));
        return;
    }

    addToCart(productId);
}
