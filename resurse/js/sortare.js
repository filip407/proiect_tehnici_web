/* BONUS ETAPA 6 - Bonus 8: Sortarea personalizabila cu doua chei */

// Functie pentru obtinerea valorii de sortare pe baza cheii specificate
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
            if (produs.sezon) {
                const anProdus = parseInt(produs.sezon.split('/')[0]);
                return isNaN(anProdus) ? 0 : anProdus;
            }
            return 0;
        case 'liga':
            return (produs.liga || '').toLowerCase().trim();
        case 'data_adaugare':
            return produs.data_adaugare ? new Date(produs.data_adaugare) : new Date('1970-01-01');
        default:
            return '';
    }
}

// Functie pentru compararea a doua valori pentru sortare
function compareValues(val1, val2, crescator = true) {
    let comparison = 0;
    
    if (val1 instanceof Date && val2 instanceof Date) {
        comparison = val1.getTime() - val2.getTime();
    } else if (typeof val1 === 'number' && typeof val2 === 'number') {
        comparison = val1 - val2;
    } else {
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

// Functie principala pentru sortarea cu doua chei personalizabile
function sorteazaCuDouaChei() {
    if (!valideazaInputuri()) {
        return;
    }
    
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const directie1 = document.getElementById('directie-sortare-1').value === 'crescator';
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    const directie2 = document.getElementById('directie-sortare-2').value === 'crescator';
    
    if (cheie1 === cheie2) {
        alert('Va rugam sa selectati chei de sortare diferite pentru a obtine rezultate mai precise.');
        return;
    }
    
    console.log(`Sortare aplicata: ${cheie1} (${directie1 ? 'crescator' : 'descrescator'}), apoi ${cheie2} (${directie2 ? 'crescator' : 'descrescator'})`);
    
    const produseOrdonata = [...produseAfisate];
    
    produseOrdonata.sort((produsA, produsB) => {
        const valoare1A = getValueForSort(produsA, cheie1);
        const valoare1B = getValueForSort(produsB, cheie1);
        
        const comp1 = compareValues(valoare1A, valoare1B, directie1);
        
        if (comp1 === 0) {
            const valoare2A = getValueForSort(produsA, cheie2);
            const valoare2B = getValueForSort(produsB, cheie2);
            
            return compareValues(valoare2A, valoare2B, directie2);
        }
        
        return comp1;
    });
    
    produseAfisate = produseOrdonata;
    afiseazaProduse(produseAfisate);
    actualizeazaContorCuSortare();
    afisareFeedbackSortare(cheie1, directie1, cheie2, directie2);
}

// Functie pentru resetarea sortarii la valorile implicite
function reseteazaSortarea() {
    document.getElementById('cheie-sortare-1').value = 'pret';
    document.getElementById('directie-sortare-1').value = 'crescator';
    document.getElementById('cheie-sortare-2').value = 'nume';
    document.getElementById('directie-sortare-2').value = 'crescator';
    
    actualizarePrevizualizareSortare();
    
    if (window.produse && window.produse.length > 0) {
        const produseOriginale = [...window.produse];
        produseAfisate = produseOriginale;
        
        const filtreActive = verificaFiltreActive();
        if (filtreActive) {
            setTimeout(() => {
                filtreazaProduse();
            }, 100);
        } else {
            afiseazaProduse(produseAfisate);
        }
    }
    
    console.log('Sortarea a fost resetata la valorile implicite');
}

// Functie pentru verificarea filtrelor active
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

// Functie pentru actualizarea previzualizarii sortarii
function actualizarePrevizualizareSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const directie1 = document.getElementById('directie-sortare-1').value;
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    const directie2 = document.getElementById('directie-sortare-2').value;
    
    const denumiriChei = {
        'nume': 'nume produs',
        'pret': 'pret',
        'echipa': 'echipa',
        'categorie': 'categorie',
        'sezon': 'sezon',
        'liga': 'liga',
        'data_adaugare': 'data adaugarii'
    };
    
    const denumiriDirectii = {
        'crescator': 'crescator',
        'descrescator': 'descrescator'
    };
    
    const previewElement = document.getElementById('preview-sortare');
    if (previewElement) {
        const textPreview = `Se va sorta dupa <strong>${denumiriChei[cheie1]} (${denumiriDirectii[directie1]})</strong>, apoi dupa <strong>${denumiriChei[cheie2]} (${denumiriDirectii[directie2]})</strong>`;
        previewElement.innerHTML = textPreview;
        
        const containerSortare = document.querySelector('.sortare-personalizabila');
        if (containerSortare) {
            containerSortare.className = containerSortare.className.replace(/sortare-\w+-\w+/g, '');
            
            const clasaCombinatie = `sortare-${cheie1}-${cheie2}`;
            containerSortare.classList.add(clasaCombinatie);
        }
    }
}

// Functie pentru afisarea feedback-ului vizual dupa aplicarea sortarii
function afisareFeedbackSortare(cheie1, directie1, cheie2, directie2) {
    const containerSortare = document.querySelector('.sortare-personalizabila');
    if (containerSortare) {
        containerSortare.classList.add('sortare-aplicata');
        
        setTimeout(() => {
            containerSortare.classList.remove('sortare-aplicata');
        }, 600);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-sortare';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Sortare aplicata cu succes!</span>
    `;
    
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

// Functie pentru validarea combinatiei de sortare selectate
function valideazaCombinatieSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1').value;
    const cheie2 = document.getElementById('cheie-sortare-2').value;
    
    if (cheie1 === cheie2) {
        const optiuni = ['nume', 'pret', 'echipa', 'categorie', 'sezon', 'liga', 'data_adaugare'];
        const optiuniDisponibile = optiuni.filter(opt => opt !== cheie1);
        
        if (optiuniDisponibile.length > 0) {
            document.getElementById('cheie-sortare-2').value = optiuniDisponibile[0];
            actualizarePrevizualizareSortare();
        }
    }
}

// Functie pentru initializarea event listeners pentru sortarea personalizabila
function initializeazaSortarePersonalizabila() {
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
    
    const btnAplicaSortare = document.getElementById('aplicaSortare');
    const btnResetSortare = document.getElementById('resetSortare');
    
    if (btnAplicaSortare) {
        btnAplicaSortare.addEventListener('click', sorteazaCuDouaChei);
    }
    
    if (btnResetSortare) {
        btnResetSortare.addEventListener('click', reseteazaSortarea);
    }
    
    actualizarePrevizualizareSortare();
    
    console.log('Sortarea personalizabila a fost initializata');
}

// Functie pentru integrarea cu sistemul existent de sortare
function integreazaSortareaPersonalizabila() {
    if (typeof window.sorteazaCrescator === 'function') {
        const sorteazaCrescatorOriginal = window.sorteazaCrescator;
        window.sorteazaCrescator = function() {
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
            document.getElementById('cheie-sortare-1').value = 'pret';
            document.getElementById('directie-sortare-1').value = 'descrescator';
            document.getElementById('cheie-sortare-2').value = 'nume';
            document.getElementById('directie-sortare-2').value = 'crescator';
            actualizarePrevizualizareSortare();
            sorteazaCuDouaChei();
        };
    }
}

// Export pentru utilizare in module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sorteazaCuDouaChei,
        reseteazaSortarea,
        actualizarePrevizualizareSortare,
        initializeazaSortarePersonalizabila,
        integreazaSortareaPersonalizabila
    };
}

// Functie pentru aplicarea unui exemplu de sortare predefinit
function aplicaExempluSortare(cheie1, directie1, cheie2, directie2) {
    document.getElementById('cheie-sortare-1').value = cheie1;
    document.getElementById('directie-sortare-1').value = directie1;
    document.getElementById('cheie-sortare-2').value = cheie2;
    document.getElementById('directie-sortare-2').value = directie2;
    
    actualizarePrevizualizareSortare();
    
    setTimeout(() => {
        sorteazaCuDouaChei();
    }, 300);
}

// Functie pentru actualizarea contorului de produse cu informatii despre sortare
function actualizeazaContorCuSortare() {
    const cheie1 = document.getElementById('cheie-sortare-1')?.value;
    const directie1 = document.getElementById('directie-sortare-1')?.value;
    const cheie2 = document.getElementById('cheie-sortare-2')?.value;
    const directie2 = document.getElementById('directie-sortare-2')?.value;
    
    if (cheie1 && cheie2 && typeof actualizeazaContorProduse === 'function') {
        actualizeazaContorProduse();
        
        const sumaInfo = document.getElementById('p-suma');
        if (sumaInfo) {
            const denumiriChei = {
                'nume': 'nume',
                'pret': 'pret',
                'echipa': 'echipa',
                'categorie': 'categorie',
                'sezon': 'sezon',
                'liga': 'liga',
                'data_adaugare': 'data adaugarii'
            };
            
            const textSortare = ` Sortate dupa ${denumiriChei[cheie1]} (${directie1 === 'crescator' ? '↑' : '↓'}), apoi ${denumiriChei[cheie2]} (${directie2 === 'crescator' ? '↑' : '↓'}).`;
            
            if (!sumaInfo.innerHTML.includes('Sortate dupa')) {
                const textOriginal = sumaInfo.innerHTML;
                const pozitiaAlt = textOriginal.indexOf('Apasati');
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

// Auto-initializare cand DOM-ul este gata
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('cheie-sortare-1')) {
            initializeazaSortarePersonalizabila();
            integreazaSortareaPersonalizabila();
        }
    }, 500);
});

// Initializare sortare si cand se incarca dinamic continutul
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