document.addEventListener('DOMContentLoaded', () => {
    // --- الجزء الأول: تحميل المكونات المشتركة والترجمة ---

    const loadCommonComponents = () => {
        const headerContainer = document.querySelector('.main-header .container');
        if (!headerContainer) return;

        // HTML للشريط العلوي مع إضافة أدوات التحكم بالثيم
        const headerContent = `
            <div class="logo">[اسم المحل]</div>
            <nav class="main-nav">
                <ul>
                    <li><a href="index.html" data-i18n="navHome"></a></li>
                    <li><a href="products.html" data-i18n="navProducts"></a></li>
                    <li><a href="projects.html" data-i18n="navProjects"></a></li>
                    <li><a href="calculator.html" data-i18n="navCalculator"></a></li>
                    <li><a href="contact.html" data-i18n="navContact"></a></li>
                </ul>
            </nav>
            <div class="controls-container">
                <div class="theme-colors">
                    <button class="color-gold" data-theme="gold" title="Theme Gold"></button>
                    <button class="color-blue" data-theme="blue" title="Theme Blue"></button>
                    <button class="color-green" data-theme="green" title="Theme Green"></button>
                </div>
                <div class="theme-switcher">
                    <button id="theme-toggle" title="Toggle dark/light mode">
                        <i class="fas fa-moon"></i>
                    </button>
                </div>
                <div class="lang-switcher">
                    <select id="language-selector">
                        <option value="ar">العربية</option>
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>`;

        const footerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-about">
                        <h3>[اسم المحل]</h3>
                        <p data-i18n="partnerText"></p>
                    </div>
                    <div class="footer-links">
                        <h3 data-i18n="navLinks">روابط سريعة</h3>
                        <ul>
                            <li><a href="products.html" data-i18n="navProducts"></a></li>
                            <li><a href="projects.html" data-i18n="navProjects"></a></li>
                            <li><a href="contact.html" data-i18n="navContact"></a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 [اسم المحل]. جميع الحقوق محفوظة.</p>
                </div>
            </div>`;

        headerContainer.innerHTML = headerContent;
        document.querySelector('.main-footer').innerHTML = footerHTML;

        // بعد تحميل المكونات، نقوم بإعداد كل شيء
        setupLanguageSwitcher();
        setupThemeControls();
    };

    // قاموس لتخزين الترجمات المحملة
    let translations = {};

    // دالة لجلب ملف الترجمة وتحديث المحتوى
    const setLanguage = async (lang) => {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) return;
            translations = await response.json();
        } catch (error) {
            console.error("Could not load translation file:", error);
            return;
        }
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if(element.placeholder) element.placeholder = translations[key];
                } else if (element.tagName === 'META') {
                     if(element.name === 'description') element.content = translations[key];
                } else {
                    element.innerHTML = translations[key];
                }
            }
        });
        
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        updateActiveNav();
    };

    const setupLanguageSwitcher = () => {
        const languageSelector = document.getElementById('language-selector');
        if (!languageSelector) return;
        const savedLang = localStorage.getItem('language') || 'ar';
        
        languageSelector.value = savedLang;
        setLanguage(savedLang);

        languageSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            localStorage.setItem('language', selectedLang);
            setLanguage(selectedLang);
        });
    };
    
    // --- الجزء الجديد: التحكم بالثيم والوضع الليلي ---
    const setupThemeControls = () => {
        const themeToggleButton = document.getElementById('theme-toggle');
        const themeColorButtons = document.querySelectorAll('.theme-colors button');

        // تطبيق الوضع المحفوظ
        const currentMode = localStorage.getItem('mode') || 'light';
        document.body.classList.toggle('dark-mode', currentMode === 'dark');
        updateThemeIcon(currentMode);

        // تطبيق الثيم المحفوظ
        const currentTheme = localStorage.getItem('theme') || 'gold';
        document.body.setAttribute('data-theme', currentTheme);
        updateActiveThemeButton(currentTheme);

        // حدث زر الوضع الليلي
        themeToggleButton.addEventListener('click', () => {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            const newMode = isDarkMode ? 'dark' : 'light';
            localStorage.setItem('mode', newMode);
            updateThemeIcon(newMode);
        });

        // أحداث أزرار الألوان
        themeColorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                updateActiveThemeButton(theme);
            });
        });
    };

    function updateThemeIcon(mode) {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.innerHTML = mode === 'dark' ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
        }
    }
    
    function updateActiveThemeButton(theme) {
        document.querySelectorAll('.theme-colors button').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }

    // --- وظائف مساعدة ---
    const updateActiveNav = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    };

    // --- الجزء الثاني: وظائف الصفحات التفاعلية (الآلة الحاسبة، نموذج التواصل) ---
    // (الكود هنا لم يتغير، سيبقى كما هو)
    const calculatorForm = document.getElementById('price-calculator');
    if (calculatorForm) {
        const pricesPerKg = { beams: 150, plates: 140, rods: 130 };
        calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('iron-type').value;
            const quantity = parseFloat(document.getElementById('quantity').value);
            const resultsOutput = document.getElementById('results-output');
            const lang = localStorage.getItem('language') || 'ar';

            if (isNaN(quantity) || quantity <= 0) {
                resultsOutput.innerHTML = `<p style="color: var(--danger-color);">${translations.invalidInput || 'الرجاء إدخال كمية صالحة.'}</p>`;
                return;
            }
            const pricePerUnit = pricesPerKg[type];
            const totalPrice = (quantity * pricePerUnit).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');
            resultsOutput.innerHTML = `
                <p>${translations.estimatedCost || 'التكلفة التقديرية:'}</p>
                <p class="price">${totalPrice} DZD</p>
                <small>${translations.priceDisclaimer || '*الأسعار تقديرية وقد تختلف.'}</small>
            `;
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let feedbackDiv = document.getElementById('form-feedback');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.id = 'form-feedback';
                contactForm.appendChild(feedbackDiv);
            }
            feedbackDiv.textContent = translations.formSuccess || 'شكراً لك! تم استلام طلبك وسنتواصل معك قريباً.';
            feedbackDiv.className = 'success';
            feedbackDiv.style.display = 'block';
            contactForm.reset();
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
            }, 5000);
        });
    }

    // --- بدء تشغيل كل شيء ---
    loadCommonComponents();
});
