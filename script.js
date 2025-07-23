document.addEventListener('DOMContentLoaded', () => {

    // --- 1. تحميل المكونات المشتركة (Header & Footer) ---
    const loadCommonComponents = () => {
        const headerContainer = document.querySelector('.main-header');
        const footerContainer = document.querySelector('.main-footer');
        if (!headerContainer || !footerContainer) return;
        const headerHTML = `
            <div class="container">
                <a href="index.html" class="logo" data-i18n="companyName">[اسم المحل]</a>
                <nav class="main-nav">
                    <ul>
                        <li><a href="index.html" data-i18n="navHome"></a></li>
                        <li><a href="products.html" data-i18n="navProducts"></a></li>
                        <li><a href="projects.html" data-i18n="navProjects"></a></li>
                        <li><a href="calculator.html" data-i18n="navCalculator"></a></li>
                        <li><a href="plasma-calculator.html" data-i18n="navPlasmaCalc"></a></li>
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

    // --- 2. إدارة الإعدادات والترجمة ---
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
            if (!response.ok) return;
            translations = await response.json();
        } catch (error) { return; }
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                const value = translations[key];
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') element.placeholder = value;
                else if (element.tagName === 'META' && element.name === 'description') element.content = value;
                else if (element.tagName === 'TITLE') document.title = value;
                else element.innerHTML = value;
            }
        });
        const whatsappLink = document.getElementById('whatsapp-link');
        if (whatsappLink && translations.whatsappMessage) {
            const phoneNumber = '213775458700';
            const message = encodeURIComponent(translations.whatsappMessage);
            whatsappLink.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
        }
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        updateActiveNav();
    };

    // --- 3. ربط الأحداث ---
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
    
    // --- 4. دوال مساعدة ---
    function updateThemeIcon(mode) {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) themeToggleButton.innerHTML = mode === 'dark' ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
    }
    function updateActiveThemeButton(theme) {
        document.querySelectorAll('.theme-colors button').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
    }
    function updateActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === currentPage));
    }

    // --- 5. وظائف خاصة بالصفحات ---
    function initializePageSpecificScripts() {
        // كود حاسبة قص البلازما (المنطق الجديد)
        const plasmaForm = document.getElementById('plasma-calculator-form');
        if (plasmaForm) {
            const sheetTypeSelect = document.getElementById('sheet-type');
            const sheetSizeSelect = document.getElementById('sheet-size');
            
            const standardParts = [
                { id: 1, type: 'N4', name: 'نصف صفيحة صغيرة (100x100)', name_en: 'Half Small Sheet (100x100)', name_fr: 'Demi-tôle petite (100x100)', width: 100, length: 100, price: 450000 },
                { id: 2, type: 'N4', name: 'صفيحة كاملة صغيرة (100x200)', name_en: 'Full Small Sheet (100x200)', name_fr: 'Tôle complète petite (100x200)', width: 100, length: 200, price: 900000 },
                { id: 3, type: 'N4', name: 'نصف صفيحة كبيرة (125x125)', name_en: 'Half Large Sheet (125x125)', name_fr: 'Demi-tôle grande (125x125)', width: 125, length: 125, price: 650000 },
                { id: 4, type: 'N4', name: 'صفيحة كاملة كبيرة (125x250)', name_en: 'Full Large Sheet (125x250)', name_fr: 'Tôle complète grande (125x250)', width: 125, length: 250, price: 1300000 },
                { id: 5, type: 'N3', name: 'نصف صفيحة صغيرة (100x100)', name_en: 'Half Small Sheet (100x100)', name_fr: 'Demi-tôle petite (100x100)', width: 100, length: 100, price: 400000 },
                { id: 6, type: 'N3', name: 'صفيحة كاملة صغيرة (100x200)', name_en: 'Full Small Sheet (100x200)', name_fr: 'Tôle complète petite (100x200)', width: 100, length: 200, price: 800000 },
                { id: 7, type: 'N3', name: 'نصف صفيحة كبيرة (125x125)', name_en: 'Half Large Sheet (125x125)', name_fr: 'Demi-tôle grande (125x125)', width: 125, length: 125, price: 575000 },
                { id: 8, type: 'N3', name: 'صفيحة كاملة كبيرة (125x250)', name_en: 'Full Large Sheet (125x250)', name_fr: 'Tôle complète grande (125x250)', width: 125, length: 250, price: 1150000 },
                { id: 9, type: 'N24', name: 'نصف صفيحة كبيرة (125x125)', name_en: 'Half Large Sheet (125x125)', name_fr: 'Demi-tôle grande (125x125)', width: 125, length: 125, price: 500000 },
                { id: 10, type: 'N24', name: 'صفيحة كاملة كبيرة (125x250)', name_en: 'Full Large Sheet (125x250)', name_fr: 'Tôle complète grande (125x250)', width: 125, length: 250, price: 1000000 }
            ];

            sheetTypeSelect.addEventListener('change', () => {
                const selectedType = sheetTypeSelect.value;
                sheetSizeSelect.innerHTML = `<option value="" disabled selected>${translations.selectOption || '-- اختر --'}</option>`;
                const relevantParts = standardParts.filter(p => p.type === selectedType);
                const lang = document.documentElement.lang;

                relevantParts.forEach(part => {
                    let partName = part.name;
                    if (lang === 'en') partName = part.name_en;
                    if (lang === 'fr') partName = part.name_fr;
                    const option = new Option(partName, part.id);
                    sheetSizeSelect.add(option);
                });
                sheetSizeSelect.disabled = false;
            });

            plasmaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const chosenPartId = parseInt(sheetSizeSelect.value);
                const pieceWidth = parseFloat(document.getElementById('piece-width').value);
                const pieceLength = parseFloat(document.getElementById('piece-length').value);
                const resultsOutput = document.getElementById('plasma-results-output');

                if (!chosenPartId || isNaN(pieceWidth) || isNaN(pieceLength) || pieceWidth <= 0 || pieceLength <= 0) {
                    resultsOutput.innerHTML = `<p style="color: red;">${translations.fillAllFields || 'الرجاء ملء جميع الحقول بشكل صحيح.'}</p>`;
                    return;
                }

                const chosenPart = standardParts.find(p => p.id === chosenPartId);
                const canFit = (pieceWidth <= chosenPart.width && pieceLength <= chosenPart.length) || (pieceWidth <= chosenPart.length && pieceLength <= chosenPart.width);

                if (!canFit) {
                    resultsOutput.innerHTML = `<p style="color: red;">${translations.pieceTooLarge || 'القطعة المطلوبة أكبر من حجم الصفيحة المختارة.'}</p>`;
                    return;
                }

                const materialCost = chosenPart.price;
                const perimeterCm = (pieceWidth + pieceLength) * 2;
                let serviceCost = 0;
                if (perimeterCm > 5) {
                    serviceCost = (perimeterCm / 100) * 125000;
                }
                const totalCost = materialCost + serviceCost;

                // حساب الجزء المتبقي
                const sheetArea = chosenPart.width * chosenPart.length;
                const pieceArea = pieceWidth * pieceLength;
                const remainingArea = sheetArea - pieceArea;
                // الأبعاد المتبقية (افتراض القص من الزاوية)
                const remainingDim1 = chosenPart.width - pieceWidth;
                const remainingDim2 = chosenPart.length - pieceLength;

                resultsOutput.innerHTML = `
                    <div class="result-breakdown">
                        <div class="cost-item">
                            <span>${translations.materialCost || 'تكلفة المادة:'}</span>
                            <span>${materialCost.toLocaleString('fr-FR')} د.ج</span>
                        </div>
                        <div class="cost-item">
                            <span>${translations.serviceCost || 'تكلفة خدمة القص:'}</span>
                            <span>${serviceCost.toLocaleString('fr-FR')} د.ج</span>
                        </div>
                        <hr>
                        <div class="cost-total">
                            <span>${translations.totalCost || 'التكلفة الإجمالية:'}</span>
                            <span class="price">${totalCost.toLocaleString('fr-FR')} د.ج</span>
                        </div>
                    </div>
                    <div class="remaining-part">
                        <h4>${translations.remainingTitle || 'الجزء المتبقي من الصفيحة:'}</h4>
                        <p>${translations.remainingArea || 'المساحة المتبقية:'} <strong>${remainingArea.toFixed(2)} سم²</strong></p>
                        <p>${translations.remainingDims || 'الأبعاد المتبقية (تقريبيًا):'} <strong>${remainingDim1.toFixed(1)}سم</strong> و <strong>${remainingDim2.toFixed(1)}سم</strong></p>
                    </div>
                `;
            });
        }
    }
    // --- 6. التشغيل ---
    async function initializeSite() {
        loadCommonComponents();
        await applyPreferences();
        setupEventListeners();
        initializePageSpecificScripts();
    }
    initializeSite();
    // Re-deploy trigger
});
