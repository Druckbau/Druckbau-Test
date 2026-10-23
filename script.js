// script.js - Main Application Entry Point
import { loadCartFromStorage, loadWishlistFromStorage } from './js/store.js';
import { renderProducts, addPrintTimeBadges, updateColorPreview, switchGalleryImage } from './js/products.js';
import { renderCart, updateCartIcon, updateWishlistIcon, addToCart, addCustomToCart, toggleWishlist, removeFromCart, renderWishlist, addToCartFromWishlist } from './js/cart.js';
import { checkout, closeCheckoutModal, submitCheckout, nextCheckoutStep, prevCheckoutStep } from './js/checkout.js';
import { setupThemeToggle, setupChat, setupLightbox, setupFAQ, setupNavigation, sendEmail } from './js/ui.js';
import { openReviewModal, openReviewListModal, closeReviewModal, submitReview, initReviews } from './js/reviews.js';
import { initTranslations } from './translations.js';

async function init() {
    initTranslations();

    setupNavigation();
    setupThemeToggle();
    setupChat();
    setupLightbox();
    setupGlobalEventListeners();
    initReviews();
    
    await loadPublicNews();

    if (document.getElementById('products-grid')) {
        loadCartFromStorage();
        loadWishlistFromStorage();
        addPrintTimeBadges();
        renderProducts();
        updateCartIcon();
        setupFAQ();
    }

    window.updateColorPreview = updateColorPreview;
    window.switchGalleryImage = switchGalleryImage;
    window.renderProducts = renderProducts;
    window.renderCart = renderCart;
    window.renderWishlist = renderWishlist;
    window.submitCheckout = submitCheckout;
    window.nextCheckoutStep = nextCheckoutStep;
    window.prevCheckoutStep = prevCheckoutStep;
    window.closeCheckoutModal = closeCheckoutModal;
    window.sendEmail = sendEmail;
    
    document.addEventListener('wishlist-updated', () => {
        renderProducts();
        renderWishlist();
        updateCartIcon();
        updateWishlistIcon();
        setupFAQ();
    });
    
}

async function loadPublicNews() {
    const newsSection = document.getElementById('news');
    const newsText = document.getElementById('news-text');
    const newsDate = document.getElementById('news-date');
    if (!newsSection || !newsText) return;

    const newsList = JSON.parse(localStorage.getItem('druckbau_news_list') || '[]');

    if (newsList && newsList.length > 0) {
        const latestInfo = newsList[0];
        const content = latestInfo.content || latestInfo.text;
        if (content) {
            newsText.innerHTML = content.replace(/\n/g, '<br>');
            if (newsDate) {
                const date = latestInfo.created_at || latestInfo.date;
                newsDate.textContent = date ? new Date(date).toLocaleDateString('de-DE') : '';
            }
        }
    } else {
        newsText.innerHTML = 'Aktuell gibt es keine Neuigkeiten.';
        if (newsDate) {
            newsDate.textContent = '';
        }
    }
}

function setupGlobalEventListeners() {
    document.querySelector('.contact-form')?.addEventListener('submit', sendEmail);

    document.body.addEventListener('click', (e) => {
        const target = e.target;

        if (target instanceof Element && target.closest('#close-checkout')) {
            closeCheckoutModal();
            return;
        }

        if (target.closest('.next-step-btn')) {
            nextCheckoutStep();
            return;
        }

        if (target.closest('.back-step-btn')) {
            prevCheckoutStep();
            return;
        }

        if (target.id === 'final-checkout-btn' || target.closest('#final-checkout-btn')) {
            if (typeof submitCheckout === 'function') {
                submitCheckout();
            }
            return;
        }

        // PRIORITIZE BUTTONS (Wishlist, Add to Cart, etc.)
        if (target.closest('.wishlist-btn')) {
            toggleWishlist(target.closest('.wishlist-btn').dataset.id);
            return;
        }

        if (target.closest('.add-to-cart-btn')) {
            addToCart(target.closest('.add-to-cart-btn').dataset.id);
            return;
        }
        
        if (target.closest('.add-custom-btn')) {
            addCustomToCart(target.closest('.add-custom-btn').dataset.id);
            return;
        }

        if (target.closest('.rate-btn')) {
            const btn = target.closest('.rate-btn');
            openReviewModal(btn.dataset.id, btn.dataset.name);
            return;
        }

        if (target.closest('.view-reviews-btn')) {
            const btn = target.closest('.view-reviews-btn');
            openReviewListModal(btn.dataset.id, btn.dataset.name);
            return;
        }

        if (target.closest('.wishlist-remove-btn')) {
            toggleWishlist(target.closest('.wishlist-remove-btn').dataset.productId);
            return;
        }

        if (target.closest('.wishlist-add-to-cart-btn')) {
            addToCartFromWishlist(target.closest('.wishlist-add-to-cart-btn').dataset.productId);
            return;
        }

        // Cart Actions (Remove Item, Apply/Remove Coupon, Checkout)
        if (target.closest('.remove-btn')) {
            const removeBtn = target.closest('.remove-btn');
            const indexAttr = removeBtn.getAttribute('data-index') || removeBtn.dataset.index;
            const index = parseInt(indexAttr);
            if (!isNaN(index)) {
                removeFromCart(index);
            }
            return;
        }

        if (target.classList.contains('checkout-btn') || target.closest('.checkout-btn')) {
            checkout();
            return;
        }

        // IMAGE GALLERY / LIGHTBOX
        if (target.closest('.main-image-container')) {
            const card = target.closest('.product-card');
            if (card) {
                const id = card.dataset.productId;
                const thumbs = Array.from(card.querySelectorAll('.thumbnail'));
                const imgList = thumbs.map(t => t.getAttribute('data-src') || t.src);
                
                const activeThumb = card.querySelector('.thumbnail.active');
                const startIndex = activeThumb ? thumbs.indexOf(activeThumb) : 0;

                if (window.openLightbox) window.openLightbox(imgList, startIndex);
            }
            return;
        }

        if (target.closest('.thumbnail')) {
            const card = target.closest('.product-card');
            if (card) {
                const thumb = target.closest('.thumbnail');
                const src = thumb.getAttribute('data-src') || thumb.src;
                if (window.switchGalleryImage) window.switchGalleryImage(src, thumb);
            }
            return;
        }

        if (target.closest('.wishlist-remove-btn')) {
            toggleWishlist(target.closest('.wishlist-remove-btn').dataset.productId);
            return;
        }
        
        if (target.closest('.wishlist-add-to-cart-btn')) {
            addToCartFromWishlist(target.closest('.wishlist-add-to-cart-btn').dataset.productId);
            return;
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.matches('.color-select, .color-base-select')) {
            updateColorPreview(e.target.dataset.id, e.target.value);
        }
    });
}

init();
