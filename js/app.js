/**
 * GreenHaven Eco-Retreat - Fullstack Client Script
 * Author: Gangotri Kompalwar
 * Date: 2026-07-15
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialization of modules
  initTheme();
  initNavbar();
  initTypewriter();
  initPackagesFilter();
  initBookingSimulator();
  initGalleryLightbox();
  initReviewsCarousel();
  initFaqAccordion();
  initContactForm();
  initVoiceGuide();
  initScrollReveal();
  initAuth();
  initWeather();
  initPayment();
});

/* ==========================================================================
   1. Theme Switcher Module (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  applyTheme(initialTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

/* ==========================================================================
   2. Sticky Navbar, Scroll Spy & Mobile Menu
   ========================================================================== */
function initNavbar() {
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  const navItems = navLinks.querySelectorAll('a');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    scrollSpy();
  });
  
  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      hamburgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
  
  const sections = document.querySelectorAll('section[id]');
  
  function scrollSpy() {
    const scrollPos = window.scrollY + 120;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   3. Typewriter Headline Animation
   ========================================================================== */
function initTypewriter() {
  const textElement = document.getElementById('typing-text');
  const phrases = [
    "Welcome to GreenHaven Eco-Retreat!",
    "Experience forest trekking & boating outings.",
    "Book pristine luxury cottage accommodations.",
    "Create beautiful memories with your family!"
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;
  
  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      textElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 30;
    } else {
      textElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500;
    }
    
    setTimeout(type, typingSpeed);
  }
  
  setTimeout(type, 1000);
}

/* ==========================================================================
   4. Packages Category Filter
   ========================================================================== */
function initPackagesFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const packageCards = document.querySelectorAll('.package-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      packageCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
          ], { duration: 300, easing: 'ease-out' });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. Interactive Booking Simulator & Calculator (Fullstack Integrated)
   ========================================================================== */
function initBookingSimulator() {
  const form = document.getElementById('booking-form');
  const packageSelect = document.getElementById('booking-package');
  const adultsInput = document.getElementById('booking-adults');
  const childrenInput = document.getElementById('booking-children');
  const dateInput = document.getElementById('booking-date');
  
  const chkBonfire = document.getElementById('chk-bonfire');
  const chkGuide = document.getElementById('chk-guide');
  const chkBuffet = document.getElementById('chk-buffet');
  const addonItems = document.querySelectorAll('.addon-item');
  
  const summaryPackage = document.getElementById('summary-package');
  const summaryGuests = document.getElementById('summary-guests');
  const summaryAddons = document.getElementById('summary-addons');
  const summaryTax = document.getElementById('summary-tax');
  const summaryTotal = document.getElementById('summary-total');
  
  const modalOverlay = document.getElementById('booking-modal-overlay');
  const modalClose = document.getElementById('booking-modal-close');
  const receiptContainer = document.getElementById('booking-receipt');
  const btnPrint = document.getElementById('btn-print-receipt');
  const btnDismiss = document.getElementById('btn-dismiss-receipt');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Element variables for AI Dynamic Pricing and Recommender
  const aiPricingIndicator = document.getElementById('ai-pricing-indicator');
  const aiPricingExplanation = document.getElementById('ai-pricing-explanation');
  const aiPricingConfidence = document.getElementById('ai-pricing-confidence');
  const aiPricingAdjustment = document.getElementById('ai-pricing-adjustment');
  
  const aiRecBox = document.getElementById('ai-recommendations-box');
  const aiRecList = document.getElementById('ai-recommendations-list');

  // Set default check-in date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];
  dateInput.min = tomorrow.toISOString().split('T')[0];
  
  addonItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      item.classList.toggle('selected', checkbox.checked);
      calculateTotal();
    });
  });
  
  packageSelect.addEventListener('change', calculateTotal);
  adultsInput.addEventListener('input', calculateTotal);
  childrenInput.addEventListener('input', calculateTotal);
  dateInput.addEventListener('change', calculateTotal);
  
  function calculateTotal() {
    const packageCostPerGuest = parseFloat(packageSelect.value);
    const adultsCount = parseInt(adultsInput.value) || 0;
    const childrenCount = parseInt(childrenInput.value) || 0;
    
    const packageTotal = (packageCostPerGuest * adultsCount) + (packageCostPerGuest * 0.5 * childrenCount);
    
    let addonTotal = 0;
    if (chkBonfire.checked) addonTotal += 150;
    if (chkGuide.checked) addonTotal += 300;
    if (chkBuffet.checked) {
      addonTotal += 250 * (adultsCount + childrenCount);
    }
    
    const subtotal = packageTotal + addonTotal;
    
    // ==========================================================
    // AI Dynamic Pricing Regressor Simulator
    // ==========================================================
    let dynamicFactor = 0.0;
    let explanationParts = [];
    
    if (dateInput.value) {
      const selectedDate = new Date(dateInput.value);
      const month = selectedDate.getMonth(); // 0 = Jan, 5 = June
      const day = selectedDate.getDay();     // 0 = Sun, 5 = Fri, 6 = Sat
      
      // Indian seasonality dynamic factors
      if (month >= 5 && month <= 8) { // Monsoon season (June - Sept)
        dynamicFactor -= 0.15;
        explanationParts.push("Monsoon Off-Peak Discount (-15%)");
      } else if (month === 10 || month === 11 || month === 0) { // Winter peak (Nov, Dec, Jan)
        dynamicFactor += 0.12;
        explanationParts.push("Winter Peak Demand surcharge (+12%)");
      } else {
        explanationParts.push("Standard seasonal demand active");
      }
      
      // Weekend demand surge factor (Friday, Saturday, Sunday)
      if (day === 0 || day === 5 || day === 6) {
        dynamicFactor += 0.05;
        explanationParts.push("Weekend surcharge (+5%)");
      }
    }
    
    const finalSubtotal = subtotal * (1 + dynamicFactor);
    const taxRate = 0.05;
    const taxTotal = finalSubtotal * taxRate;
    const grandTotal = finalSubtotal + taxTotal;
    
    // Update pricing AI indicator UI
    const adjustmentPct = Math.round(dynamicFactor * 100);
    const adjustmentSign = adjustmentPct >= 0 ? "+" : "";
    aiPricingAdjustment.textContent = `${adjustmentSign}${adjustmentPct}%`;
    aiPricingExplanation.textContent = explanationParts.join(" + ");
    
    const mockConfidence = 93 + (dateInput.value ? (new Date(dateInput.value).getDate() % 5) : 2);
    aiPricingConfidence.textContent = `${mockConfidence}%`;
    
    // Update labels
    summaryPackage.textContent = `₹${packageTotal.toLocaleString('en-IN', {maximumFractionDigits:2})}`;
    summaryGuests.textContent = `${adultsCount} Adult${adultsCount > 1 ? 's' : ''}, ${childrenCount} Kid${childrenCount > 1 ? 's' : ''}`;
    summaryAddons.textContent = `₹${addonTotal.toLocaleString('en-IN', {maximumFractionDigits:2})}`;
    summaryTax.textContent = `₹${taxTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
    summaryTotal.textContent = `₹${grandTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
    
    // Trigger recommendation model update
    updateRecommendations(packageSelect.options[packageSelect.selectedIndex].getAttribute('data-name'));
    
    return {
      packagePrice: packageCostPerGuest,
      packageTotal,
      adultsCount,
      childrenCount,
      addonTotal,
      taxTotal,
      grandTotal
    };
  }

  // ==========================================================
  // AI Recommendation Engine Simulator (Association Rules)
  // ==========================================================
  function updateRecommendations(packageName) {
    aiRecList.innerHTML = '';
    let recommendations = [];
    
    if (packageName === "Nature Starter") {
      if (!chkGuide.checked) {
        recommendations.push({
          id: 'guide',
          title: 'Private Nature Guide',
          desc: 'Recommended by Guide Matcher model',
          match: '92% Match',
          targetCheckbox: chkGuide,
          targetItem: document.getElementById('addon-guide')
        });
      }
      if (!chkBonfire.checked) {
        recommendations.push({
          id: 'bonfire',
          title: 'Campfire Setup',
          desc: 'Recommended by Family Night model',
          match: '88% Match',
          targetCheckbox: chkBonfire,
          targetItem: document.getElementById('addon-bonfire')
        });
      }
    } else if (packageName === "Adventure Pro") {
      if (!chkBuffet.checked) {
        recommendations.push({
          id: 'buffet',
          title: 'Organic Buffet Dining',
          desc: 'Recommended by Hunger Pred model',
          match: '95% Match',
          targetCheckbox: chkBuffet,
          targetItem: document.getElementById('addon-buffet')
        });
      }
      if (!chkGuide.checked) {
        recommendations.push({
          id: 'guide',
          title: 'Private Nature Guide',
          desc: 'Recommended by Trail Safety model',
          match: '86% Match',
          targetCheckbox: chkGuide,
          targetItem: document.getElementById('addon-guide')
        });
      }
    } else if (packageName === "Luxury Agro Retreat") {
      if (!chkBuffet.checked) {
        recommendations.push({
          id: 'buffet',
          title: 'Organic Buffet Dining',
          desc: 'Recommended by Luxury Dining model',
          match: '98% Match',
          targetCheckbox: chkBuffet,
          targetItem: document.getElementById('addon-buffet')
        });
      }
    }
    
    if (recommendations.length > 0) {
      aiRecBox.style.display = 'block';
      recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'ai-rec-item';
        item.innerHTML = `
          <div class="ai-rec-info">
            <span class="ai-rec-title">${rec.title}</span>
            <span class="ai-rec-match">${rec.match} &middot; <span style="color: var(--text-muted); font-weight: normal; font-size: 0.68rem;">${rec.desc}</span></span>
          </div>
          <button type="button" class="btn-rec-add" data-id="${rec.id}">Add Experience</button>
        `;
        
        item.querySelector('.btn-rec-add').addEventListener('click', () => {
          rec.targetCheckbox.checked = true;
          rec.targetItem.classList.add('selected');
          calculateTotal();
        });
        
        aiRecList.appendChild(item);
      });
    } else {
      aiRecBox.style.display = 'none';
    }
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('booking-name').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    
    if (!name || !email || !dateInput.value) {
      showToast('Please fill out all required fields.', 'info');
      return;
    }
    
    const finalBill = calculateTotal();
    const packageName = packageSelect.options[packageSelect.selectedIndex].getAttribute('data-name');
    
    // Compile checked addons
    const addonsList = [];
    if (chkBonfire.checked) addonsList.push('Campfire & Bonfire Setup');
    if (chkGuide.checked) addonsList.push('Private Nature Guide');
    if (chkBuffet.checked) addonsList.push('Organic Buffet Dinner Upgrade');
    
    const bookingPayload = {
      name,
      email,
      date: dateInput.value,
      package_name: packageName,
      adults: finalBill.adultsCount,
      children: finalBill.childrenCount,
      addons: addonsList.join(', '),
      total_price: finalBill.grandTotal
    };
    
    // Store variables globally for use in payment processing modal
    window.lastCalculatedBill = finalBill;
    window.lastSelectedPackageName = packageName;
    window.lastSelectedAddonsList = addonsList;
    window.pendingBookingPayload = bookingPayload;
    
    // Populate payment summary
    document.getElementById('payment-package-detail').textContent = `Package: ${packageName} (${finalBill.adultsCount} Ad, ${finalBill.childrenCount} Ch)`;
    document.getElementById('payment-total-detail').textContent = `Total Cost: ₹${finalBill.grandTotal.toLocaleString('en-IN', {maximumFractionDigits:2})}`;
    
    // Open payment gateway modal
    document.getElementById('payment-modal-overlay').classList.add('active');
  });

  window.confirmBookingCheckout = function() {
    const payload = window.pendingBookingPayload;
    const finalBill = window.lastCalculatedBill;
    const packageName = window.lastSelectedPackageName;
    const addonsList = window.lastSelectedAddonsList;
    const name = payload.name;
    const email = payload.email;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Booking...';
    
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Server error during booking save.");
      return res.json();
    })
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Confirm Booking & Generate Ticket
      `;
      form.reset();
      addonItems.forEach(item => item.classList.remove('selected'));
      calculateTotal();
      
      // Auto-prefill name/email if user is logged in
      const activeUser = sessionStorage.getItem('username');
      const activeEmail = sessionStorage.getItem('email');
      if (activeUser) {
        document.getElementById('booking-name').value = sessionStorage.getItem('displayName') || activeUser;
        document.getElementById('booking-email').value = activeEmail || `${activeUser}@gmail.com`;
      }
      
      let receiptHtml = `
        <div class="receipt-header">
          <div class="receipt-logo">GREENHAVEN ECO-RETREAT</div>
          <div>Booking Gate Pass Ticket</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Ticket ID: ${data.ticket_id}</div>
        </div>
        
        <div class="receipt-row">
          <span>Visitor Name:</span>
          <strong>${data.visitor_name}</strong>
        </div>
        <div class="receipt-row">
          <span>Email Address:</span>
          <span>${data.email}</span>
        </div>
        <div class="receipt-row">
          <span>Booking Date:</span>
          <span>${data.visit_date}</span>
        </div>
        <div class="receipt-row">
          <span>Package Choice:</span>
          <span>${data.package_name}</span>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-row">
          <span>Base package (${data.adults} Ad, ${data.children} Ch):</span>
          <span>₹${finalBill.packageTotal.toFixed(2)}</span>
        </div>
      `;
      
      if (data.addons) {
        receiptHtml += `
          <div class="receipt-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <span>Add-ons Checked:</span>
            <span style="font-size: 0.82rem; color: var(--text-muted); padding-left: 10px;">${data.addons}</span>
          </div>
          <div class="receipt-row">
            <span>Add-ons Pricing total:</span>
            <span>₹${finalBill.addonTotal.toFixed(2)}</span>
          </div>
        `;
      }
      
      receiptHtml += `
        <div class="receipt-row">
          <span>Eco & service Tax (5%):</span>
          <span>₹${finalBill.taxTotal.toFixed(2)}</span>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-row total">
          <span>GRAND TOTAL:</span>
          <span>₹${data.total_price.toFixed(2)}</span>
        </div>
        
        <div class="receipt-barcode">
          <div>SCANNABLE ENTRANCE TICKET</div>
          <div class="barcode-sim"></div>
          <div style="font-size: 0.7rem; margin-top: 5px;">Present this barcode at gate check-in</div>
        </div>
      `;
      
      receiptContainer.innerHTML = receiptHtml;
      
      document.getElementById('payment-modal-overlay').classList.remove('active');
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      showToast('Booking success! Gate pass generated.', 'success');
    })
    .catch(err => {
      console.warn("Backend unavailable, generating ticket in Demo Mode (LocalStorage):", err);
      
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `GH-${currentYear}-${randomNum}`;
      
      const mockData = {
        id: Date.now(),
        ticket_id: ticketId,
        visitor_name: name,
        email: email,
        visit_date: payload.date,
        package_name: packageName,
        adults: finalBill.adultsCount,
        children: finalBill.childrenCount,
        addons: addonsList.join(', '),
        total_price: finalBill.grandTotal
      };
      
      const localBookings = JSON.parse(localStorage.getItem('greenhaven_bookings') || '[]');
      localBookings.push(mockData);
      localStorage.setItem('greenhaven_bookings', JSON.stringify(localBookings));
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Confirm Booking & Generate Ticket
      `;
      form.reset();
      addonItems.forEach(item => item.classList.remove('selected'));
      calculateTotal();
      
      // Auto-prefill name/email if user is logged in
      const activeUser = sessionStorage.getItem('username');
      const activeEmail = sessionStorage.getItem('email');
      if (activeUser) {
        document.getElementById('booking-name').value = sessionStorage.getItem('displayName') || activeUser;
        document.getElementById('booking-email').value = activeEmail || `${activeUser}@gmail.com`;
      }
      
      let receiptHtml = `
        <div class="receipt-header">
          <div class="receipt-logo">GREENHAVEN ECO-RETREAT</div>
          <div>Booking Gate Pass Ticket</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Ticket ID: ${mockData.ticket_id} (Demo Mode)</div>
        </div>
        
        <div class="receipt-row">
          <span>Visitor Name:</span>
          <strong>${mockData.visitor_name}</strong>
        </div>
        <div class="receipt-row">
          <span>Email Address:</span>
          <span>${mockData.email}</span>
        </div>
        <div class="receipt-row">
          <span>Booking Date:</span>
          <span>${mockData.visit_date}</span>
        </div>
        <div class="receipt-row">
          <span>Package Choice:</span>
          <span>${mockData.package_name}</span>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-row">
          <span>Base package (${mockData.adults} Ad, ${mockData.children} Ch):</span>
          <span>₹${finalBill.packageTotal.toFixed(2)}</span>
        </div>
      `;
      
      if (mockData.addons) {
        receiptHtml += `
          <div class="receipt-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <span>Add-ons Checked:</span>
            <span style="font-size: 0.82rem; color: var(--text-muted); padding-left: 10px;">${mockData.addons}</span>
          </div>
          <div class="receipt-row">
            <span>Add-ons Pricing total:</span>
            <span>₹${finalBill.addonTotal.toFixed(2)}</span>
          </div>
        `;
      }
      
      receiptHtml += `
        <div class="receipt-row">
          <span>Eco & service Tax (5%):</span>
          <span>₹${finalBill.taxTotal.toFixed(2)}</span>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-row total">
          <span>GRAND TOTAL:</span>
          <span>₹${mockData.total_price.toFixed(2)}</span>
        </div>
        
        <div class="receipt-barcode">
          <div>SCANNABLE ENTRANCE TICKET</div>
          <div class="barcode-sim"></div>
          <div style="font-size: 0.7rem; margin-top: 5px;">Present this barcode at gate check-in</div>
        </div>
      `;
      
      receiptContainer.innerHTML = receiptHtml;
      
      document.getElementById('payment-modal-overlay').classList.remove('active');
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      showToast('Booking success! Gate pass generated (Demo Mode).', 'success');
    });
  };
  
  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  modalClose.addEventListener('click', closeModal);
  btnDismiss.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  btnPrint.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Pass - GreenHaven</title>
          <style>
            body { font-family: monospace; padding: 30px; text-align: left; line-height: 1.5; color: #333; }
            .receipt-header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .receipt-divider { border-top: 2px dashed #ccc; margin: 12px 0; }
            .receipt-row.total { font-weight: bold; font-size: 16px; margin-top: 10px; }
            .receipt-barcode { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ccc; }
            .barcode-sim { height: 45px; background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 6px, #000 6px, #000 10px, transparent 10px, transparent 12px); width: 70%; margin: 8px auto 0; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          ${receiptContainer.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  });
  
  calculateTotal();
}

/* ==========================================================================
   6. Image Lightbox Module
   ========================================================================== */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  let currentIdx = 0;
  const imageSources = Array.from(galleryItems).map(item => ({
    src: item.getAttribute('data-src'),
    title: item.getAttribute('data-title'),
    cat: item.getAttribute('data-cat')
  }));
  
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIdx = index;
      openLightbox(currentIdx);
    });
  });
  
  function openLightbox(index) {
    const current = imageSources[index];
    lightboxImg.src = current.src;
    lightboxCaption.innerHTML = `<strong>${current.cat}</strong> - ${current.title}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function showNext() {
    currentIdx = (currentIdx + 1) % imageSources.length;
    openLightbox(currentIdx);
  }
  
  function showPrev() {
    currentIdx = (currentIdx - 1 + imageSources.length) % imageSources.length;
    openLightbox(currentIdx);
  }
  
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ==========================================================================
   7. Reviews slider & Submission System (SQL API backed)
   ========================================================================== */
function initReviewsCarousel() {
  const slider = document.getElementById('reviews-slider');
  const dotsContainer = document.getElementById('reviews-dots');
  const reviewForm = document.getElementById('review-form');
  const starSelector = document.getElementById('star-selector');
  const starBtns = starSelector.querySelectorAll('.star-btn');
  const messageInput = document.getElementById('review-message');
  const sentimentWrap = document.getElementById('sentiment-live-badge-wrap');
  const sentimentBadge = document.getElementById('sentiment-live-badge');
  
  let activeIndex = 0;
  let activeRating = 5;
  let reviews = [];
  
  // Real-time NLP Sentiment Lexicon scoring engine
  const posWords = ['great', 'awesome', 'incredible', 'amazing', 'beautiful', 'clean', 'friendly', 'happy', 'love', 'loved', 'good', 'nice', 'perfect', 'stellar', 'helpful', 'luxury', 'cozy', 'enjoyed', 'excellent', 'heritage', 'traditional', 'delicious', 'organic', 'peaceful', 'wonderful'];
  const negWords = ['bad', 'worst', 'poor', 'dirty', 'unfriendly', 'expensive', 'crowded', 'slow', 'waste', 'hate', 'terrible', 'horrible', 'annoying', 'broken', 'difficult', 'noisy', 'rude'];

  function classifySentiment(text) {
    if (!text || text.trim().length < 3) {
      return { label: 'Neutral', score: 0.50 };
    }
    const words = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/);
    let posCount = 0;
    let negCount = 0;
    
    words.forEach(w => {
      if (posWords.includes(w)) posCount++;
      if (negWords.includes(w)) negCount++;
    });
    
    const totalCount = posCount + negCount;
    if (totalCount === 0) {
      return { label: 'Neutral', score: 0.50 };
    }
    
    const score = 0.5 + ((posCount - negCount) / (totalCount * 2));
    let label = 'Neutral';
    if (score > 0.55) label = 'Positive';
    if (score < 0.45) label = 'Negative';
    
    return { label, score: parseFloat(score.toFixed(2)) };
  }

  // Real-time input listener for NLP preview
  messageInput.addEventListener('input', () => {
    const text = messageInput.value;
    if (text.trim().length >= 5) {
      const result = classifySentiment(text);
      sentimentWrap.style.display = 'flex';
      sentimentBadge.textContent = `${result.label} (${Math.round(result.score * 100)}%)`;
      sentimentBadge.className = `sentiment-badge ${result.label.toLowerCase()}`;
    } else {
      sentimentWrap.style.display = 'none';
    }
  });
  
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeRating = parseInt(btn.getAttribute('data-value'));
      updateStarUI(activeRating);
    });
  });
  
  function updateStarUI(rating) {
    starBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'));
      if (val <= rating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  updateStarUI(activeRating);
  
  // Fetch reviews from SQL database on load
  function fetchReviews() {
    fetch('/api/reviews')
      .then(res => {
        if (!res.ok) throw new Error("Failed to load reviews from server.");
        return res.json();
      })
      .then(data => {
        reviews = data;
        renderReviews();
      })
      .catch(err => {
        console.warn("Backend unavailable, loading reviews from LocalStorage:", err);
        const localReviews = JSON.parse(localStorage.getItem('greenhaven_reviews') || '[]');
        if (localReviews.length > 0) {
          reviews = localReviews;
        } else {
          reviews = [
            { name: "Sanjay Rao", title: "Family Visitor", rating: 5, text: "The trekking and the cottage package were absolutely incredible. The local food is cooked organically and reminds us of traditional home dishes. Our kids loved the boating!", sentiment_label: "Positive", sentiment_score: 0.95 },
            { name: "Anjali K.", title: "Solo Backpacker", rating: 4, text: "Great place for nature photographers and hikers. The guides are extremely knowledgeable about native fauna. Accommodation in the tents is very clean and standard.", sentiment_label: "Positive", sentiment_score: 0.88 }
          ];
        }
        renderReviews();
      });
  }
  
  // POST review to Express API
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const message = document.getElementById('review-message').value.trim();
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    
    if (!name || !message) {
      showToast('Please fill in your name and message.', 'info');
      return;
    }
    
    const sentiment = classifySentiment(message);
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting review...';
    
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating: activeRating, text: message, sentiment_label: sentiment.label, sentiment_score: sentiment.score })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to submit review to SQL.");
      return res.json();
    })
    .then(savedReview => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
      
      reviewForm.reset();
      sentimentWrap.style.display = 'none';
      activeRating = 5;
      updateStarUI(activeRating);
      
      reviews.unshift(savedReview);
      renderReviews();
      
      showToast('Thank you! Review posted to SQL database.', 'success');
    })
    .catch(err => {
      console.warn("Backend unavailable, saving review to LocalStorage Demo Mode:", err);
      const mockSavedReview = {
        id: Date.now(),
        name: name,
        title: "Verified Visitor (Demo Mode)",
        rating: activeRating,
        text: message,
        sentiment_label: sentiment.label,
        sentiment_score: sentiment.score
      };
      
      const localReviews = JSON.parse(localStorage.getItem('greenhaven_reviews') || '[]');
      localReviews.unshift(mockSavedReview);
      localStorage.setItem('greenhaven_reviews', JSON.stringify(localReviews));
      
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
      reviewForm.reset();
      sentimentWrap.style.display = 'none';
      activeRating = 5;
      updateStarUI(activeRating);
      
      reviews.unshift(mockSavedReview);
      renderReviews();
      
      showToast('Review submitted in Demo Mode (Local Storage)!', 'success');
    });
  });
  
  function renderReviews() {
    slider.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    if (reviews.length === 0) {
      slider.innerHTML = `
        <div class="review-slide">
          <div class="review-card" style="text-align: center;">
            <p class="review-text">No reviews posted yet. Be the first to write one!</p>
          </div>
        </div>
      `;
      return;
    }
    
    reviews.forEach((review, idx) => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        const starColor = i <= review.rating ? 'currentColor' : 'var(--border-color)';
        starsHtml += `
          <svg viewBox="0 0 24 24" style="color: ${starColor}; width: 18px; height: 18px; fill: ${i <= review.rating ? 'currentColor' : 'none'}; stroke: ${starColor}; stroke-width: 2;">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        `;
      }
      
      const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      const sentimentClass = review.sentiment_label ? review.sentiment_label.toLowerCase() : 'neutral';
      const sentimentText = review.sentiment_label ? `${review.sentiment_label} (${Math.round((review.sentiment_score || 0.5) * 100)}%)` : 'Neutral (50%)';
      
      const slide = document.createElement('div');
      slide.className = 'review-slide';
      slide.innerHTML = `
        <div class="review-card">
          <div class="review-stars-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div class="review-stars">${starsHtml}</div>
            <span class="sentiment-badge ${sentimentClass}" style="font-size: 0.65rem;">${sentimentText}</span>
          </div>
          <p class="review-text">${review.text}</p>
          <div class="review-author">
            <div class="review-avatar">${initials || 'V'}</div>
            <div>
              <h4 class="review-author-name">${review.name}</h4>
              <span class="review-author-title">${review.title}</span>
            </div>
          </div>
        </div>
      `;
      slider.appendChild(slide);
      
      const dot = document.createElement('div');
      dot.className = `dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
    
    goToSlide(0);
  }
  
  function goToSlide(index) {
    if (reviews.length === 0) return;
    activeIndex = index;
    slider.style.transform = `translateX(-${activeIndex * 100}%)`;
    
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }
  
  let autoPlayTimer = setInterval(nextSlide, 7000);
  
  function nextSlide() {
    if (reviews.length === 0) return;
    goToSlide((activeIndex + 1) % reviews.length);
  }
  
  function resetAutoplay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextSlide, 7000);
  }
  
  dotsContainer.addEventListener('click', resetAutoplay);
  
  // Trigger initial server load
  fetchReviews();
}

/* ==========================================================================
   8. Collapsible FAQ Accordion Toggle
   ========================================================================== */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   9. Contact Form & Newsletter Submit Validation (Fullstack Integrated)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    if (!name || !email || !message) {
      showToast('Please fill out all fields.', 'info');
      return;
    }
    
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address.', 'info');
      return;
    }
    
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';
    
    // POST request to backend API to log messages in database
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
    .then(res => {
      if (!res.ok) throw new Error("Server error saving message.");
      return res.json();
    })
    .then(data => {
      showToast('Message logged in SQL! We will contact you soon.', 'success');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    })
    .catch(err => {
      console.warn("Backend unavailable, saving contact message to LocalStorage:", err);
      // Fallback: Log contact message to LocalStorage
      const localContacts = JSON.parse(localStorage.getItem('greenhaven_contacts') || '[]');
      localContacts.push({
        name,
        email,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('greenhaven_contacts', JSON.stringify(localContacts));
      
      showToast('Message logged in Demo Mode (Local Storage)!', 'success');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  });
  
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input');
    
    showToast('Subscribed! Check your inbox for vouchers.', 'success');
    emailInput.value = '';
  });
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
}

/* ==========================================================================
   10. Toast Notification Helper
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconHtml = '';
  if (type === 'success') {
    iconHtml = `
      <div class="toast-icon success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    `;
  } else {
    iconHtml = `
      <div class="toast-icon info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
    `;
  }
  
  toast.innerHTML = `
    ${iconHtml}
    <div class="toast-body">${message}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('active');
  }, 50);
  
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

/* ==========================================================================
   11. AI Voice & Interactive Virtual Tour Guide Module
   ========================================================================== */
function initVoiceGuide() {
  const trigger = document.getElementById('ai-guide-trigger');
  const card = document.getElementById('ai-guide-card');
  const cardClose = document.getElementById('ai-card-close');
  const btnStart = document.getElementById('btn-start-tour');
  const btnPause = document.getElementById('btn-pause-tour');
  const btnStop = document.getElementById('btn-stop-tour');
  const guideText = document.getElementById('ai-guide-text');
  const statusDot = card.querySelector('.status-dot');
  
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatForm = document.getElementById('ai-chat-input-form');
  const chatInput = document.getElementById('ai-chat-input');
  const quickChips = document.getElementById('ai-quick-chips');
  const tourControls = document.getElementById('ai-tour-controls');

  let synth = window.speechSynthesis;
  let tourUtterance = null;
  let isSpeaking = false;
  let currentStep = 0;
  let isPaused = false;
  let isTourMode = false;

  const tourSteps = [
    {
      target: '#home',
      text: "Welcome to GreenHaven Eco-Retreat. I am your virtual forest guide. Let me show you around our resort. We will start here at our beautiful nature gateway.",
      title: "Discover the Wilderness"
    },
    {
      target: '#about',
      text: "Next, we visit the heart of nature. Founded in 2022, GreenHaven offers guided forest trekking, boating events, and premium cottage stays.",
      title: "Heart of Nature"
    },
    {
      target: '#packages',
      text: "Here are our curated tour packages. You can filter between adventure, camping, or premium options depending on your group size.",
      title: "Resort Tour Packages"
    },
    {
      target: '#booking',
      text: "Our interactive booking simulator allows you to choose dates, guest count, and optional add-ons to calculate trip costs and generate a scannable check-in gate pass.",
      title: "Real-time Booking Simulator"
    },
    {
      target: '#reviews',
      text: "Check out reviews from our verified family and solo travelers. All testimonials are persisted directly in our SQLite database.",
      title: "Verified Visitor Reviews"
    },
    {
      target: '#contact',
      text: "Finally, if you have any questions or want customized packages, send us a query here. Thank you for visiting GreenHaven Eco-Retreat!",
      title: "Retreat Helpdesk"
    }
  ];

  // Toggle Card
  trigger.addEventListener('click', () => {
    card.classList.toggle('active');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  cardClose.addEventListener('click', () => {
    card.classList.remove('active');
  });

  // Tour controls triggers
  btnStart.addEventListener('click', () => {
    if (isPaused && synth) {
      synth.resume();
      isPaused = false;
      isSpeaking = true;
      updateUIState('speaking');
      return;
    }
    currentStep = 0;
    runTourStep();
  });

  btnPause.addEventListener('click', () => {
    if (synth && synth.speaking) {
      synth.pause();
      isPaused = true;
      isSpeaking = false;
      updateUIState('paused');
    }
  });

  btnStop.addEventListener('click', () => {
    stopTour();
  });

  function stopTour() {
    if (synth) synth.cancel();
    clearTourHighlights();
    isSpeaking = false;
    isPaused = false;
    isTourMode = false;
    currentStep = 0;
    
    tourControls.style.display = 'none';
    quickChips.style.display = 'flex';
    updateUIState('idle');
    
    addBotMessage("Interactive audio tour stopped. Let me know if you need help with anything else!");
  }

  function runTourStep() {
    if (currentStep >= tourSteps.length) {
      clearTourHighlights();
      isSpeaking = false;
      isPaused = false;
      isTourMode = false;
      currentStep = 0;
      tourControls.style.display = 'none';
      quickChips.style.display = 'flex';
      updateUIState('idle');
      addBotMessage("Audio tour completed! Thank you for walking through our resort guide. Feel free to ask more questions!");
      return;
    }

    clearTourHighlights();
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);

    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    guideText.textContent = `[${step.title}] Narration playing...`;
    
    // Auto-add bot chat log during tour
    addBotMessage(`Touring section: ${step.title}`, false);

    speakText(step.text, () => {
      if (!isPaused && isTourMode) {
        currentStep++;
        runTourStep();
      }
    });
  }

  // Speak aloud helper
  function speakText(text, callback = null) {
    if (!synth) {
      if (callback) setTimeout(callback, 4000);
      return;
    }
    
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      isSpeaking = true;
      updateUIState('speaking');
    };

    utterance.onend = () => {
      isSpeaking = false;
      if (!isPaused) {
        updateUIState('idle');
        if (callback) callback();
      }
    };

    utterance.onerror = (e) => {
      console.error(e);
      isSpeaking = false;
      updateUIState('idle');
      if (callback) callback();
    };

    synth.speak(utterance);
  }

  // Update visual widget states
  function updateUIState(state) {
    if (state === 'speaking') {
      trigger.classList.add('speaking');
      statusDot.className = 'status-dot speaking';
      btnStart.style.display = 'none';
      btnPause.style.display = 'inline-block';
      btnStop.style.display = 'inline-block';
    } else if (state === 'paused') {
      trigger.classList.remove('speaking');
      statusDot.className = 'status-dot online';
      btnStart.textContent = 'Resume';
      btnStart.style.display = 'inline-block';
      btnPause.style.display = 'none';
      btnStop.style.display = 'inline-block';
    } else { // idle
      trigger.classList.remove('speaking');
      statusDot.className = 'status-dot online';
      btnStart.textContent = 'Start Tour';
      btnStart.style.display = 'inline-block';
      btnPause.style.display = 'none';
      btnStop.style.display = 'none';
    }
  }

  function clearTourHighlights() {
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  }

  // Chat message logging helpers
  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addBotMessage(text, speak = true) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (speak && !isTourMode) {
      speakText(text);
    }
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-dots';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  // Bot response NLP rules engine
  function processUserQuery(query) {
    const text = query.toLowerCase().trim();
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      
      if (text === 'tour' || text.includes('start tour') || text.includes('voice tour')) {
        addBotMessage("Starting the GreenHaven virtual audio tour narrator now!", false);
        setTimeout(() => {
          isTourMode = true;
          quickChips.style.display = 'none';
          tourControls.style.display = 'block';
          currentStep = 0;
          isPaused = false;
          runTourStep();
        }, 1200);
        return;
      }

      let reply = "";
      if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        reply = "Hello! I'm Aranya. How can I help you today? You can ask me about packages, booking simulator, food, or activities!";
      } else if (text.includes('package') || text.includes('rate') || text.includes('cost') || text.includes('price')) {
        reply = "We offer three packages: Nature Starter (₹650), Adventure Pro (₹1,200), and Luxury Agro Retreat (₹2,500). Scroll to our packages section to filter them!";
      } else if (text.includes('book') || text.includes('reserve') || text.includes('simulator') || text.includes('ticket')) {
        reply = "You can book directly using the Simulator section. Choose your packages, guests, and addons, then submit to generate a gate check-in ticket pass!";
      } else if (text.includes('food') || text.includes('dining') || text.includes('thali') || text.includes('buffet') || text.includes('organic')) {
        reply = "Our retreat serves 100% organic farm-fresh regional recipes, cooked using traditional earthen ovens. It's home-cooked and healthy!";
      } else if (text.includes('trek') || text.includes('trekking') || text.includes('boating') || text.includes('guide')) {
        reply = "We host guided forest trekking, boating excursions, and bonfire camping events. Private guides can be checked as add-ons in the booking simulator.";
      } else if (text.includes('contact') || text.includes('help') || text.includes('support') || text.includes('phone') || text.includes('email')) {
        reply = "You can email us at info@Nature_agro.com, call +91 934567xx67, or write a query in the contact helpdesk at the bottom of this page.";
      } else if (text.includes('sqlite') || text.includes('database') || text.includes('sql') || text.includes('backend')) {
        reply = "Our system runs a fullstack Python backend integrated with an SQLite database (greenhaven.db). It stores bookings, customer reviews, and helpdesk messages securely!";
      } else if (text.includes('logo') || text.includes('puerto') || text.includes('branding')) {
        reply = "We have corrected the branding logo to the official 'GreenHaven Eco-Retreat' design. Est. 2023 - Sustainable Luxury.";
      } else {
        reply = "I'm happy to help! You can ask about our packages, dynamic cost calculator, farm-fresh organic dining, or support contacts.";
      }

      addBotMessage(reply);
    }, 1000);
  }

  // Handle Input Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    addUserMessage(query);
    chatInput.value = '';
    
    // If tour is active, stop it before answering questions
    if (isTourMode) {
      if (synth) synth.cancel();
      clearTourHighlights();
      isTourMode = false;
      tourControls.style.display = 'none';
      quickChips.style.display = 'flex';
      updateUIState('idle');
    }

    processUserQuery(query);
  });

  // Handle Quick Chips click
  quickChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-btn');
    if (!chip) return;

    const query = chip.getAttribute('data-query');
    
    if (query === 'tour') {
      addUserMessage("🎙️ Start Voice Tour");
      processUserQuery("tour");
    } else if (query === 'packages') {
      addUserMessage("🏕️ Check packages details");
      processUserQuery("packages");
    } else if (query === 'booking') {
      addUserMessage("🎫 How do I book a ticket?");
      processUserQuery("booking");
    } else if (query === 'food') {
      addUserMessage("🍛 Tell me about the dining");
      processUserQuery("food");
    }
  });

  // Window unload handlers
  window.addEventListener('beforeunload', () => {
    if (synth) synth.cancel();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && synth) {
      synth.cancel();
      if (isTourMode) stopTour();
    }
  });
}

/* ==========================================================================
   12. Scroll Reveal Observer System
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/* ==========================================================================
   13. User Authentication Module
   ========================================================================== */
function initAuth() {
  const authBtn = document.getElementById('auth-btn');
  const authModal = document.getElementById('auth-modal-overlay');
  const authClose = document.getElementById('auth-modal-close');
  const loginView = document.getElementById('login-view');
  const registerView = document.getElementById('register-view');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authContainer = document.getElementById('auth-status-container');
  
  function updateAuthUI() {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');
    
    if (token && username) {
      let adminButtonHtml = '';
      if (role === 'admin') {
        adminButtonHtml = `<a href="admin.html" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem; border-radius: var(--radius-full); margin-right: 8px; border-color: var(--primary); color: var(--primary);">📊 Admin Panel</a>`;
      }
      
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          ${adminButtonHtml}
          <span style="font-size: 0.86rem; font-weight: 600; color: var(--text-main);">👋 ${username}</span>
          <button id="logout-btn" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem; border-radius: var(--radius-full);">Logout</button>
        </div>
      `;
      
      const bookingNameInput = document.getElementById('booking-name');
      const bookingEmailInput = document.getElementById('booking-email');
      if (bookingNameInput && bookingEmailInput) {
        bookingNameInput.value = username;
        bookingEmailInput.value = `${username}@gmail.com`;
      }
      
      document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
      authContainer.innerHTML = `
        <button id="auth-btn-inner" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.85rem; border-radius: var(--radius-full);">Sign In</button>
      `;
      document.getElementById('auth-btn-inner').addEventListener('click', openModal);
    }
  }
  
  function openModal() {
    authModal.classList.add('active');
    loginView.style.display = 'block';
    registerView.style.display = 'none';
    document.getElementById('auth-modal-title').textContent = 'Sign In';
  }
  
  function closeModal() {
    authModal.classList.remove('active');
  }
  
  function handleLogout() {
    sessionStorage.clear();
    showToast('Logged out successfully.', 'info');
    
    const bookingNameInput = document.getElementById('booking-name');
    const bookingEmailInput = document.getElementById('booking-email');
    if (bookingNameInput && bookingEmailInput) {
      bookingNameInput.value = '';
      bookingEmailInput.value = '';
    }
    
    updateAuthUI();
  }
  
  if (authBtn) authBtn.addEventListener('click', openModal);
  if (authClose) authClose.addEventListener('click', closeModal);
  
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginView.style.display = 'none';
      registerView.style.display = 'block';
      document.getElementById('auth-modal-title').textContent = 'Create Account';
    });
  }
  
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      loginView.style.display = 'block';
      registerView.style.display = 'none';
      document.getElementById('auth-modal-title').textContent = 'Sign In';
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
      })
      .then(data => {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('email', `${data.username}@gmail.com`);
        
        showToast(`Welcome back, ${data.username}!`, 'success');
        closeModal();
        updateAuthUI();
      })
      .catch(err => {
        console.warn("API Login failed, running local guest mode check:", err);
        if ((username === 'admin' && password === 'admin123') || (username === 'guest' && password === 'guest123')) {
          sessionStorage.setItem('token', 'mock-token-demo');
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('role', username === 'admin' ? 'admin' : 'user');
          sessionStorage.setItem('email', `${username}@gmail.com`);
          
          showToast(`Welcome back, ${username}! (Demo Mode)`, 'success');
          closeModal();
          updateAuthUI();
        } else {
          showToast('Invalid username or password.', 'error');
        }
      });
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value.trim();
      
      if (username.length < 4 || password.length < 6) {
        showToast('Username must be min 4 chars and password min 6 chars.', 'error');
        return;
      }
      
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => {
        if (res.status === 409) throw new Error("Username already exists.");
        if (!res.ok) throw new Error("Registration error.");
        return res.json();
      })
      .then(() => {
        showToast('Registration complete! Please sign in.', 'success');
        loginView.style.display = 'block';
        registerView.style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Sign In';
      })
      .catch(err => {
        console.warn("API Register failed, running offline local registry:", err);
        showToast(err.message || 'Error occurred during registration.', 'error');
      });
    });
  }
  
  updateAuthUI();
}

/* ==========================================================================
   14. Real-time Weather Updates Module
   ========================================================================== */
function initWeather() {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const alertEl = document.getElementById('weather-alert');
  
  fetch('https://api.open-meteo.com/v1/forecast?latitude=12.4244&longitude=75.7389&current_weather=true')
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      const weather = data.current_weather;
      if (weather) {
        tempEl.textContent = `${Math.round(weather.temperature)}°C`;
        
        const code = weather.weathercode;
        let desc = "Clear Skies";
        let isRainAlert = false;
        
        if (code === 0) desc = "Sunny";
        else if (code >= 1 && code <= 3) desc = "Partly Cloudy ⛅";
        else if (code === 45 || code === 48) desc = "Foggy 🌫️";
        else if (code >= 51 && code <= 55) desc = "Light Drizzle 🌧️";
        else if (code >= 61 && code <= 65) {
          desc = "Rainy 🌧️";
          isRainAlert = (code >= 63);
        }
        else if (code >= 71 && code <= 75) desc = "Snowy ❄️";
        else if (code >= 80 && code <= 82) {
          desc = "Showers ⛈️";
          isRainAlert = true;
        }
        else if (code >= 95 && code <= 99) {
          desc = "Thunderstorm 🌩️";
          isRainAlert = true;
        }
        
        descEl.textContent = desc;
        if (isRainAlert && alertEl) {
          alertEl.style.display = 'inline-block';
        }
      }
    })
    .catch(() => {
      const currentMonth = new Date().getMonth();
      let temp = 22;
      let desc = "Clear Spring Skies ☀️";
      let isRainAlert = false;
      
      if (currentMonth >= 5 && currentMonth <= 8) {
        temp = 20;
        desc = "Heavy Monsoon Rain ⛈️";
        isRainAlert = true;
      } else if (currentMonth === 11 || currentMonth === 0) {
        temp = 16;
        desc = "Pleasant Winter Breeze 🍃";
      }
      
      if (tempEl) tempEl.textContent = `${temp}°C`;
      if (descEl) descEl.textContent = desc;
      if (isRainAlert && alertEl) alertEl.style.display = 'inline-block';
    });
}

/* ==========================================================================
   15. Secure Payment Gateway Simulation Module
   ========================================================================== */
function initPayment() {
  const payModal = document.getElementById('payment-modal-overlay');
  const payClose = document.getElementById('payment-modal-close');
  const payForm = document.getElementById('payment-card-form');
  
  const cardInput = document.getElementById('card-number');
  const expiryInput = document.getElementById('card-expiry');
  const cvvInput = document.getElementById('card-cvv');
  const holderInput = document.getElementById('card-holder');
  
  const statusWrapper = document.getElementById('payment-status-wrapper');
  const statusText = document.getElementById('payment-status-text');
  const submitBtn = document.getElementById('btn-submit-payment');
  
  if (payClose) {
    payClose.addEventListener('click', () => {
      payModal.classList.remove('active');
    });
  }
  
  if (cardInput) {
    cardInput.addEventListener('input', () => {
      let value = cardInput.value.replace(/\D/g, '');
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
      }
      cardInput.value = formatted;
      
      const cardTypeIcon = document.getElementById('card-type-icon');
      if (value.startsWith('4')) {
        cardTypeIcon.textContent = '💳 Visa';
      } else if (value.startsWith('5')) {
        cardTypeIcon.textContent = '💳 MC';
      } else if (value.startsWith('6')) {
        cardTypeIcon.textContent = '💳 RuPay';
      } else {
        cardTypeIcon.textContent = '💳';
      }
    });
  }
  
  if (expiryInput) {
    expiryInput.addEventListener('input', () => {
      let value = expiryInput.value.replace(/\D/g, '');
      if (value.length > 2) {
        expiryInput.value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
      } else {
        expiryInput.value = value;
      }
    });
  }
  
  function validateLuhn(number) {
    let clean = number.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0);
  }
  
  if (payForm) {
    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const cardNo = cardInput.value.trim();
      const expiry = expiryInput.value.trim();
      const cvv = cvvInput.value.trim();
      const holder = holderInput.value.trim();
      
      if (!cardNo || !expiry || !cvv || !holder) {
        showToast('Please enter all credit card checkout details.', 'info');
        return;
      }
      
      if (!validateLuhn(cardNo)) {
        showToast('Credit card verification failed (Luhn check invalid).', 'error');
        cardInput.focus();
        return;
      }
      
      const expParts = expiry.split('/');
      if (expParts.length !== 2 || expParts[0] < 1 || expParts[0] > 12) {
        showToast('Invalid card expiry date formatting.', 'error');
        expiryInput.focus();
        return;
      }
      
      if (cvv.length !== 3) {
        showToast('CVV must contain exactly 3 digits.', 'error');
        cvvInput.focus();
        return;
      }
      
      statusWrapper.style.display = 'flex';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing transaction...';
      statusText.textContent = "Connecting to payment gateway secure merchant portal...";
      
      setTimeout(() => {
        statusText.textContent = "Verifying 3D-Secure secure token authorization...";
      }, 1000);
      
      setTimeout(() => {
        statusWrapper.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Authorize Secure Payment';
        
        payForm.reset();
        
        if (window.confirmBookingCheckout) {
          window.confirmBookingCheckout();
        } else {
          showToast('Booking simulator handler error.', 'error');
        }
      }, 2300);
    });
  }
}

