import { escapeHtml, showNotification, t, showSuccess, showWarning, showError } from './utils.js';

let currentGallery = [];
let currentImgIndex = 0;

export function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('druckbau_theme', newTheme);

        updateThemeIcon(newTheme);
    });

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('druckbau_theme');
    
    let initialTheme = 'light';
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (systemPrefersDark.matches) {
        initialTheme = 'dark';
    }

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    systemPrefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('druckbau_theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (!sunIcon || !moonIcon) return;

    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

export function setupChat() {
    const closeBtn = document.querySelector('.chat-close-btn');
    const chatWindow = document.getElementById('chat-window');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (chatWindow) chatWindow.style.display = 'none';
        });
    }

    window.toggleChat = () => {
        if (chatWindow) {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        }
    };

    const input = document.getElementById('chat-input');
    const sendButton = document.querySelector('.chat-send-btn');
    const sendMessage = () => {
        const text = input?.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        input.value = '';
        appendMessage(getBotResponse(text), 'bot');
    };

    sendButton?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') sendMessage();
    });

    document.querySelectorAll('.quick-reply-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic || button.textContent || '';
            appendMessage(topic, 'user');
            appendMessage(getBotResponse(topic), 'bot');
        });
    });
}

function appendMessage(text, sender) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `
        ${sender === 'bot' ? '<div class="chat-avatar">🤖</div>' : ''}
        <div class="chat-bubble">${escapeHtml(text)}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(text) {
    const t = text.toLowerCase();

    if (t.includes('discord') || t.includes('hilfe') || t.includes('community') || t.includes('server')) {
        return 'Für Kontakt nutzen Sie bitte die E-Mail-Adresse im Kontaktbereich. Externe Community-Angebote können über die dort verlinkten Seiten geöffnet werden.';
    }
    if (t.includes('lieferzeit') || t.includes('dauer') || t.includes('wann') || t.includes('versandzeit') || t.includes('lieferung') || t.includes('tage') || t.includes('werktage')) {
        return 'Als Richtwert beträgt die Lieferzeit ca. 8–12 Werktage. Sie kann je nach Produkt und Auslastung abweichen; die voraussichtliche Lieferzeit teilen wir im Angebot vor einer Zahlung mit.';
    }
    if (t.includes('versand') || t.includes('porto') || t.includes('kostenlos') || t.includes('frei')) {
        return 'Die Versandkosten und ein möglicher kostenfreier Versand werden im Warenkorb für die vorläufige Anfrage angezeigt. Details stehen auf der Versandseite.';
    }
    if (t.includes('preis') || t.includes('kosten') || t.includes('rabatt') || t.includes('gutschein') || t.includes('code') || t.includes('angebot')) {
        return 'Die angezeigten Preise finden Sie im Katalog. Sonderanfertigungen werden erst nach Prüfung Ihrer Anfrage individuell angeboten.';
    }
    if (t.includes('material') || t.includes('pla') || t.includes('petg') || t.includes('tpu') || t.includes('farbe') || t.includes('farben')) {
        return 'Verfügbare Materialien, Farben und Eigenschaften hängen vom jeweiligen Produkt ab. Bitte prüfen Sie die Produktinformationen oder fragen Sie vorab nach.';
    }
    if (t.includes('sonderanfertigung') || t.includes('custom') || t.includes('eigenes') || t.includes('datei') || t.includes('upload') || t.includes('stl') || t.includes('auftrag')) {
        return 'Für Sonderanfertigungen können Sie im Katalog eine unverbindliche Angebotsanfrage vorbereiten. Dateien müssen Sie anschließend selbst an die E-Mail anhängen. Sie müssen die erforderlichen Nutzungsrechte an eigenen Dateien besitzen.';
    }
    if (t.includes('klicker') || t.includes('fidget') || t.includes('keycap') || t.includes('tastenkappe') || t.includes('unterteil')) {
        return 'Bitte beachten Sie die produktspezifischen Sicherheits- und Altersinformationen. Diese müssen vor dem Kauf im Produktangebot ergänzt werden.';
    }
    if (t.includes('widerruf') || t.includes('rückgabe') || t.includes('stornieren') || t.includes('umtausch')) {
        return 'Bitte beachten Sie die Widerrufsbelehrung. Für Sonderanfertigungen kann eine gesetzliche Ausnahme gelten; Mängelrechte bleiben davon unberührt.';
    }
    if (t.includes('zahlung') || t.includes('bezahlen') || t.includes('paypal') || t.includes('überweisung')) {
        return 'Der Checkout bereitet nur eine unverbindliche Angebotsanfrage vor. Zahlungsart und Zahlungsdetails werden erst im konkreten Angebot genannt.';
    }
    if (t.includes('kontakt') || t.includes('email') || t.includes('e-mail')) {
        return 'Sie erreichen Druckbau per E-Mail. Die Kontaktadresse finden Sie im Kontaktbereich der Website.';
    }

    return 'Vielen Dank für Ihre Nachricht. Bitte prüfen Sie auch die FAQ oder senden Sie eine E-Mail über den Kontaktbereich.';
}

export function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeButton = lightbox?.querySelector('.modal-close');
    lightbox?.addEventListener('click', (event) => {
        if (event.target === lightbox) window.closeLightbox?.();
    });
    closeButton?.addEventListener('click', () => window.closeLightbox?.());

    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.classList.toggle('zoomed');
        });
    }

    window.openLightbox = (imgList, startIndex = 0) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightbox || !lightboxImg) return;

        currentGallery = Array.isArray(imgList) ? imgList : [imgList];
        currentImgIndex = startIndex;

        if (lightboxImg) lightboxImg.classList.remove('zoomed');
        updateLightboxImage();
        lightbox.classList.add('show');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) lightboxImg.classList.remove('zoomed');
        if (lightbox) {
            lightbox.classList.remove('show');
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    const nextBtn = document.getElementById('next-img');
    const prevBtn = document.getElementById('prev-img');

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex + 1) % currentGallery.length;
            updateLightboxImage();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex - 1 + currentGallery.length) % currentGallery.length;
            updateLightboxImage();
        });
    }

    function updateLightboxImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) {
            lightboxImg.classList.remove('zoomed');
            lightboxImg.src = currentGallery[currentImgIndex];
        }
        
        const nextBtn = document.getElementById('next-img');
        const prevBtn = document.getElementById('prev-img');
        if (nextBtn && prevBtn) {
            const isSingle = currentGallery.length <= 1;
            nextBtn.style.display = isSingle ? 'none' : 'block';
            prevBtn.style.display = isSingle ? 'none' : 'block';
        }
    }
}

export function setupFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('.faq-question');
        const faqAnswer = item.querySelector('.faq-answer');
        
        if (button && faqAnswer) {
            item.addEventListener('mouseenter', () => {
                item.classList.add('active');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            });
            item.addEventListener('mouseleave', () => {
                item.classList.remove('active');
                faqAnswer.style.maxHeight = null;
            });
            // Fallback for mobile/click
            button.addEventListener('click', () => {
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
                } else {
                    faqAnswer.style.maxHeight = null;
                }
            });
        }
    });
}

export function setupNavigation() {
    document.body.addEventListener('click', (e) => {
        const link = e.target instanceof Element ? e.target.closest('[data-target]') : null;
        if (!link) return;
        const targetId = link.getAttribute('data-target');
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) {
            console.error(`Navigation target "${targetId}" was not found.`);
            return;
        }

        e.preventDefault();
        const targetHash = `#${encodeURIComponent(targetId)}`;
        if (window.location.hash !== targetHash) {
            window.history.pushState(null, '', targetHash);
        }
        showSection(targetId);
        const scrollTargetId = link.getAttribute('data-scroll-to');
        if (scrollTargetId) {
            window.setTimeout(() => {
                document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    window.addEventListener('hashchange', () => {
        const targetId = decodeURIComponent(window.location.hash.slice(1));
        if (targetId && document.getElementById(targetId)) showSection(targetId);
    });

    const initialTarget = decodeURIComponent(window.location.hash.slice(1));
    if (initialTarget && document.getElementById(initialTarget)) {
        showSection(initialTarget);
    }

    window.showSection = showSection;
}

export function showSection(id) {
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const target = document.getElementById(id);
    if (target) {
        target.style.setProperty('display', (id === 'home' ? 'flex' : 'block'), 'important');
        setTimeout(() => target.classList.add('active'), 10);

        // Update nav links active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === id) {
                link.classList.add('active');
            }
        });

        // Render dynamic views on navigation
        if (id === 'cart' && typeof window.renderCart === 'function') window.renderCart();
        if (id === 'wishlist' && typeof window.renderWishlist === 'function') window.renderWishlist();
    }
}

export async function sendEmail(event) {
    if (event) event.preventDefault();

    // Honeypot check
    const hp = document.getElementById('hp_name')?.value || '';
    if (hp) {
        console.warn("Spam detected via honeypot.");
        return;
    }

    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';

    if (name.trim().length < 2) {
        showWarning("Bitte geben Sie Ihren Namen ein (min. 2 Zeichen).");
        return;
    }

    if (!email.includes('@') || email.length < 5) {
        showWarning("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return;
    }

    if (message.trim().length < 10) {
        showWarning("Bitte geben Sie eine Nachricht ein (min. 10 Zeichen).");
        return;
    }

    // Priority keyword analysis
    const urgentKeywords = [
        'dringend', 'sofort', 'defekt', 'kaputt', 'beschwerde', 'problem', 'hilfe', 'eilig', 'wichtig', 'notfall',
        'reklamation', 'rückerstattung', 'stornierung', 'frist', 'deadline', 'fehler', 'falsch', 'nicht erhalten',
        'vermisst', 'beschädigt', 'kaput', 'geld zurück', 'schaden', 'anzeige', 'mahnung'
    ];
    const mediumKeywords = ['frage', 'bestellung', 'status', 'wann', 'angebot', 'termin', 'lieferzeit', 'versand'];

    let prioritySubject = "Anfrage über Webseite";
    const lowerMsg = message.toLowerCase();
    const isUrgent = urgentKeywords.some(keyword => lowerMsg.includes(keyword));
    const isMedium = !isUrgent && mediumKeywords.some(keyword => lowerMsg.includes(keyword));

    if (isUrgent) {
        prioritySubject = "[HOHE PRIORITÄT] " + prioritySubject;
    } else if (isMedium) {
        prioritySubject = "[MITTLERE PRIORITÄT] " + prioritySubject;
    }

    // Generate reference ID
    const inquiryId = `DB-REQ-${Date.now().toString().slice(-6)}`;

    // 1. Open native email client synchronously first
    const body = `Hallo Druckbau Team,\n\nIch habe eine Anfrage:\nReferenz: ${inquiryId}\n\nKundendaten:\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}\n\nVielen Dank!`;
    const mailtoLink = `mailto:kontakt.druckbau@gmail.com?subject=${encodeURIComponent(prioritySubject)}&body=${encodeURIComponent(body)}`;
    
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Mailto only prepares a draft; the user sends it from their email application.
    showSuccess("Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht ab!");
    const form = document.querySelector('.contact-form');
    if (form) form.reset();
}
