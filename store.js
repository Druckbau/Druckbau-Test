// js/store.js
export const products = [
    { id: 'a', nameKey: 'catalog_fidget_name', category: 'Spiel & Spaß', price: 3.99, sku: 'DB-KLI-01', model: 'Fidget Klicker V1', images: ['klicker.png'], safetyKey: 'product_safety_fidget', available: false },
    { id: 'b', nameKey: 'catalog_poop_name', category: 'Tiere', price: 14.99, descKey: 'catalog_poop_desc', sku: 'DB-HBS-01', model: 'Hundekotbeutelspender Kompakt', images: ['hundekotbeutelspender.png'], safetyKey: 'product_safety_poop' },
    { id: 'e', nameKey: 'catalog_pen_name', category: 'Büroartikel', price: 6.99, descKey: 'catalog_pen_desc', sku: 'DB-STH-01', model: 'Stifthalter Desk Organizer', images: ['stifthalter.png'], safetyKey: 'product_safety_pen' },
    { id: 'd', nameKey: 'catalog_custom_name', category: 'Individuell', price: 0, sku: 'DB-CUS-01', model: 'Individuelle Sonderanfertigung', safetyKey: 'product_safety_custom', isCustom: true }
];

export const colors = [
    { name: 'Schwarz (PLA)', value: 'black' },
    { name: 'Grau (PLA)', value: 'grey' },
    { name: 'Weiß (PLA)', value: 'white' }
];

export const SHIPPING_COST = 4.90;
export const FREE_SHIPPING_THRESHOLD = 50;

export function getShippingCost(subtotal) {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export const state = {
    cart: [],
    wishlist: []
};

export function saveCartToStorage() {
    localStorage.setItem('druckbau_cart', JSON.stringify(state.cart));
}

export function loadCartFromStorage() {
    const saved = localStorage.getItem('druckbau_cart');
    if (saved) {
        try {
            const savedCart = JSON.parse(saved);
            if (!Array.isArray(savedCart)) throw new TypeError('Saved cart must be an array');
            state.cart = savedCart.filter(item => products.find(product => product.id === item.id)?.available !== false);
            if (state.cart.length !== savedCart.length) saveCartToStorage();
        } catch (e) {
            console.error('Failed to load cart', e);
            state.cart = [];
        }
    }
}

export function loadWishlistFromStorage() {
    const saved = localStorage.getItem('druckbau_wishlist');
    if (saved) {
        try {
            state.wishlist = JSON.parse(saved);
        } catch (e) {
            state.wishlist = [];
        }
    }
}

export function saveWishlistToStorage() {
    localStorage.setItem('druckbau_wishlist', JSON.stringify(state.wishlist));
}

// Helper for safe JSON parsing
export function safeJSONParse(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return fallback;
    }
}

export function loadReviews() {
    try {
        return safeJSONParse('productReviews', {});
    } catch (e) {
        return {};
    }
}

export function saveReview(productId, review) {
    const reviews = loadReviews();
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    reviews[productId].push(review);
    localStorage.setItem('productReviews', JSON.stringify(reviews));
}
