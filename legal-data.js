window.DRUCKBAU_LEGAL = {
  companyName: 'Philipp Daniel Roggenland',
  ownerName: 'Philipp Daniel Roggenland',
  street: '',
  zip: '44789',
  city: 'Bochum',
  country: 'Deutschland',
  email: 'kontakt.druckbau@gmail.com',
  orderEmail: 'bestellungen.druckbau@gmail.com',
  phone: '+49 155 66799602',
  website: 'https://druckbau.de',
  isSmallBusiness: true, // true = Kleinunternehmer nach § 19 UStG; false = Regelbesteuerung mit MwSt.-Ausweis
  vatId: '',
  lucidNumber: '',
  manufacturerName: 'Philipp Daniel Roggenland',
  googlePrivacyLink: 'https://policies.google.com/privacy?hl=de',
  registrationText: 'Rechtsform: Einzelunternehmen'
};

function applyLegalData() {
  const legal = window.DRUCKBAU_LEGAL || {};
  const isSmallBusiness = legal.isSmallBusiness !== false;

  const vatNotice = isSmallBusiness
    ? 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerstatus).'
    : 'Alle angegebenen Preise verstehen sich einschließlich der gesetzlichen Mehrwertsteuer.';

  const priceTaxHint = isSmallBusiness
    ? 'Gemäß § 19 UStG ohne Ausweis von USt.'
    : 'inkl. gesetzl. MwSt.';

  const vatIdText = legal.vatId
    ? `USt-IdNr. gemäß § 27a UStG: ${legal.vatId}`
    : (isSmallBusiness ? 'Keine Angabe erforderlich (Kleinunternehmerregelung gemäß § 19 UStG).' : '[USt-IdNr. vor Veröffentlichung ergänzen, falls vorhanden]');

  const map = {
    'company-name': legal.companyName || 'Philipp Daniel Roggenland',
    'owner-name': legal.ownerName || '[Vor Veröffentlichung ergänzen]',
    'street': legal.street || '',
    'city-line': `${legal.zip || '[PLZ ergänzen]'} ${legal.city || '[Ort ergänzen]'}, ${legal.country || 'Deutschland'}`,
    'full-address': `${legal.street ? `${legal.street}, ` : ''}${legal.zip || '[PLZ]'} ${legal.city || '[Ort]'}, ${legal.country || 'Deutschland'}`,
    'manufacturer-name': legal.manufacturerName || legal.companyName || 'Philipp Daniel Roggenland',
    'email': legal.email || 'kontakt.druckbau@gmail.com',
    'order-email': legal.orderEmail || 'bestellungen.druckbau@gmail.com',
    'phone': legal.phone || '[Telefonnummer vor Veröffentlichung ergänzen]',
    'website': legal.website || 'https://druckbau.de',
    'vat-id': vatIdText,
    'vat-notice': vatNotice,
    'price-tax-hint': priceTaxHint,
    'lucid': legal.lucidNumber || '[LUCID-Registrierungsnummer vor Veröffentlichung ergänzen]',
    'google-privacy': legal.googlePrivacyLink || 'https://policies.google.com/privacy?hl=de',
    'company-registration': legal.registrationText || 'Rechtsform: Einzelunternehmen'
  };

  document.querySelectorAll('[data-legal]').forEach((element) => {
    const key = element.getAttribute('data-legal');
    if (map[key]) {
      element.textContent = map[key];
    }
  });

  document.querySelectorAll('[data-legal-mailto]').forEach((element) => {
    const key = element.getAttribute('data-legal-mailto');
    if (map[key]) {
      element.href = `mailto:${map[key]}`;
    }
  });

  document.querySelectorAll('[data-legal-tel]').forEach((element) => {
    const key = element.getAttribute('data-legal-tel');
    if (legal.phone) {
      element.href = `tel:${legal.phone.replace(/\s+/g, '')}`;
    } else {
      element.removeAttribute('href');
    }
  });

  document.querySelectorAll('[data-legal-link]').forEach((element) => {
    const key = element.getAttribute('data-legal-link');
    if (key === 'website' && map.website) {
      element.href = map.website;
      element.textContent = map.website;
    }
  });

  const vatBlock = document.getElementById('vat-id-block');
  if (vatBlock) {
    if (legal.vatId) {
      vatBlock.style.display = '';
      vatBlock.textContent = vatIdText;
    } else if (isSmallBusiness) {
      vatBlock.style.display = '';
      vatBlock.textContent = vatIdText;
    } else {
      vatBlock.style.display = 'none';
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', applyLegalData);
} else {
  applyLegalData();
}
