/* ETAPA 7, Bonus 19: Orarul sa poata fi vizualizat pe orice pagina */

let orarData = null;
let orarTimeout = null;

// Incarca datele orarului din fisierul JSON
async function incarcaOrarData() {
    try {
        const response = await fetch('/resurse/json/orar.json');
        orarData = await response.json();
        return orarData;
    } catch (error) {
        console.error('Eroare la incarcarea orarului:', error);
        // Orar de fallback
        orarData = {
            orar: [
                { zi: "Luni", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Marti", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Miercuri", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Joi", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Vineri", ore_deschidere: "09:00", ore_inchidere: "20:00", deschis: true },
                { zi: "Sambata", ore_deschidere: "10:00", ore_inchidere: "16:00", deschis: true },
                { zi: "Duminica", ore_deschidere: "00:00", ore_inchidere: "00:00", deschis: false }
            ]
        };
        return orarData;
    }
}

// Determina ziua curenta in format romanesc
function getZiuaCurenta() {
    const zile = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
    const acum = new Date();
    return zile[acum.getDay()];
}

// Verifica daca magazinul este deschis in momentul curent
function esteDeschisAcum() {
    if (!orarData) return false;
    
    const acum = new Date();
    const ziuaCurenta = getZiuaCurenta();
    const oraCurenta = acum.getHours() * 60 + acum.getMinutes();
    
    const programZi = orarData.orar.find(zi => zi.zi === ziuaCurenta);
    
    if (!programZi || !programZi.deschis) {
        return false;
    }
    
    const [oreD, minuteD] = programZi.ore_deschidere.split(':').map(Number);
    const [oreI, minuteI] = programZi.ore_inchidere.split(':').map(Number);
    
    const oraDeschidere = oreD * 60 + minuteD;
    const oraInchidere = oreI * 60 + minuteI;
    
    return oraCurenta >= oraDeschidere && oraCurenta < oraInchidere;
}

// Formateaza ora curenta pentru afisare
function formateazaOraCurenta() {
    const acum = new Date();
    const optiuni = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Bucharest'
    };
    
    return acum.toLocaleDateString('ro-RO', optiuni);
}

// Construieste tabelul cu orarul magazinului
function construiesteOrar() {
    if (!orarData) return;
    
    const tabelCorp = document.getElementById('tabel-orar-corp');
    if (!tabelCorp) return;
    
    const ziuaCurenta = getZiuaCurenta();
    
    tabelCorp.innerHTML = '';
    
    orarData.orar.forEach(zi => {
        const rand = document.createElement('tr');
        
        if (zi.zi === ziuaCurenta) {
            rand.classList.add('zi-curenta');
        }
        
        const celulaZi = document.createElement('td');
        celulaZi.textContent = zi.zi;
        celulaZi.style.fontWeight = zi.zi === ziuaCurenta ? 'bold' : 'normal';
        
        const celulaProgram = document.createElement('td');
        if (zi.deschis) {
            celulaProgram.textContent = `${zi.ore_deschidere} - ${zi.ore_inchidere}`;
        } else {
            celulaProgram.textContent = 'INCHIS';
            celulaProgram.style.fontWeight = 'bold';
        }
        
        const celulaStatus = document.createElement('td');
        const spanStatus = document.createElement('span');
        
        if (zi.deschis) {
            spanStatus.textContent = 'Deschis';
            spanStatus.className = 'status-deschis';
        } else {
            spanStatus.textContent = 'Inchis';
            spanStatus.className = 'status-inchis';
        }
        
        celulaStatus.appendChild(spanStatus);
        
        rand.appendChild(celulaZi);
        rand.appendChild(celulaProgram);
        rand.appendChild(celulaStatus);
        
        tabelCorp.appendChild(rand);
    });
}

// Actualizeaza statusul curent al magazinului cu marcarea zilei curente
function actualizeazaStatusCurent() {
    const statusMagazin = document.getElementById('status-magazin');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const oraCurentaText = document.getElementById('ora-curenta-text');
    
    if (!statusMagazin || !statusIcon || !statusText || !oraCurentaText) return;
    
    const deschis = esteDeschisAcum();
    
    oraCurentaText.textContent = formateazaOraCurenta();
    
    if (deschis) {
        statusMagazin.className = 'status-indicator deschis';
        statusIcon.className = 'fas fa-check-circle';
        statusText.textContent = 'MAGAZINUL ESTE DESCHIS ACUM';
    } else {
        statusMagazin.className = 'status-indicator inchis';
        statusIcon.className = 'fas fa-times-circle';
        statusText.textContent = 'MAGAZINUL ESTE INCHIS ACUM';
    }
}

// Afiseaza orarul cu actualizare automata
async function afiseazaOrar() {
    if (!orarData) {
        await incarcaOrarData();
    }
    
    const overlay = document.getElementById('orar-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        construiesteOrar();
        actualizeazaStatusCurent();
        
        const intervalStatus = setInterval(actualizeazaStatusCurent, 1000);
        overlay.setAttribute('data-interval', intervalStatus);
        
        orarTimeout = setTimeout(() => {
            inchideOrar();
        }, 15000);
        
        document.addEventListener('keydown', inchideOrarEsc);
        overlay.addEventListener('click', inchideOrarClick);
    }
}

// Inchide orarul
function inchideOrar() {
    const overlay = document.getElementById('orar-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-in-out';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.animation = '';
        }, 300);
        
        const intervalId = overlay.getAttribute('data-interval');
        if (intervalId) {
            clearInterval(parseInt(intervalId));
            overlay.removeAttribute('data-interval');
        }
        
        if (orarTimeout) {
            clearTimeout(orarTimeout);
            orarTimeout = null;
        }
        
        document.removeEventListener('keydown', inchideOrarEsc);
        overlay.removeEventListener('click', inchideOrarClick);
    }
}

// Handler pentru tasta ESC
function inchideOrarEsc(event) {
    if (event.key === 'Escape') {
        inchideOrar();
    }
}

// Handler pentru click pe overlay
function inchideOrarClick(event) {
    if (event.target.id === 'orar-overlay') {
        inchideOrar();
    }
}

// Adauga animatiile CSS pentru fadeOut
function adaugaAnimatiiCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initializeaza orarul la incarcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    adaugaAnimatiiCSS();
    incarcaOrarData();
    
    const btnOrar = document.getElementById('btn-orar');
    if (btnOrar) {
        btnOrar.addEventListener('click', afiseazaOrar);
    }
    
    const linkOrar = document.getElementById('link-orar');
    if (linkOrar) {
        linkOrar.addEventListener('click', function(e) {
            e.preventDefault();
            afiseazaOrar();
        });
    }
});

window.afiseazaOrar = afiseazaOrar;
window.inchideOrar = inchideOrar;