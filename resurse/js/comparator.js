/* ETAPA 6, Bonus 20: Sistem de comparare produse cu container persistent */

let produseComparare = [];
let tooltipElement = null;

// Verifica daca suntem pe o pagina cu produse
function estePaginaProduse() {
    return window.location.pathname.includes('/produse') || 
           window.location.pathname.includes('/produs/') ||
           document.querySelector('.grid-produse') !== null ||
           document.querySelector('.produs') !== null;
}

// Actualizeaza timestamp-ul ultimei activitati de comparare
function actualizeazaUltimaActivitate() {
    localStorage.setItem('ultimaActivitateComparare', Date.now().toString());
}

// Verifica daca containerul de comparare a expirat (o zi)
function verificaExpirareComparator() {
    const ultimaActivitate = localStorage.getItem('ultimaActivitateComparare');
    if (!ultimaActivitate) return true;
    
    const acum = Date.now();
    const ultimaActivitateTime = parseInt(ultimaActivitate);
    const unaZi = 24 * 60 * 60 * 1000;
    
    return (acum - ultimaActivitateTime) > unaZi;
}

// Incarca lista de produse pentru comparare din localStorage
function incarcaListaComparare() {
    if (verificaExpirareComparator()) {
        localStorage.removeItem('produseComparare');
        localStorage.removeItem('ultimaActivitateComparare');
        return [];
    }
    
    const lista = localStorage.getItem('produseComparare');
    return lista ? JSON.parse(lista) : [];
}

// Salveaza lista de produse pentru comparare
function salveazaListaComparare() {
    localStorage.setItem('produseComparare', JSON.stringify(produseComparare));
    actualizeazaUltimaActivitate();
}

// Creaza containerul fix pentru compararea produselor
function creeazaContainerComparare() {
    if (document.getElementById('container-comparare')) return;
    
    const container = document.createElement('div');
    container.id = 'container-comparare';
    container.className = 'show';
    
    container.innerHTML = `
        <h4><i class="fas fa-balance-scale"></i> Comparare produse</h4>
        <div id="lista-produse-comparare"></div>
    `;
    
    document.body.appendChild(container);
    return container;
}

// Actualizeaza continutul containerului de comparare
function actualizeazaContainerComparare() {
    const container = document.getElementById('container-comparare');
    const listaDiv = document.getElementById('lista-produse-comparare');
    
    if (produseComparare.length === 0) {
        if (container) {
            container.remove();
        }
        actualizeazaStareButoane();
        return;
    }
    
    if (!container) {
        creeazaContainerComparare();
        return actualizeazaContainerComparare();
    }
    
    let html = '';
    
    produseComparare.forEach((produs, index) => {
        html += `
            <div class="produs-comparare">
                <span class="nume-produs-comparare">${produs.nume}</span>
                <button class="btn-sterge-comparare" onclick="stergeProdusComparare(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    if (produseComparare.length === 2) {
        html += `
            <button class="btn-afiseaza-comparare" onclick="afiseazaComparare()">
                <i class="fas fa-eye"></i> Afiseaza compararea
            </button>
        `;
    }
    
    listaDiv.innerHTML = html;
    actualizeazaStareButoane();
}

// Sterge un produs din lista de comparare
function stergeProdusComparare(index) {
    produseComparare.splice(index, 1);
    salveazaListaComparare();
    actualizeazaContainerComparare();
    actualizeazaUltimaActivitate();
}

// Actualizeaza starea butoanelor de comparare (activeaza/dezactiveaza)
function actualizeazaStareButoane() {
    const butoane = document.querySelectorAll('.btn-compara');
    
    butoane.forEach(buton => {
        if (produseComparare.length >= 2) {
            buton.disabled = true;
            
            buton.addEventListener('mouseenter', afiseazaTooltip);
            buton.addEventListener('mouseleave', ascundeTooltip);
        } else {
            buton.disabled = false;
            
            buton.removeEventListener('mouseenter', afiseazaTooltip);
            buton.removeEventListener('mouseleave', ascundeTooltip);
        }
    });
}

// Afiseaza tooltip pentru butoanele dezactivate
function afiseazaTooltip(event) {
    if (!event.target.disabled) return;
    
    ascundeTooltip();
    
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip show';
    tooltipElement.textContent = 'Stergeti un produs din lista de comparare';
    
    document.body.appendChild(tooltipElement);
    
    const rect = event.target.getBoundingClientRect();
    tooltipElement.style.left = rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2) + 'px';
    tooltipElement.style.top = rect.top - tooltipElement.offsetHeight - 10 + 'px';
    
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (tooltipRect.left < 0) {
        tooltipElement.style.left = '5px';
    }
    if (tooltipRect.right > window.innerWidth) {
        tooltipElement.style.left = (window.innerWidth - tooltipElement.offsetWidth - 5) + 'px';
    }
}

// Ascunde tooltip-ul
function ascundeTooltip() {
    if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
    }
}

// Adauga un produs in lista de comparare
function adaugaProdusComparare(produsId) {
    const produs = window.produse ? window.produse.find(p => p.id === parseInt(produsId)) : null;
    if (!produs) {
        console.error('Produsul nu a fost gasit:', produsId);
        return;
    }
    
    if (produseComparare.some(p => p.id === produs.id)) {
        alert('Acest produs este deja in lista de comparare!');
        return;
    }
    
    if (produseComparare.length >= 2) {
        alert('Puteti compara maximum 2 produse! Stergeti un produs din lista pentru a adauga altul.');
        return;
    }
    
    produseComparare.push(produs);
    salveazaListaComparare();
    actualizeazaContainerComparare();
    actualizeazaUltimaActivitate();
    
    const butonCompara = document.querySelector(`[data-produs-id="${produsId}"]`);
    if (butonCompara) {
        const textOriginal = butonCompara.innerHTML;
        butonCompara.innerHTML = '<i class="fas fa-check"></i> Adaugat!';
        butonCompara.style.background = '#28a745';
        
        setTimeout(() => {
            butonCompara.innerHTML = textOriginal;
            butonCompara.style.background = '';
        }, 1500);
    }
}

// Afiseaza fereastra de comparare in popup nou
function afiseazaComparare() {
    if (produseComparare.length !== 2) {
        alert('Trebuie sa selectati exact 2 produse pentru comparare!');
        return;
    }
    
    const produs1 = encodeURIComponent(JSON.stringify(produseComparare[0]));
    const produs2 = encodeURIComponent(JSON.stringify(produseComparare[1]));
    
    const urlComparare = `/comparare-produse?produs1=${produs1}&produs2=${produs2}`;
    const fereastraComparare = window.open(urlComparare, 'comparare-produse', 
        'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no');
    
    if (!fereastraComparare) {
        alert('Popup-ul a fost blocat! Va rugam sa permiteti popup-urile pentru acest site.');
    }
    
    actualizeazaUltimaActivitate();
}

// Adauga butoane de comparare pe toate produsele
function adaugaButoaneDComparare() {
    const produseCards = document.querySelectorAll('.produs');
    produseCards.forEach(card => {
        if (card.querySelector('.btn-compara')) return;
        
        const selectCos = card.querySelector('.select-cos');
        if (!selectCos) return;
        
        const produsId = selectCos.value;
        
        const butonCompara = document.createElement('button');
        butonCompara.className = 'btn-compara';
        butonCompara.setAttribute('data-produs-id', produsId);
        butonCompara.innerHTML = '<i class="fas fa-balance-scale"></i> Compara';
        
        butonCompara.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            adaugaProdusComparare(produsId);
        });
        
        const infoDiv = card.querySelector('.info-prod');
        if (infoDiv) {
            infoDiv.appendChild(butonCompara);
        }
    });
    
    // Adauga buton si pe pagina individuala a produsului
    const paginaProdusuluiContainer = document.querySelector('.produs-individual, .detalii-produs, .produs-container');
    if (paginaProdusuluiContainer && window.location.pathname.includes('/produs/')) {
        if (paginaProdusuluiContainer.querySelector('.btn-compara')) return;
        
        const urlParts = window.location.pathname.split('/');
        const produsId = urlParts[urlParts.length - 1];
        
        if (produsId && !isNaN(produsId)) {
            const butonCompara = document.createElement('button');
            butonCompara.className = 'btn-compara';
            butonCompara.setAttribute('data-produs-id', produsId);
            butonCompara.innerHTML = '<i class="fas fa-balance-scale"></i> Compara acest produs';
            
            butonCompara.addEventListener('click', function(e) {
                e.preventDefault();
                adaugaProdusComparare(produsId);
            });
            
            const descriere = paginaProdusuluiContainer.querySelector('.descriere, .produs-descriere, p');
            if (descriere) {
                descriere.parentNode.insertBefore(butonCompara, descriere.nextSibling);
            } else {
                paginaProdusuluiContainer.appendChild(butonCompara);
            }
        }
    }
}

// Initializeaza sistemul de comparare produse
function initializeazaComparator() {
    if (!estePaginaProduse()) {
        return;
    }
    
    produseComparare = incarcaListaComparare();
    
    if (produseComparare.length > 0) {
        actualizeazaContainerComparare();
    }
    
    setTimeout(() => {
        adaugaButoaneDComparare();
        actualizeazaStareButoane();
    }, 100);
    
    // Observer pentru produse adaugate dinamic
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList.contains('produs') || node.querySelector('.produs'))) {
                        setTimeout(() => {
                            adaugaButoaneDComparare();
                            actualizeazaStareButoane();
                        }, 50);
                    }
                });
            }
        });
    });
    
    const gridProduse = document.querySelector('.grid-produse');
    if (gridProduse) {
        observer.observe(gridProduse, { childList: true, subtree: true });
    }
    
    const bodyObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        node.querySelector && node.querySelector('.produs')) {
                        setTimeout(() => {
                            adaugaButoaneDComparare();
                            actualizeazaStareButoane();
                        }, 50);
                    }
                });
            }
        });
    });
    
    bodyObserver.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('beforeunload', function() {
    ascundeTooltip();
});

window.stergeProdusComparare = stergeProdusComparare;
window.afiseazaComparare = afiseazaComparare;
window.adaugaProdusComparare = adaugaProdusComparare;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeazaComparator,
        adaugaProdusComparare,
        afiseazaComparare,
        stergeProdusComparare
    };
}