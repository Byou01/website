document.addEventListener('DOMContentLoaded', () => {

    // --- 1. تحميل المكونات المشتركة (Header & Footer) ---
    const loadCommonComponents = () => {
        const headerContainer = document.querySelector('.main-header');
        const footerContainer = document.querySelector('.main-footer');
        
        if (!headerContainer || !footerContainer) return;

        // HTML للشريط العلوي مع أدوات التحكم الجديدة
        const headerHTML = `
            <div class="container">
                <a href="index.html" class="logo" data-i18n="companyName">[اسم المحل]</a>
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
                    <button id="theme-toggle" class="control-btn" title="Toggle dark/light mode">
                        <i class="fas fa-moon"></i>
                    </button>
                    <div class="lang-switcher">
                        <select id="language-selector">
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                </div>
            </div>`;

        const footerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-about">
                        <h3 class="logo" data-i18n="companyName">[اسم المحل]</h3>
                        <p data-i18n="partnerText"></p>
                    </div>
                    <div class="footer-links">
                        <h3 data-i18n="navLinks"></h3>
                        <ul>
                            <li><a href="products.html" data-i18n="navProducts"></a></li>
                            <li><a href="projects.html" data-i18n="navProjects"></a></li>
                            <li><a href="contact.html" data-i18n="navContact"></a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 <span data-i18n="companyName">[اسم المحل]</span>. <span data-i18n="footerRights"></span></p>
                </div>
            </div>`;

        headerContainer.innerHTML = headerHTML;
        footerContainer.innerHTML = footerHTML;
    };

    // --- 2. إدارة الإعدادات المحفوظة (Theme, Mode, Language) ---
    
    let translations = {};

    const applyPreferences = async () => {
        const savedMode = localStorage.getItem('mode') || 'light';
        document.body.classList.toggle('dark-mode', savedMode === 'dark');
        updateThemeIcon(savedMode);

        const savedTheme = localStorage.getItem('theme') || 'gold';
        document.body.setAttribute('data-theme', savedTheme);
        updateActiveThemeButton(savedTheme);

        const savedLang = localStorage.getItem('language') || 'ar';
        const languageSelector = document.getElementById('language-selector');
        if(languageSelector) languageSelector.value = savedLang;
        await setLanguage(savedLang);
    };
    
    const setLanguage = async (lang) => {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                console.error(`Translation file for ${lang} not found.`);
                return;
            }
            translations = await response.json();
        } catch (error) {
            console.error("Could not load translation file:", error);
            return;
        }
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                const value = translations[key];
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else if (element.tagName === 'META' && element.name === 'description') {
                    element.content = value;
                } else if (element.tagName === 'TITLE') {
                    document.title = value;
                } else {
                    element.innerHTML = value;
                }
            }
        });

        // --- تحديث رابط الواتساب بالرسالة المترجمة ---
        const whatsappLink = document.getElementById('whatsapp-link');
        if (whatsappLink && translations.whatsappMessage) {
            const phoneNumber = '213775458700';
            const message = encodeURIComponent(translations.whatsappMessage);
            const newHref = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
            whatsappLink.setAttribute('href', newHref);
        }
        
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        updateActiveNav();
    };

    // --- 3. ربط الأحداث مع أزرار التحكم ---
    const setupEventListeners = () => {
        const themeToggleButton = document.getElementById('theme-toggle');
        if(themeToggleButton) {
            themeToggleButton.addEventListener('click', () => {
                const isDarkMode = document.body.classList.toggle('dark-mode');
                const newMode = isDarkMode ? 'dark' : 'light';
                localStorage.setItem('mode', newMode);
                updateThemeIcon(newMode);
            });
        }

        const themeColorButtons = document.querySelectorAll('.theme-colors button');
        themeColorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                updateActiveThemeButton(theme);
            });
        });

        const languageSelector = document.getElementById('language-selector');
        if(languageSelector){
            languageSelector.addEventListener('change', (e) => {
                const selectedLang = e.target.value;
                localStorage.setItem('language', selectedLang);
                setLanguage(selectedLang);
            });
        }
    };
    
    // --- 4. دوال مساعدة لتحديث الواجهة ---
    function updateThemeIcon(mode) {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.innerHTML = mode === 'dark' ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
        }
    }
    
    function updateActiveThemeButton(theme) {
        document.querySelectorAll('.theme-colors button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    function updateActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === currentPage);
        });
    }

    // --- 5. وظائف خاصة بالصفحات ---
    function initializePageSpecificScripts() {
        // كود الآلة الحاسبة
        const calculatorForm = document.getElementById('price-calculator');
        if (calculatorForm) {
            const pricesPerKg = { beams: 150, plates: 140, rods: 130 }; // أسعار وهمية
            calculatorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('iron-type').value;
                const quantity = parseFloat(document.getElementById('quantity').value);
                const resultsOutput = document.getElementById('results-output');
                
                if (isNaN(quantity) || quantity <= 0) {
                    resultsOutput.innerHTML = `<p style="color: red;">${translations.invalidInput || 'الرجاء إدخال كمية صالحة.'}</p>`;
                    return;
                }
                const pricePerUnit = pricesPerKg[type];
                const totalPrice = (quantity * pricePerUnit).toLocaleString(document.documentElement.lang.startsWith('en') ? 'en-US' : 'fr-FR');
                resultsOutput.innerHTML = `
                    <p>${translations.estimatedCost || 'التكلفة التقديرية:'}</p>
                    <p class="price">${totalPrice} DZD</p>
                    <small>${translations.priceDisclaimer || '*الأسعار تقديرية وقد تختلف.'}</small>
                `;
            });
        }
        // تم حذف كود نموذج التواصل لأنه لم يعد ضرورياً بعد استخدام Formspree
    }

    // --- 6. التشغيل ---
    async function initializeSite() {
        loadCommonComponents();
        await applyPreferences();
        setupEventListeners();
        initializePageSpecificScripts();
    }

    initializeSite();
});