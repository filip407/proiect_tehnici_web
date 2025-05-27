class ThemeManager {
    constructor() {
        this.storageKey = 'elitekits-theme';
        this.currentTheme = 'light';
        this.button = null;
        
        this.init();
    }
    
    init() {
        this.loadSavedTheme();
        this.createThemeToggleButton();
        this.applyTheme(this.currentTheme);
        this.attachEventListeners();
        
        console.log('Theme Manager inițializat cu tema:', this.currentTheme);
    }
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(this.storageKey);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                this.currentTheme = savedTheme;
            } else {
                this.currentTheme = 'light';
                this.saveTheme();
            }
        } catch (error) {
            console.log('Nu s-a putut încărca tema din localStorage:', error);
            this.currentTheme = 'light';
        }
    }
    saveTheme() {
        try {
            localStorage.setItem(this.storageKey, this.currentTheme);
        } catch (error) {
            console.log('Nu s-a putut salva tema în localStorage:', error);
        }
    }
    createThemeToggleButton() {
        const existingButton = document.getElementById('theme-toggle-btn');
        if (existingButton) {
            this.button = existingButton;
            return;
        }
        this.button = document.createElement('button');
        this.button.id = 'theme-toggle-btn';
        this.button.className = 'theme-toggle';
        this.button.setAttribute('aria-label', 'Schimbă tema');
        this.button.setAttribute('title', 'Schimbă între tema light și dark');
        this.button.innerHTML = `
            <i class="fas fa-sun sun-icon" aria-hidden="true"></i>
            <i class="fas fa-moon moon-icon" aria-hidden="true"></i>
        `;
        document.body.appendChild(this.button);
    }
    attachEventListeners() {
        if (this.button) {
            this.button.addEventListener('click', () => {
                this.toggleTheme();
            });
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue !== this.currentTheme) {
                this.currentTheme = e.newValue || 'light';
                this.applyTheme(this.currentTheme);
                this.updateButtonState();
            }
        });
    }
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Temă nevalidă:', theme);
            return;
        }
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme();
        this.updateButtonState();
        
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme }
        }));
        
        console.log('Tema schimbată la:', theme);
    }
    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        this.updateThemeColorMeta(theme);
    }
    
    updateThemeColorMeta(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        const themeColor = theme === 'dark' ? '#1E1E1E' : '#076104';
        metaThemeColor.content = themeColor;
    }
    
    updateButtonState() {
        if (!this.button) return;
        
        const title = this.currentTheme === 'light' 
            ? 'Schimbă la tema întunecată' 
            : 'Schimbă la tema luminoasă';
            
        this.button.setAttribute('title', title);
        this.button.setAttribute('aria-label', title);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    resetTheme() {
        this.setTheme('light');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const checkFontAwesome = () => {
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-sun';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        const computed = window.getComputedStyle(testElement);
        const isLoaded = computed.fontFamily.includes('Font Awesome');
        
        document.body.removeChild(testElement);
        return isLoaded;
    };

    if (checkFontAwesome()) {
        window.themeManager = new ThemeManager();
    } else {
        const maxWait = 3000;
        const startTime = Date.now();
        
        const waitForFontAwesome = () => {
            if (checkFontAwesome() || Date.now() - startTime > maxWait) {
                window.themeManager = new ThemeManager();
            } else {
                setTimeout(waitForFontAwesome, 100);
            }
        };
        
        setTimeout(waitForFontAwesome, 100);
    }
});
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}