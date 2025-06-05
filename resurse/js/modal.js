/* ETAPA 6, Bonus 11: Modal box pentru afisarea detaliilor produsului */

// Creaza structura modalului pentru afisarea detaliilor produsului
function creeazaModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modal-produs';
    
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-titlu">Detalii Produs</h2>
                <button class="modal-close" id="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="modal-info">
                    <div class="modal-imagine-container">
                        <div class="modal-imagine">
                            <img id="modal-img" src="" alt="Imagine produs" />
                        </div>
                        <button class="btn-sub-imagine" id="modal-vizualizare">
                            <i class="fas fa-eye"></i> Vezi pagina produsului
                        </button>
                    </div>
                    <div class="modal-detalii">
                        <div class="modal-badges" id="modal-badges"></div>
                        <table class="modal-tabel" id="modal-tabel">
                        </table>
                        <div class="modal-descriere">
                            <h4><i class="fas fa-info-circle"></i> Descriere</h4>
                            <p id="modal-descriere-text">Descrierea produsului va fi afisata aici...</p>
                        </div>
                        <div class="modal-caracteristici" id="modal-caracteristici-container">
                            <h4><i class="fas fa-star"></i> Caracteristici</h4>
                            <div class="caracteristici-lista" id="modal-caracteristici-lista"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

// Populeaza modalul cu datele produsului selectat
async function populeazaModal(produsId) {
    const produse = window.produse || [];
    const produs = produse.find(p => p.id === parseInt(produsId));
    if (!produs) {
        console.error('Produsul nu a fost gasit:', produsId);
        return;
    }
    
    document.getElementById('modal-titlu').textContent = produs.nume;
    
    const modalImg = document.getElementById('modal-img');
    modalImg.src = `/resurse/imagini/produse/${produs.imagine}`;
    modalImg.alt = `Imagine ${produs.nume}`;
    modalImg.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRyaWNvdTwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RWxpdGUgS2l0czwvdGV4dD4KICA8L3N2Zz4K';
    };
    
    const modalBadges = document.getElementById('modal-badges');
    modalBadges.innerHTML = '';
    
    if (produs.pentru_copii) {
        modalBadges.innerHTML += '<span class="badge badge-kids"><i class="fas fa-child"></i> Pentru Copii</span>';
    }
    
    // ETAPA 6, Bonus 14: Marcarea celui mai ieftin produs din fiecare categorie
    if (typeof determinaCelMaiIeftinPeCategorie === 'function') {
        const celeMaiIeftineIds = determinaCelMaiIeftinPeCategorie(produse);
        if (produs.esteCelMaiIeftin || celeMaiIeftineIds.includes(produs.id)) {
            modalBadges.innerHTML += '<span class="badge badge-cheapest"><i class="fas fa-crown"></i> CEL MAI IEFTIN DIN CATEGORIE</span>';
        }
    }
    
    const modalTabel = document.getElementById('modal-tabel');
    modalTabel.innerHTML = `
        <tr>
            <td><strong><i class="fas fa-euro-sign"></i> Pret:</strong></td>
            <td class="val-pret">${produs.pret.toFixed(2)} RON</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-users"></i> Echipa:</strong></td>
            <td>${produs.echipa}</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-trophy"></i> Liga:</strong></td>
            <td>${produs.liga || 'N/A'}</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-calendar"></i> Sezon:</strong></td>
            <td>${produs.sezon}</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-tag"></i> Categorie:</strong></td>
            <td>${produs.categorie}</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-tshirt"></i> Tip echipa:</strong></td>
            <td>${produs.tip_echipa ? produs.tip_echipa.charAt(0).toUpperCase() + produs.tip_echipa.slice(1) : 'N/A'}</td>
        </tr>
        <tr>
            <td><strong><i class="fas fa-child"></i> Pentru copii:</strong></td>
            <td>${produs.pentru_copii ? 'Da' : 'Nu'}</td>
        </tr>
        ${produs.jucator ? `
        <tr>
            <td><strong><i class="fas fa-user"></i> Jucator:</strong></td>
            <td>${produs.jucator}</td>
        </tr>
        ` : ''}
        ${produs.numar_tricou ? `
        <tr>
            <td><strong><i class="fas fa-hashtag"></i> Numarul tricou:</strong></td>
            <td>${produs.numar_tricou}</td>
        </tr>
        ` : ''}
        ${produs.tara ? `
        <tr>
            <td><strong><i class="fas fa-flag"></i> Tara:</strong></td>
            <td>${produs.tara}</td>
        </tr>
        ` : ''}
    `;
    
    document.getElementById('modal-descriere-text').textContent = 
        produs.descriere || 'Tricou de fotbal de calitate premium din colectia Elite Kits.';
    
    const caracteristiciContainer = document.getElementById('modal-caracteristici-container');
    const caracteristiciLista = document.getElementById('modal-caracteristici-lista');
    
    if (produs.caracteristici && produs.caracteristici.length > 0) {
        caracteristiciContainer.style.display = 'block';
        caracteristiciLista.innerHTML = produs.caracteristici.map(caract => 
            `<span class="caracteristica-item">
                <i class="fas fa-check-circle"></i> ${caract}
            </span>`
        ).join('');
    } else {
        caracteristiciContainer.style.display = 'none';
    }
    
    if (produs.data_adaugare && typeof formatareDataRomana === 'function') {
        const dataAdaugare = new Date(produs.data_adaugare);
        const dataFormatata = formatareDataRomana(dataAdaugare);
        modalTabel.innerHTML += `
            <tr>
                <td><strong><i class="fas fa-plus-circle"></i> Data adaugare:</strong></td>
                <td>${dataFormatata}</td>
            </tr>
        `;
    }
    
    document.getElementById('modal-vizualizare').onclick = () => {
        window.open(`/produs/${produs.id}`, '_blank');
    };
}

// Afiseaza modalul cu informatiile produsului
function deschideModal(produsId) {
    let modal = document.getElementById('modal-produs');
    
    if (!modal) {
        modal = creeazaModal();
        
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = modal;
        
        modalClose.addEventListener('click', inchideModal);
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                inchideModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                inchideModal();
            }
        });
        
        modal.querySelector('.modal-content').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    populeazaModal(produsId);
    
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0) scale(1)';
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

// Inchide modalul
function inchideModal() {
    const modal = document.getElementById('modal-produs');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(-20px) scale(0.95)';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Ataseaza event listeners pentru deschiderea modalului la click pe produs
function atasaEventListenersModal() {
    document.addEventListener('click', function(e) {
        const produsContainer = e.target.closest('.produs');
        
        if (produsContainer) {
            const clickTarget = e.target;
            if (clickTarget.tagName === 'A' || 
                clickTarget.type === 'checkbox' || 
                clickTarget.tagName === 'BUTTON' ||
                clickTarget.closest('a') ||
                clickTarget.closest('label.selecteaza-cos') ||
                clickTarget.closest('.btn-compara')) {
                return;
            }
            
            e.preventDefault();
            
            const selectCos = produsContainer.querySelector('.select-cos');
            if (selectCos) {
                const produsId = selectCos.value;
                deschideModal(produsId);
            }
        }
    });
}

// Initializeaza modalul
function initializeazaModal() {
    atasaEventListenersModal();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        deschideModal,
        inchideModal,
        initializeazaModal
    };
}