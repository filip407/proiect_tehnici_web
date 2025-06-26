// Etapa 6 - JavaScript pentru functionalitatile paginii de produse
let produse = [];
let produseAfisate = [];

// Etapa 6 - Incarcarea produselor din server sau din pagina
async function incarcaProduse() {
    const gridProduse = document.querySelector('.grid-produse');
    if (!gridProduse) {
        console.error('Nu s-a gasit containerul .grid-produse');
        return;
    }

    const produseExistente = gridProduse.querySelectorAll('.produs');
    
    if (produseExistente.length > 0) {
        produse = extrageProduseDeInPagina();
    }
    
    produseAfisate = [...produse];
    window.produse = produse;
    actualizeazaContorProduse();
}

// Bonus 18 - Extragerea datelor produselor din HTML cu identificarea produselor noi
function extrageProduseDeInPagina() {
    const produseExtrase = [];
    const cardurileProduslor = document.querySelectorAll('.produs');
    
    cardurileProduslor.forEach((card, index) => {
        try {
            const selectCos = card.querySelector('.select-cos');
            const valNume = card.querySelector('.val-nume');
            const valPret = card.querySelector('.val-pret');
            const valEchipa = card.querySelector('.val-echipa');
            const valLiga = card.querySelector('.val-liga');
            const valSezon = card.querySelector('.val-sezon');
            const valCategorie = card.querySelector('.val-categorie');
            const valCopii = card.querySelector('.val-copii');
            const valDataAdaugare = card.querySelector('time');
            const img = card.querySelector('img');
            const badgeNou = card.querySelector('.badge-nou');
            
            if (!selectCos || !valNume || !valPret) {
                console.warn(`Produs ${index + 1}: date incomplete`);
                return;
            }
            
            let esteNou = false;
            if (badgeNou) {
                esteNou = true;
            } else if (valDataAdaugare) {
                const dataAdaugare = new Date(valDataAdaugare.getAttribute('datetime'));
                const acum = new Date();
                const diferentaZile = Math.floor((acum - dataAdaugare) / (1000 * 60 * 60 * 24));
                esteNou = diferentaZile <= 30;
            }
            
            const produs = {
                id: parseInt(selectCos.value) || (index + 1),
                nume: valNume.textContent.trim(),
                pret: parseFloat(valPret.textContent.replace(' RON', '')) || 0,
                echipa: valEchipa ? valEchipa.textContent.trim() : 'N/A',
                liga: valLiga ? valLiga.textContent.trim() : 'N/A',
                sezon: valSezon ? valSezon.textContent.trim() : 'N/A',
                categorie: valCategorie ? valCategorie.textContent.trim() : 'acasa',
                imagine: img ? img.src.split('/').pop() : 'placeholder.jpg',
                pentru_copii: valCopii ? valCopii.textContent.trim() === 'Da' : false,
                caracteristici: ['DryFit', 'premium'],
                data_adaugare: valDataAdaugare ? valDataAdaugare.getAttribute('datetime') : null,
                esteCelMaiIeftin: card.classList.contains('cel-mai-ieftin'),
                este_nou: esteNou
            };
            
            if (produs.nume.toLowerCase().includes('retro') || produs.categorie === 'retro') {
                produs.tip_echipa = 'fotbalist';
            } else if (['Romania', 'Brazilia', 'Portugalia'].includes(produs.echipa)) {
                produs.tip_echipa = 'nationala';
            } else {
                produs.tip_echipa = 'club';
            }
            
            produseExtrase.push(produs);
        } catch (error) {
            console.error(`Eroare la extragerea datelor pentru produsul ${index + 1}:`, error);
        }
    });
    
    return produseExtrase;
}

// Etapa 6 - Validarea inputurilor cu mesaje de eroare
function valideazaInputuri() {
    let valid = true;
    let mesajEroare = '';
    
    const echipe = document.getElementById('inp-echipe').value.trim();
    const echipeError = document.getElementById('echipe-error');
    
    if (echipe.length > 0) {
        const formatValid = /^[a-zA-ZăâîșțĂÂÎȘȚ0-9\s.,-]+$/.test(echipe);
        if (!formatValid) {
            echipeError.style.display = 'block';
            valid = false;
            mesajEroare += 'Lista de echipe contine caractere nepermise. ';
        } else {
            echipeError.style.display = 'none';
        }
    } else {
        echipeError.style.display = 'none';
    }
    
    const nume = document.getElementById('inp-nume').value.trim();
    if (nume.length > 0 && /^\d+$/.test(nume)) {
        valid = false;
        mesajEroare += 'Cautarea nu poate contine doar cifre. ';
    }
    
    const tipSelectat = document.querySelector('input[name="gr_tip"]:checked');
    if (!tipSelectat) {
        valid = false;
        mesajEroare += 'Selectati un tip de echipa. ';
    }
    
    if (!valid) {
        alert('Validare esuata: ' + mesajEroare);
    }
    
    return valid;
}

// Formatare data in romana pentru afisare
function formatareDataRomana(data) {
    const luni = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    const zile = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
    
    const zi = data.getDate();
    const luna = luni[data.getMonth()];
    const an = data.getFullYear();
    const ziSaptamana = zile[data.getDay()];
    
    return `${zi} ${luna} ${an} (${ziSaptamana})`;
}

// Bonus 14 - Determinarea celui mai ieftin produs pe categoria
function determinaCelMaiIeftinPeCategorie(listaProduse) {
    const categorii = {};
    
    listaProduse.forEach(produs => {
        const categorie = produs.categorie;
        if (!categorii[categorie] || produs.pret < categorii[categorie].pret) {
            categorii[categorie] = produs;
        }
    });
    
    return Object.values(categorii).map(produs => produs.id);
}

// Etapa 6 - Afisarea produselor cu bonus-uri pentru noi si cei mai ieftini
function afiseazaProduse(listaProduse) {
    const container = document.querySelector('.grid-produse');
    if (!container) return;
    
    container.innerHTML = '';

    if (!listaProduse || listaProduse.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>Nu s-au gasit produse</h3>
                <p>Incercati sa modificati filtrele sau sa reincarcati pagina.</p>
            </div>
        `;
        return;
    }

    const celeMaiIeftineIds = determinaCelMaiIeftinPeCategorie(listaProduse);

    listaProduse.forEach(produs => {
        const productCard = document.createElement('article');
        productCard.className = 'produs';
        productCard.id = `elem_${produs.id}`;
        
        const esteCelMaiIeftin = produs.esteCelMaiIeftin || celeMaiIeftineIds.includes(produs.id);
        
        if (esteCelMaiIeftin) {
            productCard.classList.add('cel-mai-ieftin');
        }
        
        let badges = '';
        if (produs.pentru_copii) {
            badges += '<span class="badge badge-kids"><i class="fas fa-child"></i> Copii</span>';
        }
        if (esteCelMaiIeftin) {
            badges += '<span class="badge badge-cheapest"><i class="fas fa-crown"></i> CEL MAI IEFTIN DIN CATEGORIE</span>';
        }
        if (produs.este_nou) {
            let claseNou = 'badge badge-nou';
            if (produs.data_adaugare) {
                const dataAdaugare = new Date(produs.data_adaugare);
                const acum = new Date();
                const diferentaZile = Math.floor((acum - dataAdaugare) / (1000 * 60 * 60 * 24));
                if (diferentaZile === 0) {
                    claseNou += ' foarte-nou';
                }
            }
            badges += `<span class="${claseNou}"><i class="fas fa-sparkles"></i> NOU</span>`;
        }

        let dataFormatata = '';
        if (produs.data_adaugare) {
            const dataAdaugare = new Date(produs.data_adaugare);
            dataFormatata = formatareDataRomana(dataAdaugare);
        }

        productCard.innerHTML = `
            <h3 class="nume">
                <a href="/produs/${produs.id}">
                    <span class="val-nume">${produs.nume}</span>
                </a>
            </h3>
            <div class="info-prod">
                <table class="tabel-caracteristici">
                    <tr>
                        <td><strong>Pret:</strong></td>
                        <td class="val-pret">${produs.pret.toFixed(2)} RON</td>
                    </tr>
                    <tr>
                        <td><strong>Echipa:</strong></td>
                        <td class="val-echipa">${produs.echipa}</td>
                    </tr>
                    <tr>
                        <td><strong>Liga:</strong></td>
                        <td class="val-liga">${produs.liga || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Sezon:</strong></td>
                        <td class="val-sezon">${produs.sezon}</td>
                    </tr>
                    <tr>
                        <td><strong>Pentru copii:</strong></td>
                        <td class="val-copii">${produs.pentru_copii ? 'Da' : 'Nu'}</td>
                    </tr>
                </table>
                <p class="descriere">${produs.descriere || 'Tricou de fotbal de calitate premium.'}</p>
                <p class="categorie-prod">Categorie: <span class="val-categorie">${produs.categorie}</span></p>
                ${dataFormatata ? `<time datetime="${produs.data_adaugare}">${dataFormatata}</time>` : ''}
                ${badges ? `<div class="product-badges">${badges}</div>` : ''}
            </div>
            <figure>
                <a href="/produs/${produs.id}">
                    <img src="/resurse/imagini/produse/${produs.imagine}" 
                         style="width:100%;height:auto;" 
                         alt="[imagine ${produs.nume}]"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRyaWNvdTwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RWxpdGUgS2l0czwvdGV4dD4KICA8L3N2Zz4K'" />
                </a>
            </figure>
            <label class="selecteaza-cos">
                <input type="checkbox" class="select-cos" value="${produs.id}" autocomplete="off">
                Selecteaza pentru cos
            </label>
        `;
        
        container.appendChild(productCard);
    });
}

// Etapa 6 - Filtrarea produselor cu cautare multipla si caracteristici
function filtreazaProduse() {
    if (!valideazaInputuri()) {
        return;
    }
    
    const nume = document.getElementById('inp-nume')?.value.toLowerCase().trim() || '';
    const tipEchipa = document.querySelector('input[name="gr_tip"]:checked')?.value || 'toate';
    const categorie = document.getElementById('inp-categorie')?.value || 'toate';
    const pretMaxim = parseFloat(document.getElementById('inp-pret')?.value || 400);
    const pentruCopii = document.querySelector('input[name="gr_varsta"]:checked')?.value || 'toate';
    const anMinim = parseInt(document.getElementById('inp-an-sezon')?.value || 1970);
    
    const echipeText = document.getElementById('inp-echipe')?.value.toLowerCase().trim() || '';
    const echipePopulare = echipeText ? 
        echipeText.split(',').map(e => e.trim()).filter(e => e.length > 0) : [];
    
    const caracteristiciSelect = document.getElementById('inp-caracteristici');
    const caracteristiciSelectate = Array.from(caracteristiciSelect.selectedOptions).map(option => option.value);

    produseAfisate = produse.filter(produs => {
        const numeMatch = !nume || 
            produs.nume.toLowerCase().includes(nume) || 
            produs.echipa.toLowerCase().includes(nume) ||
            (produs.jucator && produs.jucator.toLowerCase().includes(nume));
        
        const tipMatch = tipEchipa === 'toate' || produs.tip_echipa === tipEchipa;
        const categorieMatch = categorie === 'toate' || produs.categorie === categorie;
        const pretMatch = produs.pret <= pretMaxim;
        const copiiMatch = pentruCopii === 'toate' || produs.pentru_copii.toString() === pentruCopii;

        let anMatch = true;
        if (produs.sezon) {
            const anProdus = parseInt(produs.sezon.split('/')[0]);
            anMatch = !isNaN(anProdus) && anProdus >= anMinim;
        }
        
        let echipeMatch = true;
        if (echipePopulare.length > 0) {
            echipeMatch = echipePopulare.some(echipa => 
                produs.echipa.toLowerCase().includes(echipa) ||
                produs.nume.toLowerCase().includes(echipa) ||
                (produs.jucator && produs.jucator.toLowerCase().includes(echipa))
            );
        }
        
        let caracteristiciMatch = true;
        if (caracteristiciSelectate.length > 0 && produs.caracteristici) {
            caracteristiciMatch = caracteristiciSelectate.some(caract => 
                produs.caracteristici.some(prodCaract => 
                    prodCaract.toLowerCase().includes(caract.toLowerCase())
                )
            );
        }

        return numeMatch && tipMatch && categorieMatch && pretMatch && copiiMatch && anMatch && echipeMatch && caracteristiciMatch;
    });

    afiseazaProduse(produseAfisate);
    actualizeazaContorProduse();
}

// Etapa 6 - Resetarea filtrelor cu confirmare
function reseteazaFiltre() {
    if (!confirm('Sunteti sigur ca doriti sa resetati toate filtrele? Aceasta actiune va afisa din nou toate produsele.')) {
        return;
    }
    
    const inputNume = document.getElementById('inp-nume');
    if (inputNume) inputNume.value = '';
    
    const radioTipToate = document.getElementById('tip-toate');
    if (radioTipToate) radioTipToate.checked = true;
    
    const selectCategorie = document.getElementById('inp-categorie');
    if (selectCategorie) selectCategorie.value = 'toate';
    
    const pretSlider = document.getElementById('inp-pret');
    if (pretSlider) {
        pretSlider.value = 400;
        const pretDisplay = document.getElementById('pret-display');
        if (pretDisplay) pretDisplay.textContent = '400 RON';
    }
    
    const radioVarstaToate = document.getElementById('varsta-toate');
    if (radioVarstaToate) radioVarstaToate.checked = true;

    const anSlider = document.getElementById('inp-an-sezon');
    if (anSlider) {
        anSlider.value = 1970;
        const anDisplay = document.getElementById('an-display');
        if (anDisplay) anDisplay.textContent = '1970';
    }
    
    const textareaEchipe = document.getElementById('inp-echipe');
    if (textareaEchipe) textareaEchipe.value = '';
    
    const selectCaracteristici = document.getElementById('inp-caracteristici');
    if (selectCaracteristici) {
        Array.from(selectCaracteristici.options).forEach(option => {
            option.selected = false;
        });
    }

    const echipeError = document.getElementById('echipe-error');
    if (echipeError) echipeError.style.display = 'none';
    
    produseAfisate = [...produse];
    afiseazaProduse(produseAfisate);
    actualizeazaContorProduse();
    
    console.log('Filtrele au fost resetate');
}

// Etapa 6 - Sortare crescatoare cu algoritm compus
function sorteazaCrescator() {
    if (!valideazaInputuri()) {
        return;
    }
    
    produseAfisate.sort((a, b) => {
        const raportA = a.pret;
        const raportB = b.pret;
        
        if (Math.abs(raportA - raportB) > 0.01) {
            return raportA - raportB;
        }
        
        return a.categorie.localeCompare(b.categorie, 'ro', { sensitivity: 'base' });
    });
    afiseazaProduse(produseAfisate);
}

// Etapa 6 - Sortare descrescatoare cu algoritm compus
function sorteazaDescrescator() {
    if (!valideazaInputuri()) {
        return;
    }
    
    produseAfisate.sort((a, b) => {
        const raportA = a.pret;
        const raportB = b.pret;
        
        if (Math.abs(raportA - raportB) > 0.01) {
            return raportB - raportA;
        }
        
        return b.categorie.localeCompare(a.categorie, 'ro', { sensitivity: 'base' });
    });
    afiseazaProduse(produseAfisate);
}

// Etapa 6 - Calcularea sumei produselor selectate cu afisare popup
function calculeazaSuma() {
    const checkboxuri = document.querySelectorAll('.select-cos:checked');
    let suma = 0;
    let numarProduse = 0;
    
    checkboxuri.forEach(checkbox => {
        const produsId = parseInt(checkbox.value);
        const produs = produse.find(p => p.id === produsId);
        if (produs) {
            suma += produs.pret;
            numarProduse++;
        }
    });

    const divSuma = document.createElement('div');
    divSuma.className = 'popup-suma';

    if (numarProduse === 0) {
        divSuma.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <div class="popup-content">
                Nu aveti produse selectate in cos!
            </div>
        `;
    } else {
        divSuma.innerHTML = `
            <i class="fas fa-calculator"></i>
            <div class="popup-content">
                Aveti ${numarProduse} produs${numarProduse === 1 ? '' : 'e'} selectat${numarProduse === 1 ? '' : 'e'}
                <strong>Suma totala: ${suma.toFixed(2)} RON</strong>
            </div>
        `;
    }

    document.body.appendChild(divSuma);

    setTimeout(() => {
        if (divSuma && divSuma.parentNode) {
            divSuma.classList.add('closing');
            setTimeout(() => {
                if (divSuma.parentNode) {
                    divSuma.parentNode.removeChild(divSuma);
                }
            }, 300);
        }
    }, 2500);
}

// Bonus 15 - Actualizarea contorului de produse afisate
function actualizeazaContorProduse() {
    const sumaInfo = document.getElementById('p-suma');
    if (sumaInfo) {
        const numarAfisate = produseAfisate.length;
        const numarTotal = produse.length;
        const textOriginal = sumaInfo.innerHTML;
        
        const parteaCategorie = textOriginal.includes('pentru categoria') ? 
            textOriginal.substring(textOriginal.indexOf('pentru categoria')) : '';
        
        sumaInfo.innerHTML = `
            Se afiseaza ${numarAfisate} din ${numarTotal} produse${parteaCategorie.includes('pentru categoria') ? ' ' + parteaCategorie.split('Apasati')[0] : ''}. 
            Apasati <kbd>Alt</kbd>+<kbd>C</kbd> pentru suma preturilor produselor selectate.
        `;
    }
}

// Functie utilitara pentru debounce la input-uri
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeazaEventListeners() {
    const pretSlider = document.getElementById('inp-pret');
    const pretDisplay = document.getElementById('pret-display');
    
    if (pretSlider && pretDisplay) {
        pretSlider.addEventListener('input', function() {
            pretDisplay.textContent = this.value + ' RON';
        });
        pretDisplay.textContent = pretSlider.value + ' RON';
    }

    const anSlider = document.getElementById('inp-an-sezon');
    const anDisplay = document.getElementById('an-display');
    
    if (anSlider && anDisplay) {
        anSlider.addEventListener('input', function() {
            anDisplay.textContent = this.value;
        });
        anDisplay.textContent = anSlider.value;
    }

    const btnFiltrare = document.getElementById('filtrare');
    const btnResetare = document.getElementById('resetare');
    const btnSortCrescator = document.getElementById('sortCrescNume');
    const btnSortDescrescator = document.getElementById('sortDescrescNume');

    if (btnFiltrare) btnFiltrare.addEventListener('click', filtreazaProduse);
    if (btnResetare) btnResetare.addEventListener('click', reseteazaFiltre);
    if (btnSortCrescator) btnSortCrescator.addEventListener('click', sorteazaCrescator);
    if (btnSortDescrescator) btnSortDescrescator.addEventListener('click', sorteazaDescrescator);

    const inputNume = document.getElementById('inp-nume');
    if (inputNume) {
        inputNume.addEventListener('input', debounce(filtreazaProduse, 300));
    }

    document.querySelectorAll('input[name="gr_tip"]').forEach(radio => {
        radio.addEventListener('change', filtreazaProduse);
    });

    const selectCategorie = document.getElementById('inp-categorie');
    if (selectCategorie) {
        selectCategorie.addEventListener('change', filtreazaProduse);
    }

    document.querySelectorAll('input[name="gr_varsta"]').forEach(radio => {
        radio.addEventListener('change', filtreazaProduse);
    });

    if (anSlider) {
        anSlider.addEventListener('input', debounce(filtreazaProduse, 200));
    }

    const selectCaracteristici = document.getElementById('inp-caracteristici');
    if (selectCaracteristici) {
        selectCaracteristici.addEventListener('change', filtreazaProduse);
    }

    if (pretSlider) {
        pretSlider.addEventListener('input', debounce(filtreazaProduse, 200));
    }

    const textareaEchipe = document.getElementById('inp-echipe');
    if (textareaEchipe) {
        textareaEchipe.addEventListener('input', function() {
            const echipeError = document.getElementById('echipe-error');
            const valoare = this.value.trim();
            
            if (valoare.length > 0) {
                const formatValid = /^[a-zA-ZăâîșțĂÂÎȘȚ0-9\s.,-]+$/.test(valoare);
                if (!formatValid) {
                    echipeError.style.display = 'block';
                } else {
                    echipeError.style.display = 'none';
                }
            } else {
                echipeError.style.display = 'none';
            }
        });
        
        textareaEchipe.addEventListener('input', debounce(filtreazaProduse, 500));
    }

    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            calculeazaSuma();
        }
    });
}

// Functia principala de initializare
async function initializeazaAplicatia() {
    try {
        await incarcaProduse();
        initializeazaEventListeners();
        initializeazaModal();
        if (typeof initializeazaComparator === 'function') {
            initializeazaComparator();
        }
        
        console.log('Aplicatia a fost initializata cu succes (cu modal si comparator)');
    } catch (error) {
        console.error('Eroare la initializarea aplicatiei:', error);
    }
}

// Pornirea aplicatiei la incarcarea paginii
document.addEventListener('DOMContentLoaded', initializeazaAplicatia);

// Export pentru testare
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        incarcaProduse,
        filtreazaProduse,
        reseteazaFiltre,
        sorteazaCrescator,
        sorteazaDescrescator,
        calculeazaSuma
    };
}