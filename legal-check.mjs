import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = {
  impressum: path.join(root, 'impressum.html'),
  datenschutz: path.join(root, 'datenschutz.html'),
  agb: path.join(root, 'agb.html'),
  widerruf: path.join(root, 'widerruf.html'),
  legalData: path.join(root, 'legal-data.js'),
  index: path.join(root, 'index.html'),
  cart: path.join(root, 'js/cart.js'),
  checkout: path.join(root, 'js/checkout.js'),
  products: path.join(root, 'js/products.js'),
  appScript: path.join(root, 'script.js'),
  bundle: path.join(root, 'bundled.js')
};

const fails = [];
for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    fails.push(`${name}: missing file`);
  }
}

const imprint = fs.readFileSync(files.impressum, 'utf8');
if (imprint.includes('Philipp Muster') || imprint.includes('[Musterstraße 12]') || imprint.includes('[DE000000000]')) {
  fails.push('impressum contains fabricated identity or address data');
}
if (!imprint.includes('data-legal="owner-name"') || !imprint.includes('data-legal="city-line"')) {
  fails.push('impressum is missing linked owner/location fields');
}

const legalData = fs.readFileSync(files.legalData, 'utf8');
if (legalData.includes('Max Mustermann') || legalData.includes('Musterstraße 12') || legalData.includes('+49 123 4567890')) {
  fails.push('legal-data contains fabricated owner, address, or phone details');
}
if (!legalData.includes("ownerName: 'Philipp Daniel Roggenland'") || !legalData.includes("street: ''") || !legalData.includes("zip: '44789'") || !legalData.includes("city: 'Bochum'") || !legalData.includes("phone: '+49 155 66799602'")) {
  fails.push('legal-data is missing the updated owner contact information');
}
const addressFiles = [
  files.legalData, files.index, files.impressum, files.datenschutz, files.agb,
  files.widerruf, path.join(root, 'translations.js'), path.join(root, 'js/products.js'),
  files.bundle
];
const removedStreetAddress = `Steinring${String.fromCharCode(32)}121`;
if (addressFiles.some(file => fs.readFileSync(file, 'utf8').includes(removedStreetAddress))) {
  fails.push('the removed street address must not appear in published website sources or bundle');
}

const privacy = fs.readFileSync(files.datenschutz, 'utf8');
if (!privacy.includes('keine Google-Analytics- oder Google-Tag-Manager-Skripte')) {
  fails.push('datenschutz must document that analytics tags are not currently used');
}
if (!privacy.includes('Discord Inc. (USA)') || !privacy.includes('Konto- und Profilangaben, Nachrichteninhalte') || !privacy.includes('Nutzung von Discord ist freiwillig')) {
  fails.push('datenschutz must explain Discord data processing and that its use is optional');
}
if (!privacy.includes('GitHub Pages') || !privacy.includes('Art. 6 Abs. 1 lit. f DSGVO') || !privacy.includes('keine einheitliche feste Frist') || !privacy.includes('EU-U.S. Data Privacy Framework (DPF)')) {
  fails.push('datenschutz must explain GitHub hosting, legal basis, log retention limits, and DPF transfer basis');
}
if (privacy.includes('muss der Anbieter anhand der konkret eingesetzten Funktionen prüfen') || privacy.includes('druckbau_coupons')) {
  fails.push('privacy notice must not contain internal storage assessment notes or obsolete coupon storage');
}

const indexHtml = fs.readFileSync(files.index, 'utf8');
if (!indexHtml.includes('Anfrage per E-Mail senden')) {
  fails.push('index does not identify the final action as an email inquiry');
}
if (indexHtml.includes('Zahlungspflichtig bestellen') || indexHtml.includes('Kostenpflichtig bestellen')) {
  fails.push('index still presents the inquiry as a payment-required order');
}

const checkoutJs = fs.readFileSync(files.checkout, 'utf8');
if (!checkoutJs.includes('bestellungen.druckbau@gmail.com')) {
  fails.push('checkout does not send order emails to bestellungen.druckbau@gmail.com');
}
if (!checkoutJs.includes('unverbindliche Anfrage')) {
  fails.push('checkout does not clearly describe its non-binding inquiry flow');
}
if (!checkoutJs.includes('Widerrufsbelehrung und Muster-Widerrufsformular in Textform auf einem dauerhaften Datenträger')) {
  fails.push('checkout inquiry email must remind the seller to send withdrawal documents with the offer');
}
const appScript = fs.readFileSync(files.appScript, 'utf8');
if (!appScript.includes("target.closest('#close-checkout')") || !appScript.includes('closeCheckoutModal();')) {
  fails.push('checkout close button must invoke the modal close handler');
}

if (indexHtml.includes(`Originalentwürfe der Druckbau ${'Manufaktur'}`) || indexHtml.includes('echte Originalwerkstücke')) {
  fails.push('index must not make unverified claims about design ownership or product photos');
}
if (indexHtml.includes('Beispiele aus der Werkstatt') ||
    indexHtml.includes('vase_1.jpg') || indexHtml.includes('vase_2.jpg') ||
    indexHtml.includes('hund_1.jpg') || indexHtml.includes('Technisches Bauteil')) {
  fails.push('custom workshop examples and their images must be removed from the homepage');
}
if (!indexHtml.includes('Modelle ohne nachweisbare kommerzielle Nutzungsrechte werden nicht angeboten')) {
  fails.push('index must state the commercial model licensing policy');
}
if (!indexHtml.includes('checkout_documents_note') || !indexHtml.includes('dauerhaften Datenträger') || !indexHtml.includes('Muster-Widerrufsformular')) {
  fails.push('checkout must explain when contract and withdrawal documents are sent');
}
if (!indexHtml.includes('href="datenschutz.html" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>')) {
  fails.push('checkout must link to the privacy notice before the inquiry is submitted');
}
if (!fs.readFileSync(path.join(root, 'translations.js'), 'utf8').includes('checkout_documents_note: "The next step prepares a non-binding inquiry')) {
  fails.push('checkout legal-document notice must be available in English too');
}

const agb = fs.readFileSync(files.agb, 'utf8');
if (!agb.includes('Widerrufsbelehrung und das Muster-Widerrufsformular senden wir') || !agb.includes('dauerhaften Datenträger')) {
  fails.push('AGB must state that contract and withdrawal documents are sent on a durable medium');
}
if (!agb.includes('Ein Vertrag kommt ausschließlich zustande, wenn Sie dieses Angebot innerhalb der Annahmefrist in Textform') || agb.includes('oder wir Ihre Bestellung ausdrücklich bestätigen')) {
  fails.push('AGB must describe one unambiguous contract-formation path for customer inquiries');
}
if (!agb.includes('Kennzeichnungen am Produkt, an der Verpackung') || !agb.includes('dokumentierte Risikobewertung') || !agb.includes('Produkte, für die die erforderliche Bewertung oder Kennzeichnung noch aussteht, dürfen nicht bereitgestellt werden')) {
  fails.push('AGB must distinguish online GPSR information from physical product labeling and documented risk assessment');
}

const translations = fs.readFileSync(path.join(root, 'translations.js'), 'utf8');
const bundle = fs.readFileSync(files.bundle, 'utf8');
if (bundle.includes('GEMINI_API_KEY') || bundle.includes('generativelanguage.googleapis.com')) {
  fails.push('bundle contains an external AI integration that transmits chat messages');
}
if (bundle.includes('submitCheckoutFallback') || bundle.includes('submitNewsletterFallback')) {
  fails.push('bundle contains the obsolete checkout/newsletter fallback');
}
if (!bundle.includes('product-manufacturer-details') || !bundle.includes('gpsr_manufacturer_address') || !bundle.includes('gpsr_manufacturer_email')) {
  fails.push('product bundle is missing per-product GPSR manufacturer contact details');
}
if (!bundle.includes('<details class="product-compliance-info">') || !bundle.includes('<summary class="product-compliance-summary">')) {
  fails.push('product safety and manufacturer details must be available in expandable product disclosures');
}
if (bundle.includes('dbadmin') || bundle.includes('SUPABASE_URL') || bundle.includes('supabase.co') || bundle.includes('signInWithPassword')) {
  fails.push('public bundle must not contain admin password checks or Supabase database/auth code');
}
if ((bundle.match(/renderProductSafety\(product\)/g) || []).length < 3) {
  fails.push('product safety details are not rendered across custom, coming-soon, and standard product cards');
}
const productsSource = fs.readFileSync(files.products, 'utf8');
const cartSource = fs.readFileSync(files.cart, 'utf8');
const checkoutSource = fs.readFileSync(files.checkout, 'utf8');
if ((indexHtml.match(/id="custom"/g) || []).length !== 1 ||
    !productsSource.includes('id="custom-project-card"') ||
    !indexHtml.includes('data-scroll-to="custom-project-card"')) {
  fails.push('custom project section must be present once and its calls to action must target the configuration card');
}
for (const key of [
  'custom_description_label', 'custom_error_description', 'custom_use_decoration',
  'custom_model_have', 'custom_rights_confirmation', 'custom_withdrawal_note',
  'faq_acc_q8', 'faq_acc_q9', 'faq_acc_q10'
]) {
  if (!translations.includes(`${key}:`) || !bundle.includes(`${key}:`)) {
    fails.push(`custom inquiry feature is missing the translated key "${key}"`);
  }
}
if (!productsSource.includes('id="custom-purpose-') ||
    !productsSource.includes('id="custom-rights-') ||
    !productsSource.includes('aria-describedby="custom-desc-hint-')) {
  fails.push('custom inquiry form is missing required purpose/rights fields or accessible field descriptions');
}
if (!productsSource.includes('custom-card-header') ||
    !productsSource.includes("t('custom_nonbinding_note')") ||
    !translations.includes('custom_nonbinding_note:') ||
    !bundle.includes('custom_nonbinding_note:')) {
  fails.push('custom work card is missing its clear inquiry summary and translated header');
}
for (const key of [
  'custom_form_project_heading',
  'custom_form_preferences_heading',
  'custom_form_design_heading'
]) {
  if (!productsSource.includes(`t('${key}')`) ||
      !translations.includes(`${key}:`) || !bundle.includes(`${key}:`)) {
    fails.push(`custom inquiry form is missing its translated section "${key}"`);
  }
}
for (const field of [
  'customDesc', 'customDimensions', 'customPurpose', 'customMaterial',
  'customDate', 'customReference', 'customModel', 'customRightsConfirmed'
]) {
  if (!cartSource.includes(`item.${field}`)) {
    fails.push(`custom inquiry data is missing "${field}" from the shared detail mapping`);
  }
}
if (!checkoutSource.includes('getCustomEmailDetails(item)') ||
    !checkoutSource.includes('item.qty') ||
    !cartSource.includes('custom_not_provided')) {
  fails.push('custom inquiry email must include all project fields and the requested quantity');
}
if (!bundle.includes('product_fidget_classification_pending') || !bundle.includes('product_safety_fidget')) {
  fails.push('fidget clicker must show its pending toy classification and relevant small-parts warning');
}

const withdrawal = fs.readFileSync(files.widerruf, 'utf8');
if (!withdrawal.includes('Über diese Website können Sie eine unverbindliche Angebotsanfrage senden. Dadurch kommt noch kein Vertrag zustande.') ||
    !withdrawal.includes('Ein Vertrag kommt erst zustande, wenn Sie ein individuelles Angebot von uns gesondert in Textform')) {
  fails.push('withdrawal page must explain that the website only accepts non-binding inquiries and the contract is accepted separately');
}
if (!withdrawal.includes('Zur Wahrung der Widerrufsfrist reicht es aus')) {
  fails.push('withdrawal notice is missing the dispatch-in-time rule');
}
if (!withdrawal.includes('ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten')) {
  fails.push('withdrawal notice has an incorrect return deadline');
}
if (!withdrawal.includes('nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung')) {
  fails.push('withdrawal notice does not limit compensation for loss in value to unnecessary handling');
}
if (withdrawal.includes('Die Rücksendefrist beträgt 14 Tage ab dem Tag, an dem Sie die Ware erhalten haben')) {
  fails.push('withdrawal notice still starts the return period on receipt of the goods');
}
if (withdrawal.includes('§ 356a') || withdrawal.includes('Widerrufsfunktion')) {
  fails.push('withdrawal notice must not contain internal compliance guidance about the online withdrawal function');
}
if (withdrawal.includes('Muster gemäß Anlage 1') ||
    !withdrawal.includes('Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.') ||
    !withdrawal.includes('Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.') ||
    !withdrawal.includes('<h2>Gesonderter Hinweis zu individuell angefertigten Waren</h2>')) {
  fails.push('withdrawal notice must not claim an unverified exact model match and must separate the custom-goods exception');
}

if (!indexHtml.includes('ca. 8–12 Werktage') || !indexHtml.includes('kann je nach Produkt, Auftragslage und Versand abweichen') || !indexHtml.includes('vor einer Zahlung')) {
  fails.push('FAQ must give the 8–12 business day estimate, possible variation, and pre-payment notice');
}
if (!translations.includes('delivery_time_standard: "Voraussichtliche Lieferzeit: 8–12 Werktage') || !translations.includes('delivery_time_custom: "Voraussichtliche Lieferzeit: 8–12 Werktage') ||
    translations.includes('delivery_time_standard: "Lieferzeit: ca. 8–12 Werktage; kann abweichen') ||
    translations.includes('delivery_time_custom: "Lieferzeit: ca. 8–12 Werktage; kann abweichen')) {
  fails.push('standard and custom product cards must show the 8–12 business day estimate without vague variation wording');
}
if (!translations.includes('chat_reply_lieferzeit_response: "Als Orientierung rechnen wir mit 8–12 Werktagen')) {
  fails.push('chat delivery response must match the published delivery estimate');
}
if (!translations.includes('Ab 50,00 € Bestellwert ist der Versand kostenfrei') || translations.includes('Warenwert nach Rabatt')) {
  fails.push('FAQ shipping threshold must match the shipping page wording');
}
if (!indexHtml.includes('checkout_delivery_note')) {
  fails.push('checkout must display the delivery estimate and pre-payment notice');
}
for (const documentPath of [files.impressum, files.agb, path.join(root, 'versand.html')]) {
  const documentText = fs.readFileSync(documentPath, 'utf8');
  if (documentText.includes('[Preis- und Umsatzsteuerhinweis') || documentText.includes('[Umsatzsteuerhinweis')) {
    fails.push(`${path.basename(documentPath)} must contain the actual VAT notice as a no-JavaScript fallback`);
  }
}
if (!fs.readFileSync(files.impressum, 'utf8').includes('data-legal="manufacturer-name">Philipp Daniel Roggenland</span>')) {
  fails.push('impressum must contain the actual manufacturer name without JavaScript');
}
if (!indexHtml.includes('Hersteller: Philipp Daniel Roggenland, 44789 Bochum, Deutschland')) {
  fails.push('no-JavaScript product catalog notice must show actual manufacturer and address details');
}
const accessibility = fs.readFileSync(path.join(root, 'barrierefreiheit.html'), 'utf8');
if (!accessibility.includes('§ 3 Abs. 3 BFSG') || accessibility.includes('§ 2 Abs. 3 BFSG') || accessibility.includes('3D-Kalkulator')) {
  fails.push('accessibility statement must cite the micro-enterprise exemption correctly and avoid obsolete features');
}
if (accessibility.includes('Farbwähler')) {
  fails.push('accessibility statement must not describe a non-existent color picker');
}
const store = fs.readFileSync(path.join(root, 'js/store.js'), 'utf8');
if (!store.includes("id: 'a'") || !store.includes("available: false")) {
  fails.push('fidget clicker must remain unavailable pending safety classification');
}
const productJs = fs.readFileSync(path.join(root, 'js/products.js'), 'utf8');
if (!productJs.includes("${t('price_label')}") || !productJs.includes("${t('price_hint')} ${t('shipping_hint')}")) {
  fails.push('standard product prices must show the price label, small-business VAT notice, and nearby shipping-cost link');
}
if (!translations.includes('price_hint: "Gemäß § 19 UStG ohne Ausweis von USt."') || !translations.includes('shipping_hint: "zzgl. <a href=')) {
  fails.push('German price translations must clarify VAT status and additional shipping costs');
}
for (const documentPath of [files.agb, path.join(root, 'versand.html')]) {
  const documentText = fs.readFileSync(documentPath, 'utf8');
  if (!documentText.includes('ca. 8–12 Werktage') || !documentText.includes('vor einer Zahlung')) {
    fails.push(`${path.basename(documentPath)} must describe the delivery estimate and notify customers before payment`);
  }
}
if (!fs.readFileSync(files.agb, 'utf8').includes('Die konkrete Lieferfrist und ihr Beginn werden im individuellen Angebot vor dessen Annahme und vor einer Zahlung ausdrücklich genannt')) {
  fails.push('AGB must require the concrete delivery period and its start to be stated in the offer before acceptance');
}

if (fails.length > 0) {
  console.error('Legal checks failed:');
  for (const fail of fails) console.error('-', fail);
  process.exit(1);
}

console.log('Legal checks passed.');
