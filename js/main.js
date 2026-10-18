/* ==========================================================================
   THE CITY GRAMMAR SCHOOL (TCGS) - CORE APPLICATION JAVASCRIPT
   Handles: Bilingual switching (EN/UR), Karachi live hours, sticky shrink header,
   scroll animations, stats counter, tab systems, interactive checklist, FAQs, forms
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Engine Setup
  initLanguageEngine();

  // 2. Header & Mobile Menu
  initHeaderInteractions();

  // 3. Karachi Real-Time Office Hours Live Badge
  updateKarachiOfficeStatus();
  setInterval(updateKarachiOfficeStatus, 60000); // Check every minute

  // 4. Scroll Reveal Animations
  initScrollReveal();

  // 5. Animated Stats Counters
  initStatsCounters();

  // 6. Interactive Classes Offered Tabs (Admission Page)
  initClassTabs();

  // 7. Interactive Documents Checklist (Admission Page)
  initDocumentChecklist();

  // 8. Searchable FAQ Accordion (Admission & Contact Pages)
  initFaqAccordion();

  // 9. Forms & Validation
  initFormHandlers();

  // 10. Intelligent Lazy Map Loading (Zero Blocking on Initial Load)
  initLazyMap();

  // 11. Back to Top Button
  initBackToTop();

  // 12. Scroll-Driven Stacked Cards Deck (TCGS Advantage Section)
  initStackedAdvantageDeck();

  // 13. Interactive Gallery Filters & Lightbox Modal
  initGalleryFilters();
  initGalleryLightbox();

  // 14. Three Promises Auto-Advancing Tabs & Accordion (Home Page)
  initPromisesSection();

  // 15. Study at TCGS Expanding Image Panels (Home Page)
  initStudyTcgsSection();

  // 16. Result Quick-Check Band (Home Page)
  initQuickResultCheck();

  // 17. Since 1992 Parallax, Timeline & Year Count (About Page)
  initSince1992Section();

  // 18. Newsletter Subscription Strip with Honeypot
  initNewsletterForm();

  // 19. Instagram Dynamic Social Link Visibility
  initInstagramSocialLinks();

  // 20. Dynamic Copyright Year
  initCurrentYear();

  // 21. Milad Function Picture Slider (Home Page)
  initMiladSlider();

  // 22. Ethical Compass Two Arch Doors & Swinging Compass Medallion
  initEthicalCompassSection();
});

/* --------------------------------------------------------------------------
   1. LANGUAGE SWITCHER & ENGINE (EN / UR)
   -------------------------------------------------------------------------- */
let currentLang = 'en';

function initLanguageEngine() {
  const langBtns = document.querySelectorAll('.lang-btn');
  if (!langBtns.length) {
    setLanguage('en');
    return;
  }

  const savedLang = localStorage.getItem('tcgs_lang') || 'en';
  setLanguage(savedLang);

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.target.getAttribute('data-lang');
      if (selected && selected !== currentLang) {
        setLanguage(selected);
      }
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('tcgs_lang', lang);

  const html = document.documentElement;
  const isUrdu = (lang === 'ur');

  html.setAttribute('lang', isUrdu ? 'ur' : 'en');
  html.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');

  if (isUrdu) {
    html.classList.add('urdu-mode');
    if (!document.getElementById('tcgs-urdu-font')) {
      const ulink = document.createElement('link');
      ulink.id = 'tcgs-urdu-font';
      ulink.rel = 'stylesheet';
      ulink.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap';
      document.head.appendChild(ulink);
    }
  } else {
    html.classList.remove('urdu-mode');
  }

  // Update active state on language switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply translations to all data-i18n elements
  if (typeof TCGS_TRANSLATIONS !== 'undefined' && TCGS_TRANSLATIONS[lang]) {
    const dict = TCGS_TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Update input placeholders if data-i18n-ph exists
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
  }

  // Update live status text in current language
  updateKarachiOfficeStatus();
}

/* --------------------------------------------------------------------------
   2. HEADER SCROLL & MOBILE MENU
   -------------------------------------------------------------------------- */
function initHeaderInteractions() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Sticky shrink on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
    });

    // Close when clicking outside or nav link
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   3. KARACHI OFFICE HOURS LIVE STATUS BADGE
   Office Hours: Monday - Friday, 07:00 AM - 01:00 PM (Karachi PKT = UTC+5)
   -------------------------------------------------------------------------- */
function updateKarachiOfficeStatus() {
  const statusPills = document.querySelectorAll('.live-status-pill');
  if (!statusPills.length) return;

  // Compute Karachi local time (UTC+5)
  const now = new Date();
  const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktMillis = utcMillis + (3600000 * 5);
  const pktDate = new Date(pktMillis);

  const day = pktDate.getDay(); // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const currentDecTime = hours + (minutes / 60);

  // Office hours: Mon (1) to Fri (5), from 7.00 to 13.00
  const isWorkday = (day >= 1 && day <= 5);
  const isOpen = isWorkday && (currentDecTime >= 7.0 && currentDecTime < 13.0);

  const isUrdu = (currentLang === 'ur');
  const openText = isUrdu ? "دفتر کھلا ہے • دوپہر 01:00 بجے تک" : "Open Now • Closes at 1:00 PM PKT";
  const closedText = isUrdu ? "دفتر بند ہے • صبح 07:00 بجے کھلے گا" : "Closed Now • Opens 7:00 AM PKT";

  statusPills.forEach(pill => {
    const labelSpan = pill.querySelector('.status-text');
    if (isOpen) {
      pill.classList.remove('is-closed');
      pill.classList.add('is-open');
      if (labelSpan) labelSpan.textContent = openText;
    } else {
      pill.classList.remove('is-open');
      pill.classList.add('is-closed');
      if (labelSpan) labelSpan.textContent = closedText;
    }
  });
}

/* --------------------------------------------------------------------------
   4. SCROLL REVEAL (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-founder-photo, .reveal-founder-text');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => {
      el.classList.add('is-visible', 'is-revealed');
    });
  }
}

/* --------------------------------------------------------------------------
   5. ANIMATED STATS COUNTERS
   -------------------------------------------------------------------------- */
function initStatsCounters() {
  const statCards = document.querySelectorAll('.stat-counter');
  if (!statCards.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statCards.forEach(counter => {
          const raw = (counter.getAttribute('data-target') || counter.textContent || '').trim();
          if (!/^\d+(\.\d+)?$/.test(raw)) {
            return;
          }
          const target = parseFloat(raw);
          if (isNaN(target)) return;
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * target;

            counter.textContent = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = isDecimal ? target.toFixed(1) : target;
            }
          }

          requestAnimationFrame(updateCounter);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* --------------------------------------------------------------------------
   6. CLASSES OFFERED TABS (ADMISSION PAGE)
   -------------------------------------------------------------------------- */
function initClassTabs() {
  const tabBtns = document.querySelectorAll('.class-tab-btn');
  const tabPanes = document.querySelectorAll('.class-tab-pane');
  if (!tabBtns.length || !tabPanes.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. INTERACTIVE DOCUMENTS CHECKLIST (ADMISSION PAGE)
   -------------------------------------------------------------------------- */
function initDocumentChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-checkbox');
  const progressBar = document.querySelector('.checklist-progress-inner');
  const counterText = document.querySelector('.checklist-counter-display');
  if (!checkboxes.length) return;

  function updateChecklistState() {
    let checkedCount = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) checkedCount++;
    });

    const percent = Math.round((checkedCount / checkboxes.length) * 100);
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (counterText) {
      const isUrdu = (currentLang === 'ur');
      counterText.textContent = isUrdu 
        ? `${checkboxes.length} میں سے ${checkedCount} مکمل` 
        : `${checkedCount} of ${checkboxes.length} Checked (${percent}%)`;
    }
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateChecklistState);
  });

  updateChecklistState();
}

/* --------------------------------------------------------------------------
   8. SEARCHABLE FAQ ACCORDION (ADMISSION & CONTACT)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.querySelector('.faq-search-box');
  const filterChips = document.querySelectorAll('.faq-chip');

  // Accordion Toggle
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close others for clean single-view accordion
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('is-open');
      });

      item.classList.toggle('is-open', !isOpen);
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Category filter chips
  if (filterChips.length) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const category = chip.getAttribute('data-category');
        faqItems.forEach(item => {
          const itemCat = item.getAttribute('data-category') || 'all';
          if (category === 'all' || itemCat === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

/* --------------------------------------------------------------------------
   9. FORMS SUBMISSION & WHATSAPP CHAT LAUNCHER
   -------------------------------------------------------------------------- */
function initFormHandlers() {
  // Admission Inquiry Form
  const admissionForm = document.getElementById('admissionInquiryForm');
  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const successBanner = document.getElementById('admissionSuccessBanner');
      const parentName = document.getElementById('parentName')?.value || 'Parent';
      const studentName = document.getElementById('studentName')?.value || 'Student';
      const grade = document.getElementById('classApplying')?.value || 'General';
      const phone = document.getElementById('phone')?.value || '';

      if (successBanner) {
        successBanner.classList.add('is-active');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Pre-fill WhatsApp message option
      const waBtn = document.getElementById('formWhatsAppQuickBtn');
      if (waBtn) {
        const text = encodeURIComponent(`Hello The City Grammar School, I submitted an admission inquiry for ${studentName} for class ${grade}. Parent Contact: ${phone}.`);
        waBtn.setAttribute('href', `https://wa.me/923452144982?text=${text}`);
      }

      admissionForm.reset();
    });
  }

  // Contact Page Message Form (Section 3 Redesign)
  const contactForm = document.getElementById('contactMessageForm');
  const contactSuccessCard = document.getElementById('contactSuccessCard');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  const sendAnotherBtn = document.getElementById('sendAnotherMessageBtn');

  if (contactForm) {
    const nameInput = document.getElementById('cName');
    const emailInput = document.getElementById('cEmail');
    const phoneInput = document.getElementById('cPhone');
    const inquirySelect = document.getElementById('cInquiryType');
    const messageInput = document.getElementById('cMessage');

    const nameError = document.getElementById('cNameError');
    const emailError = document.getElementById('cEmailError');
    const phoneError = document.getElementById('cPhoneError');
    const inquiryError = document.getElementById('cInquiryTypeError');
    const messageError = document.getElementById('cMessageError');

    function getErrorMsg(key, defaultMsg) {
      const isUrdu = (currentLang === 'ur');
      const messages = {
        name: isUrdu ? "براہ کرم اپنا پورا نام درج کریں۔" : "Please enter your full name.",
        email: isUrdu ? "براہ کرم درست ای میل پتہ درج کریں۔" : "Please enter a valid email address.",
        phone: isUrdu ? "براہ کرم درست فون یا واٹس ایپ نمبر درج کریں۔" : "Please enter a valid phone/WhatsApp number.",
        purpose: isUrdu ? "براہ کرم رابطے کا مقصد منتخب کریں۔" : "Please select an inquiry purpose.",
        message: isUrdu ? "براہ کرم اپنا پیغام درج کریں (کم از کم 5 حروف)۔" : "Please enter your message (at least 5 characters)."
      };
      return messages[key] || defaultMsg;
    }

    function setValidationState(input, errorEl, isValid, errorKey, defaultMsg) {
      if (!input) return isValid;
      if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('is-visible');
        }
      } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        if (errorEl) {
          errorEl.textContent = getErrorMsg(errorKey, defaultMsg);
          errorEl.classList.add('is-visible');
        }
      }
      return isValid;
    }

    // Validation rules
    function validateName() {
      const val = nameInput ? nameInput.value.trim() : '';
      return setValidationState(nameInput, nameError, val.length >= 2, 'name', 'Please enter your full name.');
    }

    function validateEmail() {
      const val = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return setValidationState(emailInput, emailError, emailRegex.test(val), 'email', 'Please enter a valid email address.');
    }

    function validatePhone() {
      const val = phoneInput ? phoneInput.value.trim() : '';
      const digitsOnly = val.replace(/\D/g, '');
      return setValidationState(phoneInput, phoneError, digitsOnly.length >= 8, 'phone', 'Please enter a valid phone/WhatsApp number.');
    }

    function validateInquiry() {
      const val = inquirySelect ? inquirySelect.value : '';
      return setValidationState(inquirySelect, inquiryError, !!val, 'purpose', 'Please select an inquiry purpose.');
    }

    function validateMessage() {
      const val = messageInput ? messageInput.value.trim() : '';
      return setValidationState(messageInput, messageError, val.length >= 5, 'message', 'Please enter your message (at least 5 characters).');
    }

    // Live validation on blur
    if (nameInput) nameInput.addEventListener('blur', validateName);
    if (emailInput) emailInput.addEventListener('blur', validateEmail);
    if (phoneInput) phoneInput.addEventListener('blur', validatePhone);
    if (inquirySelect) inquirySelect.addEventListener('change', validateInquiry);
    if (messageInput) messageInput.addEventListener('blur', validateMessage);

    // Re-validate on input if field already has validation state
    [nameInput, emailInput, phoneInput, messageInput].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', () => {
        if (inp.classList.contains('is-invalid') || inp.classList.contains('is-valid')) {
          if (inp === nameInput) validateName();
          else if (inp === emailInput) validateEmail();
          else if (inp === phoneInput) validatePhone();
          else if (inp === messageInput) validateMessage();
        }
      });
    });

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      const isInquiryValid = validateInquiry();
      const isMessageValid = validateMessage();

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isInquiryValid || !isMessageValid) {
        // Focus first invalid element
        const firstInvalid = contactForm.querySelector('.contact-input.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Enter loading state on submit button
      if (contactSubmitBtn) {
        contactSubmitBtn.classList.add('is-loading');
        contactSubmitBtn.setAttribute('disabled', 'true');
      }

      // Pre-fill WhatsApp link in success card with submission details
      if (contactSuccessCard) {
        const waSuccessBtn = contactSuccessCard.querySelector('.btn-whatsapp-success');
        if (waSuccessBtn) {
          const nameVal = nameInput ? nameInput.value.trim() : '';
          const purposeVal = inquirySelect ? inquirySelect.value : '';
          const waText = encodeURIComponent(`Hello The City Grammar School, I submitted a contact inquiry regarding "${purposeVal}". Name: ${nameVal}.`);
          waSuccessBtn.setAttribute('href', `https://wa.me/923452144982?text=${waText}`);
        }
      }

      // Simulate smooth submission delay
      setTimeout(() => {
        if (contactSubmitBtn) {
          contactSubmitBtn.classList.remove('is-loading');
          contactSubmitBtn.removeAttribute('disabled');
        }

        // Hide form and show animated success card
        contactForm.style.display = 'none';
        if (contactSuccessCard) {
          contactSuccessCard.classList.add('is-active');
          contactSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    });

    // "Send another message" reset button
    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener('click', () => {
        if (contactSuccessCard) {
          contactSuccessCard.classList.remove('is-active');
        }
        contactForm.style.display = '';
        contactForm.reset();

        // Clear validation styles
        contactForm.querySelectorAll('.contact-input').forEach(inp => {
          inp.classList.remove('is-valid', 'is-invalid');
        });
        contactForm.querySelectorAll('.field-validation-msg').forEach(msg => {
          msg.textContent = '';
          msg.classList.remove('is-visible');
        });

        if (nameInput) nameInput.focus();
      });
    }
  }
}

/* --------------------------------------------------------------------------
   10. INTELLIGENT LAZY MAP LOADING
   Loads Google Maps iframe only when user scrolls near it (Saves >1.5MB and 1.8s TBT)
   -------------------------------------------------------------------------- */
function initLazyMap() {
  const mapIframe = document.querySelector('.lazy-map-iframe');
  if (!mapIframe) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const src = mapIframe.getAttribute('data-src');
          if (src) {
            mapIframe.src = src;
            mapIframe.removeAttribute('data-src');
          }
          observer.disconnect();
        }
      });
    }, { rootMargin: '300px' });
    observer.observe(mapIframe);
  } else {
    const src = mapIframe.getAttribute('data-src');
    if (src) mapIframe.src = src;
  }
}

/* --------------------------------------------------------------------------
   11. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  function toggleBackToTop() {
    if (window.scrollY > 300) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
   12. SCROLL-DRIVEN STACKED CARDS DECK (TCGS Advantage Section)
   Smoothly tracks active card, updates counter (01 / 06), progress line,
   mobile sticky pill, and manages .is-active and .is-behind deck states.
   -------------------------------------------------------------------------- */
function initStackedAdvantageDeck() {
  const section = document.getElementById('whyChooseUs');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.stack-card'));
  if (!cards.length) return;

  const counterEl = document.getElementById('deckCounter');
  const fillEl = document.getElementById('deckProgressFill');
  const mobileCounterEl = document.getElementById('deckMobileCounter');
  const scrollHint = document.getElementById('deckScrollHint');

  let ticking = false;

  function updateDeckState() {
    const isMobile = window.innerWidth <= 1024;
    // Base sticky threshold offset from top of viewport
    const baseOffset = isMobile ? 85 : 125;

    let activeIdx = 0;

    // Check which card has scrolled into its sticky stacking position
    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const stickyThreshold = baseOffset + (idx * (isMobile ? 10 : 16)) + 25;
      if (rect.top <= stickyThreshold) {
        activeIdx = idx;
      }
    });

    // Update active and behind card classes
    cards.forEach((card, idx) => {
      if (idx === activeIdx) {
        card.classList.add('is-active');
        card.classList.remove('is-behind');
      } else if (idx < activeIdx) {
        card.classList.remove('is-active');
        card.classList.add('is-behind');
      } else {
        card.classList.remove('is-active');
        card.classList.remove('is-behind');
      }
    });

    // Format 2-digit numbers
    const currentNumStr = String(activeIdx + 1).padStart(2, '0');
    const totalNumStr = String(cards.length).padStart(2, '0');

    // 1. Update Desktop Counter
    if (counterEl) {
      counterEl.innerHTML = `${currentNumStr} <span class="deck-counter-total">/ ${totalNumStr}</span>`;
      const container = counterEl.closest('[aria-label]');
      if (container) {
        container.setAttribute('aria-label', `Advantage points progress: ${activeIdx + 1} of ${cards.length}`);
      }
    }

    // 2. Update Desktop Progress Line fill width
    if (fillEl) {
      const percent = ((activeIdx + 1) / cards.length) * 100;
      fillEl.style.width = `${percent}%`;
    }

    // 3. Update Mobile Sticky Pill counter
    if (mobileCounterEl) {
      mobileCounterEl.textContent = `${currentNumStr} / ${totalNumStr}`;
    }

    // 4. Fade out scroll hint once user starts scrolling into cards
    if (scrollHint) {
      const sectionRect = section.getBoundingClientRect();
      if (activeIdx > 0 || sectionRect.top < -50) {
        scrollHint.classList.add('is-hidden');
      } else {
        scrollHint.classList.remove('is-hidden');
      }
    }

    ticking = false;
  }

  function requestDeckUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateDeckState);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestDeckUpdate, { passive: true });
  window.addEventListener('resize', requestDeckUpdate, { passive: true });

  // Defer initial layout measurement so it never blocks FCP/LCP/TBT during initial page load
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(updateDeckState);
  } else {
    setTimeout(updateDeckState, 350);
  }
}

/* --------------------------------------------------------------------------
   13. INTERACTIVE GALLERY FILTERS & LIGHTBOX MODAL
   Smooth category filtering, count updates, full-screen lightbox preview,
   touch navigation, and keyboard shortcuts (ESC, Left, Right).
   -------------------------------------------------------------------------- */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const badge = document.getElementById('galleryCountBadge');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visibleCount = 0;

      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'flex';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (badge) {
        badge.textContent = `${visibleCount} Photo${visibleCount === 1 ? '' : 's'}`;
      }
    });
  });
}

function initGalleryLightbox() {
  const modal = document.getElementById('galleryLightbox');
  if (!modal) return;

  const imgEl = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const counterEl = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  const allItems = Array.from(document.querySelectorAll('.gallery-item'));
  let activeItems = [];
  let currentIndex = 0;

  function updateActiveItems() {
    activeItems = allItems.filter(item => item.style.display !== 'none');
  }

  function showPhoto(index) {
    updateActiveItems();
    if (!activeItems.length) return;

    if (index < 0) index = activeItems.length - 1;
    if (index >= activeItems.length) index = 0;

    currentIndex = index;
    const target = activeItems[currentIndex];
    const src = target.getAttribute('data-src') || target.querySelector('img')?.src;
    const title = target.getAttribute('data-title') || '';
    if (imgEl) {
      imgEl.src = src;
      imgEl.alt = title;
    }
    if (titleEl) {
      titleEl.textContent = title;
    }
    if (counterEl) {
      counterEl.textContent = `Photo ${currentIndex + 1} of ${activeItems.length}`;
    }
  }

  function openLightbox(index) {
    updateActiveItems();
    showPhoto(index);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  allItems.forEach(item => {
    item.addEventListener('click', () => {
      updateActiveItems();
      const visibleIdx = activeItems.indexOf(item);
      if (visibleIdx !== -1) {
        openLightbox(visibleIdx);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showPhoto(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showPhoto(currentIndex + 1));

  // Close on outside backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
  });
}

/* --------------------------------------------------------------------------
   14. THREE PROMISES - Auto-Advancing Tabs & Visual Panel
   -------------------------------------------------------------------------- */
function initPromisesSection() {
  const section = document.getElementById('promisesSection');
  if (!section) return;

  const tabBtns = section.querySelectorAll('.promise-tab-btn');
  const panels = section.querySelectorAll('.promise-panel-item');
  const progressBar = document.getElementById('promiseProgressBar');
  if (!tabBtns.length || !panels.length) return;

  let currentIdx = 0;
  let progressTimer = null;
  const duration = 6000;
  let startTime = Date.now();
  let isPaused = false;

  function switchPromise(index) {
    currentIdx = index;
    tabBtns.forEach((btn, idx) => {
      const active = (idx === index);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach((p, idx) => {
      if (idx === index) {
        p.style.display = 'block';
        p.classList.add('is-active');
      } else {
        p.style.display = 'none';
        p.classList.remove('is-active');
      }
    });

    resetProgress();
  }

  function resetProgress() {
    startTime = Date.now();
    if (progressBar) progressBar.style.width = '0%';
  }

  function tick() {
    if (!isPaused) {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      if (progressBar) progressBar.style.width = `${pct}%`;

      if (elapsed >= duration) {
        currentIdx = (currentIdx + 1) % tabBtns.length;
        switchPromise(currentIdx);
      }
    }
  }

  function startTimer() {
    stopTimer();
    startTime = Date.now();
    progressTimer = setInterval(tick, 50);
  }

  function stopTimer() {
    if (progressTimer) clearInterval(progressTimer);
  }

  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      switchPromise(idx);
      startTimer();
    });
  });

  // Pause on hover or touch
  section.addEventListener('mouseenter', () => { isPaused = true; });
  section.addEventListener('mouseleave', () => { isPaused = false; startTime = Date.now(); });
  section.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
  section.addEventListener('touchend', () => { isPaused = false; startTime = Date.now(); }, { passive: true });

  switchPromise(0);
  startTimer();
}

/* --------------------------------------------------------------------------
   15. STUDY AT TCGS - Equal Fixed Cards (No Resize)
   -------------------------------------------------------------------------- */
function initStudyTcgsSection() {
  const cards = document.querySelectorAll('.study-panel-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const link = card.querySelector('.study-panel-link');
      if (link && !e.target.closest('a')) {
        link.click();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   16. RESULT QUICK-CHECK BAND - In-Memory / SessionStorage Handshake
   -------------------------------------------------------------------------- */
function initQuickResultCheck() {
  const form = document.getElementById('quickResultForm');
  const classSelect = document.getElementById('quickClass');
  const yearSelect = document.getElementById('quickYear');
  if (!form) return;

  if (typeof CLASSES !== 'undefined' && classSelect && CLASSES.length > 0) {
    classSelect.innerHTML = '<option value="" disabled selected>Select Class</option>';
    CLASSES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      classSelect.appendChild(opt);
    });
  }

  if (typeof YEARS !== 'undefined' && yearSelect && YEARS.length > 0) {
    yearSelect.innerHTML = '<option value="" disabled selected>Select Year</option>';
    YEARS.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const roll = document.getElementById('quickRoll')?.value.trim() || '';
    const classVal = classSelect?.value || '';
    const yearVal = yearSelect?.value || '';

    if (!roll || !classVal || !yearVal) {
      alert('Please fill in Roll No, Class, and Year.');
      return;
    }

    try {
      sessionStorage.setItem('tcgs_quick_check', JSON.stringify({
        roll: roll,
        classVal: classVal,
        yearVal: yearVal
      }));
    } catch (err) {
      console.error('Session storage error:', err);
    }

    window.location.href = 'online-result.html';
  });
}

/* --------------------------------------------------------------------------
   17. SINCE 1992 - Scroll-Drawn Timeline & Parallax
   -------------------------------------------------------------------------- */
function initSince1992Section() {
  const countEl = document.getElementById('servingYearsCount');
  const fillEl = document.getElementById('sinceTimelineFill');
  const outlineNum = document.querySelector('.since-outline-num');

  const startYear = typeof ESTABLISHED_YEAR !== 'undefined' ? ESTABLISHED_YEAR : 1992;
  const currentYr = new Date().getFullYear();
  const totalYears = Math.max(currentYr - startYear, 32);

  if (countEl) {
    countEl.textContent = totalYears;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          if (fillEl) fillEl.classList.add('drawn');

          let cur = 0;
          const step = Math.max(1, Math.floor(totalYears / 30));
          const interval = setInterval(() => {
            cur += step;
            if (cur >= totalYears) {
              cur = totalYears;
              clearInterval(interval);
            }
            countEl.textContent = cur;
          }, 35);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(countEl.closest('.since-1992-section') || countEl);
  }

  if (outlineNum) {
    window.addEventListener('scroll', () => {
      const rect = outlineNum.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * 0.08;
        outlineNum.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
      }
    }, { passive: true });
  }
}

/* --------------------------------------------------------------------------
   18. NEWSLETTER SUBSCRIPTION STRIP - Anti-Spam Honeypot & UX
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const feedback = document.getElementById('newsletterFeedback');
  const emailInput = document.getElementById('newsletterEmail');
  const submitBtn = document.getElementById('btnNewsletterSubmit');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot check
    const hp = form.querySelector('input[name="news_hp"]')?.value;
    if (hp) {
      form.reset();
      return;
    }

    const email = emailInput?.value.trim() || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (feedback) {
        feedback.className = 'newsletter-feedback-msg is-error';
        feedback.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribed ✓';
    }
    if (feedback) {
      feedback.className = 'newsletter-feedback-msg is-success';
      feedback.textContent = 'Thank you for subscribing to school announcements!';
    }
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   19. INSTAGRAM LINK VISIBILITY - Config Driven
   -------------------------------------------------------------------------- */
function initInstagramSocialLinks() {
  const isUrlSet = typeof INSTAGRAM_URL !== 'undefined' && INSTAGRAM_URL && INSTAGRAM_URL.trim() !== '';
  const instaLinks = document.querySelectorAll('.social-icon-instagram');

  instaLinks.forEach(link => {
    if (!isUrlSet) {
      link.style.display = 'none';
    } else {
      link.style.display = '';
      link.setAttribute('href', INSTAGRAM_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/* --------------------------------------------------------------------------
   20. DYNAMIC COPYRIGHT YEAR
   -------------------------------------------------------------------------- */
function initCurrentYear() {
  const yearEls = document.querySelectorAll('#currentYear');
  const cur = new Date().getFullYear();
  yearEls.forEach(el => {
    el.textContent = cur;
  });
}

/* --------------------------------------------------------------------------
   21. MILAD FUNCTION PICTURE SLIDER (Home Page Continuous Reel)
   -------------------------------------------------------------------------- */
function initMiladSlider() {
  const section = document.getElementById('miladFunction');
  const track = document.getElementById('miladSliderTrack');
  if (!section || !track) return;
  track.style.transform = '';

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add('is-inview');
          track.style.animationPlayState = 'running';
        } else {
          track.style.animationPlayState = 'paused';
        }
      });
    }, { rootMargin: '150px' });
    observer.observe(section);
  } else {
    section.classList.add('is-inview');
    track.style.animationPlayState = 'running';
  }
}

/* --------------------------------------------------------------------------
   22. ETHICAL COMPASS - "Two Arch Doors and a Compass"
   Handles: Staggered arch entry, spring needle settle, hover/focus/tap needle
   rotation toward active arch, sibling dimming, and mobile tap-to-expand chips.
   -------------------------------------------------------------------------- */
function initEthicalCompassSection() {
  const stages = document.querySelectorAll('[data-compass-stage]');
  if (!stages.length) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  stages.forEach(stage => {
    const leftArch = stage.querySelector('[data-arch="left"]');
    const rightArch = stage.querySelector('[data-arch="right"]');
    const needle = stage.querySelector('[data-compass-needle]');
    if (!leftArch || !rightArch) return;

    // Progressive enhancement for staggered entry animation
    if (!prefersReducedMotion) {
      stage.classList.add('js-compass-ready');
    }

    // Set initial mobile accordion state (< 768px: left arch open, right arch collapsed so tap expands it)
    function syncResponsiveExpandState(isInitial) {
      const isMobile = window.innerWidth < 768;
      if (isMobile && isInitial) {
        leftArch.classList.add('is-expanded');
        rightArch.classList.remove('is-expanded');
      } else if (!isMobile) {
        leftArch.classList.add('is-expanded');
        rightArch.classList.add('is-expanded');
      }
    }
    syncResponsiveExpandState(true);
    window.addEventListener('resize', () => syncResponsiveExpandState(false), { passive: true });

    // Point compass needle toward 'left', 'right', or 'idle'
    function pointCompass(direction) {
      const isMobile = window.innerWidth < 768;
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      stage.classList.add('has-interacted');
      if (needle) needle.classList.remove('is-settling');

      if (direction === 'left') {
        stage.classList.add('has-active-left');
        stage.classList.remove('has-active-right');
        const angle = isMobile ? 0 : (isRtl ? 68 : -68);
        if (needle) needle.style.setProperty('--needle-angle', `${angle}deg`);
      } else if (direction === 'right') {
        stage.classList.add('has-active-right');
        stage.classList.remove('has-active-left');
        const angle = isMobile ? 180 : (isRtl ? -68 : 68);
        if (needle) needle.style.setProperty('--needle-angle', `${angle}deg`);
      } else {
        stage.classList.remove('has-active-left', 'has-active-right');
        if (needle) needle.style.setProperty('--needle-angle', '0deg');
      }
    }

    // Hover & Focus events
    [leftArch, rightArch].forEach(arch => {
      const dir = arch.getAttribute('data-arch');

      arch.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) {
          pointCompass(dir);
        }
      });

      arch.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768 && document.activeElement !== leftArch && document.activeElement !== rightArch) {
          pointCompass('idle');
        }
      });

      arch.addEventListener('focus', () => {
        pointCompass(dir);
      });

      arch.addEventListener('blur', () => {
        setTimeout(() => {
          if (document.activeElement !== leftArch && document.activeElement !== rightArch) {
            pointCompass('idle');
          }
        }, 50);
      });

      // Click / Tap: swing needle to tapped arch, and on mobile (<768px) expand/toggle its chips
      arch.addEventListener('click', () => {
        pointCompass(dir);
        if (window.innerWidth < 768) {
          const willExpand = !arch.classList.contains('is-expanded');
          arch.classList.toggle('is-expanded', willExpand);
        }
      });

      // Keyboard Enter / Space support
      arch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          arch.click();
        }
      });
    });

    // Scroll entry observer: stagger arch rise-in and spring-settle needle
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            stage.classList.add('is-inview');
            if (needle) {
              needle.classList.add('is-settling');
              setTimeout(() => {
                needle.classList.remove('is-settling');
              }, 1400);
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(stage);
    } else {
      stage.classList.add('is-inview');
    }
  });
}





