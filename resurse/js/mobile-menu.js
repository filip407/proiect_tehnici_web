/* ETAPA 3: Meniu responsive pentru ecrane mici */

document.addEventListener('DOMContentLoaded', function() {
    const BREAKPOINT_MOBILE = 768;
    
    const header = document.querySelector('header');
    const desktopMenu = document.querySelector('nav > ul');
    
    const mainCategories = {
        "Acasa": false,
        "Catalog": true,
        "Promotii": true, 
        "Contul de utilizator": true,
        "Resurse": true,
        "Contact": true,
        "Cos de cumparaturi": true
    };
    
    // Creaza structura completa a meniului mobil
    function createMobileMenu() {
        createHamburgerButton();
        createMobileMenuContainer();
        createOverlay();
        setupEventListeners();
        hideSubcategoriesFromMainMenu();
    }
    
    // ETAPA 3, Bonus: Icon-ul hamburger creat cu 3 divuri
    function createHamburgerButton() {
        const hamburgerButton = document.createElement('div');
        hamburgerButton.className = 'hamburger-menu';
        hamburgerButton.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(hamburgerButton, header.firstChild);
    }
    
    // Creaza containerul meniului mobil cu iconul home
    function createMobileMenuContainer() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        const homeIcon = document.createElement('div');
        homeIcon.className = 'home-icon';
        homeIcon.innerHTML = '<a href="/"><i class="fa-solid fa-house"></i></a>';
        mobileMenu.appendChild(homeIcon);
        
        const mobileMenuList = document.createElement('ul');
        mobileMenuList.className = 'mobile-menu-list';
        
        populateMobileMenu(mobileMenuList);
        
        mobileMenu.appendChild(mobileMenuList);
        document.body.appendChild(mobileMenu);
    }
    
    // Populeaza meniul mobil cu elemente din meniul desktop
    function populateMobileMenu(mobileMenuList) {
        if (!desktopMenu) return;
        
        const menuItems = desktopMenu.querySelectorAll('li');
        
        menuItems.forEach(function(item, index) {
            if (index === 0) return;
            
            const mainLink = item.querySelector('a');
            if (!mainLink) return;
            
            const linkText = mainLink.textContent.trim();
            
            if (mainCategories[linkText]) {
                const newItem = document.createElement('li');
                const newLink = document.createElement('a');
                newLink.href = mainLink.href;
                newLink.textContent = linkText;
                newItem.appendChild(newLink);
                
                addSubmenuIfExists(item, newItem);
                
                mobileMenuList.appendChild(newItem);
            }
        });
    }
    
    // Adauga submeniu daca exista
    function addSubmenuIfExists(originalItem, newItem) {
        const submenu = originalItem.querySelector('ul');
        if (!submenu) return;
        
        const newSubmenu = document.createElement('ul');
        newSubmenu.className = 'submenu';
        
        const submenuItems = submenu.querySelectorAll('li');
        submenuItems.forEach(function(subItem) {
            const newSubItem = document.createElement('li');
            const subLink = subItem.querySelector('a');
            
            if (subLink) {
                const newSubLink = document.createElement('a');
                newSubLink.href = subLink.href;
                newSubLink.textContent = subLink.textContent;
                newSubItem.appendChild(newSubLink);
                newSubmenu.appendChild(newSubItem);
            }
        });
        
        newItem.appendChild(newSubmenu);
    }
    
    // Creaza overlay-ul pentru inchiderea meniului
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Configureaza event listeners pentru meniul mobil
    function setupEventListeners() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        
        if (!hamburgerButton || !mobileMenu || !overlay) return;
        
        hamburgerButton.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !hamburgerButton.contains(e.target)) {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
    
    // Ascunde subcategoriile din meniul principal
    function hideSubcategoriesFromMainMenu() {
        if (!desktopMenu) return;
        
        const mainMenuItems = document.querySelectorAll('nav > ul > li');
        mainMenuItems.forEach(function(menuItem) {
            const link = menuItem.querySelector('a');
            if (!link) return;
            
            const linkText = link.textContent.trim();
            
            if (!mainCategories[linkText]) {
                const isSubcategory = Array.from(desktopMenu.querySelectorAll('li > ul > li > a')).some(
                    subLink => subLink.textContent.trim() === linkText
                );
                
                if (isSubcategory) {
                    menuItem.style.display = 'none';
                }
            }
        });
    }
    
    // ETAPA 3, Bonus: Animatia hamburger cu schimbarea culorilor si transformari
    function addHamburgerAnimation() {
        if (window.innerWidth <= BREAKPOINT_MOBILE) {
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            if (hamburgerMenu) {
                hamburgerMenu.classList.add('animated');
            }
        }
    }
    
    createMobileMenu();
    addHamburgerAnimation();
    
    window.addEventListener('resize', addHamburgerAnimation);
});