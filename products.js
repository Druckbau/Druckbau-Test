// js/products.js
import { products, colors, state, loadReviews } from './store.js';
import { escapeHtml, t } from './utils.js';

function renderProductSafety(product) {
    const legal = window.DRUCKBAU_LEGAL;
    if (!legal) {
        console.error('Product safety information could not load because legal manufacturer data is unavailable.');
    }

    const manufacturerName = legal?.manufacturerName || legal?.companyName || t('gpsr_missing_manufacturer');
    const street = legal?.street || t('gpsr_missing_street');
    const postalCity = [legal?.zip, legal?.city].filter(Boolean).join(' ') || t('gpsr_missing_city');
    const cityLine = legal?.country ? `${postalCity}, ${legal.country}` : postalCity;
    const email = legal?.email || t('gpsr_missing_email');
    const safetyText = t(product.safetyKey || 'product_safety_custom');

    return `
        <details class="product-compliance-info">
            <summary class="product-compliance-summary">${t('gpsr_safety_heading')}</summary>
            <div class="product-compliance-content">
                <p class="product-safety-info">${escapeHtml(safetyText)}</p>
                ${product.id === 'a' ? `<p class="product-classification-note">${t('product_fidget_classification_pending')}</p>` : ''}
                <dl class="product-manufacturer-details">
                    <div><dt>${t('gpsr_product_identification')}</dt><dd>${escapeHtml(product.model || t(product.nameKey))} · ${t('gpsr_article_number')} ${escapeHtml(product.sku || product.id)}</dd></div>
                    <div><dt>${t('gpsr_manufacturer')}</dt><dd>${escapeHtml(manufacturerName)}</dd></div>
                    <div><dt>${t('gpsr_manufacturer_address')}</dt><dd>${street ? `${escapeHtml(street)}, ` : ''}${escapeHtml(cityLine)}</dd></div>
                    <div><dt>${t('gpsr_manufacturer_email')}</dt><dd><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></dd></div>
                </dl>
            </div>
        </details>
    `;
}

export function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const orderedProducts = [...products].sort((a, b) => Number(Boolean(b.isCustom)) - Number(Boolean(a.isCustom)));
    grid.innerHTML = orderedProducts.map(product => {
        const isWishlisted = state.wishlist.includes(product.id);

        if (product.isCustom) {
            return `
            <div class="product-card product-card--custom" id="custom-project-card" data-product-id="${product.id}">
                <button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="${t('product_wishlist_btn')}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="${isWishlisted ? '#ff4757' : 'none'}" viewBox="0 0 24 24" stroke-width="1.5" stroke="${isWishlisted ? '#ff4757' : 'currentColor'}">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
                <div class="custom-card-header">
                    <div class="custom-card-heading">
                        <span class="custom-product-badge">${t('custom_badge')}</span>
                        <div class="product-category">${t('custom_product_category')} · ${t('gpsr_article_number')} ${escapeHtml(product.sku || 'DB-CUS-01')}</div>
                        <h3>${t(product.nameKey)}</h3>
                        <p>${t('product_custom_intro')}</p>
                    </div>
                    <div class="custom-card-meta">
                        <span class="custom-price-tag">${t('custom_price_by_offer')}</span>
                        <span class="custom-delivery-tag">${t('delivery_time_custom')}</span>
                    </div>
                </div>
                <p class="custom-inquiry-note">${t('custom_nonbinding_note')}</p>
                <p class="custom-rights-warning">${t('custom_rights_warning')}</p>
                <p class="custom-withdrawal-note">${t('custom_withdrawal_note')}</p>
                
                <div class="product-options custom-project-form">
                    <p class="custom-required-note" data-i18n="custom_required_note">${t('custom_required_note')}</p>
                    <fieldset class="custom-form-group">
                        <legend>${t('custom_form_project_heading')}</legend>
                    <div class="option-group custom-field">
                        <label for="custom-desc-${product.id}">${t('custom_description_label')} <span aria-hidden="true">*</span></label>
                        <textarea id="custom-desc-${product.id}" class="qty-input" required aria-required="true"
                            aria-describedby="custom-desc-hint-${product.id} custom-desc-error-${product.id}"
                            placeholder="${t('product_custom_desc_placeholder')}" maxlength="2000"></textarea>
                        <small id="custom-desc-hint-${product.id}" class="field-hint">${t('custom_description_hint')}</small>
                        <span class="form-error" id="custom-desc-error-${product.id}" aria-live="polite"></span>
                    </div>
                    <div class="custom-form-row custom-measurement-row">
                        <div class="option-group custom-field">
                            <label for="custom-dimensions-${product.id}">${t('product_order_custom_dimensions')} <span aria-hidden="true">*</span></label>
                            <input type="text" id="custom-dimensions-${product.id}" placeholder="${t('product_custom_dimensions_placeholder')}"
                                class="qty-input" required aria-required="true" aria-describedby="custom-dimensions-error-${product.id}" maxlength="160">
                            <span class="form-error" id="custom-dimensions-error-${product.id}" aria-live="polite"></span>
                        </div>
                        <div class="option-group custom-field">
                            <label for="custom-qty-${product.id}">${t('product_quantity')} <span aria-hidden="true">*</span></label>
                            <input type="number" id="custom-qty-${product.id}" value="1" min="1" step="1" class="qty-input" required aria-required="true"
                                aria-describedby="custom-qty-error-${product.id}">
                            <span class="form-error" id="custom-qty-error-${product.id}" aria-live="polite"></span>
                        </div>
                    </div>
                    <div class="option-group custom-field">
                        <label for="custom-purpose-${product.id}">${t('custom_purpose_label')} <span aria-hidden="true">*</span></label>
                        <select id="custom-purpose-${product.id}" class="qty-input" required aria-required="true" aria-describedby="custom-purpose-error-${product.id}">
                            <option value="">${t('custom_select_placeholder')}</option>
                            <option value="decoration">${t('custom_use_decoration')}</option>
                            <option value="everyday">${t('custom_use_everyday')}</option>
                            <option value="functional">${t('custom_use_functional')}</option>
                            <option value="prototype">${t('custom_use_prototype')}</option>
                            <option value="outdoor">${t('custom_use_outdoor')}</option>
                            <option value="other">${t('custom_use_other')}</option>
                        </select>
                        <span class="form-error" id="custom-purpose-error-${product.id}" aria-live="polite"></span>
                    </div>
                    </fieldset>
                    <fieldset class="custom-form-group">
                        <legend>${t('custom_form_preferences_heading')}</legend>
                    <div class="option-group custom-field">
                        <label for="custom-material-${product.id}">${t('custom_material_label')}</label>
                        <input type="text" id="custom-material-${product.id}" class="qty-input" maxlength="120"
                            placeholder="${t('custom_material_placeholder')}" aria-describedby="custom-material-hint-${product.id}">
                        <small id="custom-material-hint-${product.id}" class="field-hint">${t('custom_material_hint')}</small>
                    </div>
                    <div class="custom-form-row">
                        <div class="option-group custom-field">
                            <label for="custom-date-${product.id}">${t('custom_date_label')}</label>
                            <input type="date" id="custom-date-${product.id}" class="qty-input" aria-describedby="custom-date-hint-${product.id}">
                            <small id="custom-date-hint-${product.id}" class="field-hint">${t('custom_date_hint')}</small>
                        </div>
                        <div class="option-group custom-field">
                            <label for="custom-reference-${product.id}">${t('custom_reference_label')}</label>
                            <input type="url" id="custom-reference-${product.id}" class="qty-input" maxlength="500"
                                placeholder="https://" aria-describedby="custom-reference-hint-${product.id} custom-reference-error-${product.id}">
                            <small id="custom-reference-hint-${product.id}" class="field-hint">${t('custom_reference_hint')}</small>
                            <span class="form-error" id="custom-reference-error-${product.id}" aria-live="polite"></span>
                        </div>
                    </div>
                    </fieldset>
                    <fieldset class="custom-form-group">
                        <legend>${t('custom_form_design_heading')}</legend>
                    <fieldset class="custom-choice-fieldset custom-field">
                        <legend>${t('custom_model_choice_label')} <span aria-hidden="true">*</span></legend>
                        <label class="custom-choice-option"><input type="radio" name="custom-model-${product.id}" value="have-model" aria-describedby="custom-model-error-${product.id}"> ${t('custom_model_have')}</label>
                        <label class="custom-choice-option"><input type="radio" name="custom-model-${product.id}" value="need-design"> ${t('custom_model_need')}</label>
                        <span class="form-error" id="custom-model-error-${product.id}" aria-live="polite"></span>
                    </fieldset>
                    <div class="custom-rights-field custom-field">
                        <label class="custom-choice-option" for="custom-rights-${product.id}">
                            <input type="checkbox" id="custom-rights-${product.id}" aria-required="true" aria-describedby="custom-rights-error-${product.id}">
                            <span>${t('custom_rights_confirmation')}</span>
                        </label>
                        <span class="form-error" id="custom-rights-error-${product.id}" aria-live="polite"></span>
                    </div>
                    </fieldset>
                    <div class="product-controls" style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                         <button type="button" class="add-btn add-custom-btn" data-id="${product.id}" style="flex:1; padding:0.6rem 1rem; font-size:0.9rem; margin:0;">
                            ${t('product_add_cart')}
                        </button>
                    </div>

                    <p class="file-warning-box">${t('product_order_custom_files_warning')}</p>
                </div>
                ${renderProductSafety(product)}
            </div>
            `;
        }

        if (product.available === false) {
            return `
                <div class="product-card product-card--coming-soon" data-product-id="${product.id}">
                    <div class="product-gallery">
                        <div class="main-image-container">
                            <img src="${product.images?.[0] || 'placeholder.jpg'}" alt="${t(product.nameKey)}" class="product-img main-img">
                            <span class="coming-soon-badge">${t('product_coming_soon')}</span>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category || 'Individuell'} · Art.-Nr.: ${product.sku || product.id}</div>
                        <h3>${t(product.nameKey)}</h3>
                        <p class="coming-soon-message">${t('product_coming_soon_message')}</p>
                        ${renderProductSafety(product)}
                    </div>
                </div>
            `;
        }

        return `
        <div class="product-card" data-product-id="${product.id}" style="position: relative;"><button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="${t('product_wishlist_btn')}"><svg xmlns="http://www.w3.org/2000/svg" fill="${isWishlisted ? '#ff4757' : 'none'}" viewBox="0 0 24 24" stroke-width="1.5" stroke="${isWishlisted ? '#ff4757' : 'currentColor'}"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg></button>
            <div class="product-gallery">
                <div class="main-image-container">
                    <div id="tint-layer-${product.id}" class="tint-layer"></div><div class="zoom-icon"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></div>
                    <img src="${product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg'}" alt="${t(product.nameKey)}" class="product-img main-img" id="main-img-${product.id}">
                </div>
                <div class="thumbnail-row">
                    ${(product.images || []).map((img, index) => `
                        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                             data-src="${img}" data-id="${product.id}">
                    `).join('')}
                </div>
            </div>

                <div class="product-info">
                <div class="product-category">${product.category || 'Individuell'} · Art.-Nr.: ${product.sku || product.id}</div>
                <h3>${t(product.nameKey)}</h3>
                ${product.descKey ? `<p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${t(product.descKey)}</p>` : ''}
                <div class="manufacturing-note" style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--success-color); margin-bottom: 0.5rem; font-weight: 500;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${t('product_manufacturing_note')}
                </div>
                <div class="price"><span>${t('price_label')} </span>${product.price.toFixed(2)} € <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light); display: block;">${t('price_hint')} ${t('shipping_hint')}</span></div>
                <div class="delivery-time" style="font-size: 0.78rem; color: var(--text-light); margin-top: 4px; margin-bottom: 0.6rem;">
                    ⏱️ <strong>${t('delivery_time_standard')}</strong>
                </div>
                ${renderProductSafety(product)}
                
                ${product.id === 'a' ? `
                    <div class="klicker-color-options" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <label style="font-size:0.85rem; font-weight:600; min-width:80px; color:var(--text-dark);">Unterteil:</label>
                            <select id="color-base-${product.id}" data-id="${product.id}" class="qty-input color-base-select" style="flex:1; padding:0.4rem; font-size:0.85rem;">
                                ${colors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <label style="font-size:0.85rem; font-weight:600; min-width:80px; color:var(--text-dark);">Keycaps:</label>
                            <select id="color-keycaps-${product.id}" class="qty-input color-keycaps-select" style="flex:1; padding:0.4rem; font-size:0.85rem;">
                                ${colors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="product-controls" style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                        <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input" style="width:55px; padding:0.5rem; flex-shrink:0; font-size:0.9rem;" title="${t('product_quantity')}">
                        <button type="button" class="add-btn add-to-cart-btn" data-id="${product.id}" style="flex:1; padding:0.6rem 0.8rem; font-size:0.85rem; width:auto; border-radius:4px; margin:0;">
                            ${t('product_add_cart')}
                        </button>
                    </div>
                ` : `
                    <div class="product-controls" style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                        <input type="number" id="qty-${product.id}" value="1" min="1" class="qty-input" style="width:55px; padding:0.5rem; flex-shrink:0; font-size:0.9rem;" title="${t('product_quantity')}">
                        <select id="color-${product.id}" data-id="${product.id}" class="qty-input color-select" style="flex:1; padding:0.5rem; font-size:0.85rem;">
                            ${colors.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
                        </select>
                        <button type="button" class="add-btn add-to-cart-btn" data-id="${product.id}" style="flex:1.2; padding:0.6rem 0.8rem; font-size:0.85rem; width:auto; border-radius:4px; margin:0;">
                            ${t('product_add_cart')}
                        </button>
                    </div>

                    <div id="custom-color-wrapper-${product.id}" class="option-group" style="display: none; margin-top:10px;">
                        <label style="color: var(--primary-blue); font-size:0.8rem;">${t('product_custom_color_label')}</label>
                        <input type="text" id="custom-color-input-${product.id}" placeholder="${t('product_custom_color_placeholder')}" class="qty-input" style="padding:0.4rem;">
                        <div class="warning-msg" style="font-size:0.7rem; margin-top:5px;">
                            <strong>${t('product_custom_color_warning_ref')}</strong> ${t('product_custom_color_warning_text')}
                        </div>
                    </div>
                `}
                <div id="cart-animation-${product.id}" style="position: absolute; right: 20px; bottom: 80px; pointer-events: none;"></div>
            </div>
        </div>
    `}).join('');
}


export function updateColorPreview(productId, colorValue) {
    const tintLayer = document.getElementById(`tint-layer-${productId}`);
    const customWrapper = document.getElementById(`custom-color-wrapper-${productId}`);

    if (tintLayer) {
        // Reset class and add new color class
        tintLayer.className = `tint-layer preview-${colorValue}`;
    }

    if (colorValue === 'custom') {
        if (customWrapper) customWrapper.style.display = 'block';
    } else {
        if (customWrapper) customWrapper.style.display = 'none';
    }
}

export function switchGalleryImage(src, thumbElement) {
    if (!thumbElement) return;
    const card = thumbElement.closest('.product-card');
    if (!card) return;

    const mainImg = card.querySelector('.main-img');
    if (mainImg) mainImg.src = src;

    card.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
}

export function getAverageRating(productId) {
    const reviews = loadReviews();
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;

    const sum = productReviews.reduce((acc, r) => acc + parseInt(r.rating), 0);
    return (sum / productReviews.length).toFixed(1);
}

export function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '★';
        } else if (i === fullStars && halfStar) {
            starsHtml += '½';
        } else {
            starsHtml += '☆';
        }
    }
    return starsHtml;
}

export function addPrintTimeBadges() {
    products.forEach(product => {
        if (product.isCustom) return;
        const estimatedVolume = {
            'a': 5,
            'b': 50,
            'c': 150,
            'e': 30
        };
        const volume = estimatedVolume[product.id] || 20;
        product.printTime = Math.ceil(volume * 0.1); // Fake estimation
    });
}
