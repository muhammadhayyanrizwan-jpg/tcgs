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

  // 10. Automatic Logo Transparency Processing
  initLogoTransparency();

  // 11. Back to Top Button
  initBackToTop();
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
  const revealElements = document.querySelectorAll('.reveal-fade-up');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
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
          const target = parseFloat(counter.getAttribute('data-target') || counter.textContent);
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
   10. AUTOMATIC LOGO TRANSPARENCY PROCESSING
   -------------------------------------------------------------------------- */
function initLogoTransparency() {
  const logos = document.querySelectorAll('.brand-logo-img:not(.footer-logo-img)');
  if (!logos.length) return;

  const cached = sessionStorage.getItem('tcgs_transparent_logo');
  if (cached) {
    logos.forEach(img => {
      img.src = cached;
      img.classList.add('is-transparent-processed');
    });
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const maxVal = Math.max(d[i], d[i+1], d[i+2]);
        if (maxVal < 32) {
          d[i+3] = 0; // Pure transparent
        } else if (maxVal < 65) {
          d[i+3] = Math.round(((maxVal - 32) / 33) * d[i+3]); // Smooth edge antialiasing
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      try {
        sessionStorage.setItem('tcgs_transparent_logo', dataUrl);
      } catch (err) {}
      logos.forEach(el => {
        el.src = dataUrl;
        el.classList.add('is-transparent-processed');
      });
    } catch (e) {
      // SVG filter fallback in CSS handles transparency under all conditions
    }
  };
  img.src = 'FINAL%20LOGO.png';
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
  toggleBackToTop();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

