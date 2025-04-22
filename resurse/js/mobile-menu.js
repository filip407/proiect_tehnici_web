/**
 * Functionalitate pentru meniul mobil
 * Script pentru crearea si gestionarea meniului pentru dispozitive mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constante pentru configurare
    const BREAKPOINT_MOBILE = 768;
    
    // Elementele principale
    const header = document.querySelector('header');
    const desktopMenu = document.querySelector('nav > ul');
    
    // Categoriile principale care vor fi incluse in meniul mobil
    const mainCategories = {
        "Acasă": false, // Nu includem Home in lista pentru ca avem iconita
        "Catalog": true,
        "Promoții": true, 
        "Contul de utilizator": true,
        "Resurse": true,
        "Contact": true,
        "Coș de cumpărături": true
    };
    
    // Functii
    function createMobileMenu() {
        createHamburgerButton();
        createMobileMenuContainer();
        createOverlay();
        setupEventListeners();
        hideSubcategoriesFromMainMenu();
    }
    
    function createHamburgerButton() {
        const hamburgerButton = document.createElement('div');
        hamburgerButton.className = 'hamburger-menu';
        hamburgerButton.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(hamburgerButton, header.firstChild);
    }
    
    function createMobileMenuContainer() {
        // Cream containerul principal pentru meniul mobil
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Adaugam iconita pentru Home
        const homeIcon = document.createElement('div');
        homeIcon.className = 'home-icon';
        homeIcon.innerHTML = '<a href="/"><i class="fa-solid fa-house"></i></a>';
        mobileMenu.appendChild(homeIcon);
        
        // Cream lista de meniu mobil si adaugam elementele
        const mobileMenuList = document.createElement('ul');
        mobileMenuList.className = 'mobile-menu-list';
        
        // Populam meniul mobil cu elementele din meniul desktop
        populateMobileMenu(mobileMenuList);
        
        mobileMenu.appendChild(mobileMenuList);
        document.body.appendChild(mobileMenu);
    }
    
    function populateMobileMenu(mobileMenuList) {
        if (!desktopMenu) return;
        
        const menuItems = desktopMenu.querySelectorAll('li');
        
        menuItems.forEach(function(item, index) {
            if (index === 0) return; // Sarim primul element (Home) - folosim iconita
            
            const mainLink = item.querySelector('a');
            if (!mainLink) return;
            
            const linkText = mainLink.textContent.trim();
            
            // Verificam daca e o categorie principala care trebuie inclusa
            if (mainCategories[linkText]) {
                const newItem = document.createElement('li');
                const newLink = document.createElement('a');
                newLink.href = mainLink.href;
                newLink.textContent = linkText;
                newItem.appendChild(newLink);
                
                // Adaugam submeniu daca exista
                addSubmenuIfExists(item, newItem);
                
                mobileMenuList.appendChild(newItem);
            }
        });
    }
    
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
    
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    
    function setupEventListeners() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        
        if (!hamburgerButton || !mobileMenu || !overlay) return;
        
        // Toggle meniu la click pe butonul hamburger
        hamburgerButton.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        // Inchide meniul la click pe overlay
        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Inchide meniul la click in afara
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !hamburgerButton.contains(e.target)) {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
    
    function hideSubcategoriesFromMainMenu() {
        if (!desktopMenu) return;
        
        const mainMenuItems = document.querySelectorAll('nav > ul > li');
        mainMenuItems.forEach(function(menuItem) {
            const link = menuItem.querySelector('a');
            if (!link) return;
            
            const linkText = link.textContent.trim();
            
            // Pastram doar categoriile principale in meniul principal
            if (!mainCategories[linkText]) {
                // Verificam daca e o subcategorie care ar trebui sa apara doar in submeniu
                const isSubcategory = Array.from(desktopMenu.querySelectorAll('li > ul > li > a')).some(
                    subLink => subLink.textContent.trim() === linkText
                );
                
                if (isSubcategory) {
                    menuItem.style.display = 'none';
                }
            }
        });
    }
    
    function addHamburgerAnimation() {
        if (window.innerWidth <= BREAKPOINT_MOBILE) {
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            if (hamburgerMenu) {
                hamburgerMenu.classList.add('animated');
            }
        }
    }
    
    // Initializare
    createMobileMenu();
    addHamburgerAnimation();
    
    // Listener pentru redimensionare
    window.addEventListener('resize', addHamburgerAnimation);
});