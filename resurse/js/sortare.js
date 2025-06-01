// Funcții pentru sortarea personalizabilă cu două chei

/**
 * Obține valoarea pentru sortare dintr-un produs pe baza cheii specificate
 */
function getValueForSort(produs, cheie) {
    switch (cheie) {
        case 'nume':
            return produs.nume.toLowerCase().trim();
        case 'pret':
            return parseFloat(produs.pret) || 0;
        case 'echipa':
            return produs.echipa.toLowerCase().trim();
        case 'categorie':
            return produs.categorie.toLowerCase().trim();
        case 'sezon':
            return produs.sezon.toLowerCase().trim();
        case 'liga':
            return (produs.liga || '').toLowerCase().trim();
        case 'data_adaugare':
            return produs.data_adaugare ? new Date(produs.data_adaugare) : new Date('1970-01-01');
        default:
            return '';
    }
}

/**
 * Compară două valori pentru sortare
 */
function compareValues(val1, val2, crescator = true) {
    let comparison = 0;
    
    if (val1 instanceof Date && val2 instanceof Date) {
        comparison = val1.getTime() - val2.getTime();
    } else if (typeof val1 === 'number' && typeof val2 === 'number') {
        comparison = val1 - val2;
    } else {
        // Pentru stringuri, folosim localeCompare pentru sortarea corectă în română
        const str1 = String(val1);
        const str2 = String(val2);
        comparison = str1.localeCompare(str2, 'ro', { 
            sensitivity: 'base', 
            numeric: true,
            ignorePunctuation: true 
        });
    }
    
    return crescator ? comparison : -comparison;
}

/**
 * Sortează produsele cu două chei personalizabile
 */
function sorteazaCuDouaChei() {
    if (!valideazaInputuri()) {
        return;
    }
    
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const directie1 = document.getElementById('directie-sortare-1').value === 'crescator';
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    const directie2 = document.getElementById('directie-sortare-2').value === 'crescator';
    
    // Verifică ca cheile să fie diferite
    if (cheie1 === cheie2) {
        alert('Vă rugăm să selectați chei de sortare diferite pentru a obține rezultate mai precise.');
        return;
    }
    
    console.log(`Sortare aplicată: ${cheie1} (${directie1 ? 'crescător' : 'descrescător'}), apoi ${cheie2} (${directie2 ? 'crescător' : 'descrescător'})`);
    
    // Creează o copie a produselor pentru sortare
    const produseOrdonata = [...produseAfisate];
    
    produseOrdonata.sort((produsA, produsB) => {
        // Prima cheie de sortare
        const valoare1A = getValueForSort(produsA, cheie1);
        const valoare1B = getValueForSort(produsB, cheie1);
        
        const comp1 = compareValues(valoare1A, valoare1B, directie1);
        
        // Dacă prima comparație este egală, folosește a doua cheie
        if (comp1 === 0) {
            const valoare2A = getValueForSort(produsA, cheie2);
            const valoare2B = getValueForSort(produsB, cheie2);
            
            return compareValues(valoare2A, valoare2B, directie2);
        }
        
        return comp1;
    });
    
    // Actualizează array-ul global
    produseAfisate = produseOrdonata;
    
    // Afișează produsele sortate
    afiseazaProduse(produseAfisate);
    
    // Actualizează contorul cu informații despre sortare
    actualizeazaContorCuSortare();
    
    // Feedback vizual pentru utilizator
    afisareFeedbackSortare(cheie1, directie1, cheie2, directie2);
}

/**
 * Resetează sortarea la valorile implicite
 */
function reseteazaSortarea() {
    document.getElementById('cheie-sortare-1').value = 'pret';
    document.getElementById('directie-sortare-1').value = 'crescator';
    document.getElementById('cheie-sortare-2').value = 'nume';
    document.getElementById('directie-sortare-2').value = 'crescator';
    
    actualizarePrevizualizareSortare();
    
    // Resetează la produsele filtrate dar nesortate
    // (păstrează filtrarea, dar elimină sortarea)
    if (window.produse && window.produse.length > 0) {
        // Re-aplică doar filtrele fără sortare
        const produseOriginale = [...window.produse];
        produseAfisate = produseOriginale;
        
        // Re-aplică filtrele active
        const filtreActive = verificaFiltreActive();
        if (filtreActive) {
            // Re-execută filtrarea pentru a păstra produsele filtrate
            setTimeout(() => {
                filtreazaProduse();
            }, 100);
        } else {
            afiseazaProduse(produseAfisate);
        }
    }
    
    console.log('Sortarea a fost resetată la valorile implicite');
}

/**
 * Verifică dacă există filtre active
 */
function verificaFiltreActive() {
    const nume = document.getElementById('inp-nume')?.value.trim();
    const tipEchipa = document.querySelector('input[name="gr_tip"]:checked')?.value;
    const categorie = document.getElementById('inp-categorie')?.value;
    const pret = document.getElementById('inp-pret')?.value;
    const varsta = document.querySelector('input[name="gr_varsta"]:checked')?.value;
    const sezon = document.getElementById('inp-sezon')?.value;
    const echipe = document.getElementById('inp-echipe')?.value.trim();
    
    return nume || 
           (tipEchipa && tipEchipa !== 'toate') || 
           (categorie && categorie !== 'toate') || 
           (pret && parseFloat(pret) < 400) ||
           (varsta && varsta !== 'toate') ||
           (sezon && sezon !== 'toate') ||
           echipe;
}

/**
 * Actualizează previzualizarea sortării
 */
function actualizarePrevizualizareSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const directie1 = document.getElementById('directie-sortare-1').value;
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    const directie2 = document.getElementById('directie-sortare-2').value;
    
    // Maparea cheilor la denumiri prietenoase
    const denumiriChei = {
        'nume': 'nume produs',
        'pret': 'preț',
        'echipa': 'echipa',
        'categorie': 'categorie',
        'sezon': 'sezon',
        'liga': 'liga',
        'data_adaugare': 'data adăugării'
    };
    
    const denumiriDirectii = {
        'crescator': 'crescător',
        'descrescator': 'descrescător'
    };
    
    const previewElement = document.getElementById('preview-sortare');
    if (previewElement) {
        const textPreview = `Se va sorta după <strong>${denumiriChei[cheie1]} (${denumiriDirectii[directie1]})</strong>, apoi după <strong>${denumiriChei[cheie2]} (${denumiriDirectii[directie2]})</strong>`;
        previewElement.innerHTML = textPreview;
        
        // Adaugă clase CSS pentru efecte speciale
        const containerSortare = document.querySelector('.sortare-personalizabila');
        if (containerSortare) {
            // Elimină clasele anterioare
            containerSortare.className = containerSortare.className.replace(/sortare-\w+-\w+/g, '');
            
            // Adaugă clasa pentru combinația curentă
            const clasaCombinatie = `sortare-${cheie1}-${cheie2}`;
            containerSortare.classList.add(clasaCombinatie);
        }
    }
}

/**
 * Afișează feedback vizual după aplicarea sortării
 */
function afisareFeedbackSortare(cheie1, directie1, cheie2, directie2) {
    const containerSortare = document.querySelector('.sortare-personalizabila');
    if (containerSortare) {
        containerSortare.classList.add('sortare-aplicata');
        
        setTimeout(() => {
            containerSortare.classList.remove('sortare-aplicata');
        }, 600);
    }
    
    // Afișează un toast de confirmare
    const toast = document.createElement('div');
    toast.className = 'toast-sortare';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Sortare aplicată cu succes!</span>
    `;
    
    // Stilizează toast-ul
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--culoare-primara), var(--culoare-secundara));
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        font-size: 0.95rem;
        animation: slideInToast 0.4s ease-out;
    `;
    
    // Adaugă animația CSS inline
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInToast {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutToast {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // Elimină toast-ul după 3 secunde
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.4s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 400);
    }, 3000);
}

/**
 * Validează combinația de sortare selectată
 */
function valideazaCombinatieSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    
    if (cheie1 === cheie2) {
        // Schimbă automat a doua cheie
        const optiuni = ['nume', 'pret', 'echipa', 'categorie', 'sezon', 'liga', 'data_adaugare'];
        const optiuniDisponibile = optiuni.filter(opt => opt !== cheie1);
        
        if (optiuniDisponibile.length > 0) {
            document.getElementById('cheie-sortare-2').value = optiuniDisponibile[0];
            actualizarePrevizualizareSortare();
        }
    }
}

/**
 * Inițializează event listeners pentru sortarea personalizabilă
 */
function initializeazaSortarePersonalizabila() {
    // Event listeners pentru selectele de chei de sortare
    const cheie1Select = document.getElementById('cheie-sortare-1');
    const cheie2Select = document.getElementById('cheie-sortare-2');
    const directie1Select = document.getElementById('directie-sortare-1');
    const directie2Select = document.getElementById('directie-sortare-2');
    
    if (cheie1Select) {
        cheie1Select.addEventListener('change', () => {
            valideazaCombinatieSortare();
            actualizarePrevizualizareSortare();
        });
    }
    
    if (cheie2Select) {
        cheie2Select.addEventListener('change', () => {
            valideazaCombinatieSortare();
            actualizarePrevizualizareSortare();
        });
    }
    
    if (directie1Select) {
        directie1Select.addEventListener('change', actualizarePrevizualizareSortare);
    }
    
    if (directie2Select) {
        directie2Select.addEventListener('change', actualizarePrevizualizareSortare);
    }
    
    // Event listeners pentru butoane
    const btnAplicaSortare = document.getElementById('aplicaSortare');
    const btnResetSortare = document.getElementById('resetSortare');
    
    if (btnAplicaSortare) {
        btnAplicaSortare.addEventListener('click', sorteazaCuDouaChei);
    }
    
    if (btnResetSortare) {
        btnResetSortare.addEventListener('click', reseteazaSortarea);
    }
    
    // Inițializează previzualizarea
    actualizarePrevizualizareSortare();
    
    console.log('Sortarea personalizabilă a fost inițializată');
}

/**
 * Funcție helper pentru integrarea cu sistemul existent
 */
function integreazaSortareaPersonalizabila() {
    // Înlocuiește funcțiile de sortare existente
    if (typeof window.sorteazaCrescator === 'function') {
        const sorteazaCrescatorOriginal = window.sorteazaCrescator;
        window.sorteazaCrescator = function() {
            // Setează rapid sortarea pe preț crescător, apoi nume crescător
            document.getElementById('cheie-sortare-1').value = 'pret';
            document.getElementById('directie-sortare-1').value = 'crescator';
            document.getElementById('cheie-sortare-2').value = 'nume';
            document.getElementById('directie-sortare-2').value = 'crescator';
            actualizarePrevizualizareSortare();
            sorteazaCuDouaChei();
        };
    }
    
    if (typeof window.sorteazaDescrescator === 'function') {
        const sorteazaDescrescatorOriginal = window.sorteazaDescrescator;
        window.sorteazaDescrescator = function() {
            // Setează rapid sortarea pe preț descrescător, apoi nume crescător
            document.getElementById('cheie-sortare-1').value = 'pret';
            document.getElementById('directie-sortare-1').value = 'descrescator';
            document.getElementById('cheie-sortare-2').value = 'nume';
            document.getElementById('directie-sortare-2').value = 'crescator';
            actualizarePrevizualizareSortare();
            sorteazaCuDouaChei();
        };
    }
}

// Export pentru utilizare în module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sorteazaCuDouaChei,
        reseteazaSortarea,
        actualizarePrevizualizareSortare,
        initializeazaSortarePersonalizabila,
        integreazaSortareaPersonalizabila
    };
}

/**
 * Aplică un exemplu de sortare predefinit
 */
function aplicaExempluSortare(cheie1, directie1, cheie2, directie2) {
    document.getElementById('cheie-sortare-1').value = cheie1;
    document.getElementById('directie-sortare-1').value = directie1;
    document.getElementById('cheie-sortare-2').value = cheie2;
    document.getElementById('directie-sortare-2').value = directie2;
    
    actualizarePrevizualizareSortare();
    
    // Aplică sortarea automat
    setTimeout(() => {
        sorteazaCuDouaChei();
    }, 300);
}

/**
 * Actualizează contorul de produse cu informații despre sortare
 */
function actualizeazaContorCuSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1')?.value;
    const directie1 = document.getElementById('directie-sortare-1')?.value;
    const cheie2 = document.getElementById('cheie-sortare-2')?.value;
    const directie2 = document.getElementById('directie-sortare-2')?.value;
    
    if (cheie1 && cheie2 && typeof actualizeazaContorProduse === 'function') {
        actualizeazaContorProduse();
        
        // Adaugă informații despre sortarea curentă
        const sumaInfo = document.getElementById('p-suma');
        if (sumaInfo) {
            const denumiriChei = {
                'nume': 'nume',
                'pret': 'preț',
                'echipa': 'echipa',
                'categorie': 'categorie',
                'sezon': 'sezon',
                'liga': 'liga',
                'data_adaugare': 'data adăugării'
            };
            
            const textSortare = ` Sortate după ${denumiriChei[cheie1]} (${directie1 === 'crescator' ? '↑' : '↓'}), apoi ${denumiriChei[cheie2]} (${directie2 === 'crescator' ? '↑' : '↓'}).`;
            
            if (!sumaInfo.innerHTML.includes('Sortate după')) {
                const textOriginal = sumaInfo.innerHTML;
                const pozitiaAlt = textOriginal.indexOf('Apăsați');
                if (pozitiaAlt !== -1) {
                    const parteaInainte = textOriginal.substring(0, pozitiaAlt);
                    const parteaDupa = textOriginal.substring(pozitiaAlt);
                    sumaInfo.innerHTML = parteaInainte + textSortare + ' ' + parteaDupa;
                } else {
                    sumaInfo.innerHTML = textOriginal + textSortare;
                }
            }
        }
    }
}

// Auto-inițializare când DOM-ul este gata
document.addEventListener('DOMContentLoaded', function() {
    // Așteaptă ca produsele să fie încărcate
    setTimeout(() => {
        if (document.getElementById('cheie-sortare-1')) {
            initializeazaSortarePersonalizabila();
            integreazaSortareaPersonalizabila();
        }
    }, 500);
});

// Inițializează sortarea și când se încarcă dinamic conținutul
if (typeof window.addEventListener === 'function') {
    window.addEventListener('load', function() {
        setTimeout(() => {
            if (document.getElementById('cheie-sortare-1')) {
                initializeazaSortarePersonalizabila();
                integreazaSortareaPersonalizabila();
            }
        }, 1000);
    });
}