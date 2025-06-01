// Variabile globale pentru orar
let orarData = null;
let orarTimeout = null;

// Încarcă datele orarului
async function incarcaOrarData() {
    try {
        const response = await fetch('/resurse/json/orar.json');
        orarData = await response.json();
        return orarData;
    } catch (error) {
        console.error('Eroare la încărcarea orarului:', error);
        // Orar de fallback
        orarData = {
            orar: [
                { zi: "Luni", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Marți", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Miercuri", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Joi", ore_deschidere: "09:00", ore_inchidere: "18:00", deschis: true },
                { zi: "Vineri", ore_deschidere: "09:00", ore_inchidere: "20:00", deschis: true },
                { zi: "Sâmbătă", ore_deschidere: "10:00", ore_inchidere: "16:00", deschis: true },
                { zi: "Duminică", ore_deschidere: "00:00", ore_inchidere: "00:00", deschis: false }
            ]
        };
        return orarData;
    }
}

// Obține ziua curentă în format românesc
function getZiuaCurenta() {
    const zile = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    const acum = new Date();
    return zile[acum.getDay()];
}

// Verifică dacă magazinul este deschis acum
function esteDeschisAcum() {
    if (!orarData) return false;
    
    const acum = new Date();
    const ziuaCurenta = getZiuaCurenta();
    const oraCurenta = acum.getHours() * 60 + acum.getMinutes(); // în minute de la miezul nopții
    
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

// Formatează ora curentă
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

// Construiește tabelul cu orarul
function construiesteOrar() {
    if (!orarData) return;
    
    const tabelCorp = document.getElementById('tabel-orar-corp');
    if (!tabelCorp) return;
    
    const ziuaCurenta = getZiuaCurenta();
    
    tabelCorp.innerHTML = '';
    
    orarData.orar.forEach(zi => {
        const rand = document.createElement('tr');
        
        // Marchează ziua curentă
        if (zi.zi === ziuaCurenta) {
            rand.classList.add('zi-curenta');
        }
        
        // Coloana cu ziua
        const celulaZi = document.createElement('td');
        celulaZi.textContent = zi.zi;
        celulaZi.style.fontWeight = zi.zi === ziuaCurenta ? 'bold' : 'normal';
        
        // Coloana cu programul
        const celulaProgram = document.createElement('td');
        if (zi.deschis) {
            celulaProgram.textContent = `${zi.ore_deschidere} - ${zi.ore_inchidere}`;
        } else {
            celulaProgram.textContent = 'ÎNCHIS';
            celulaProgram.style.fontWeight = 'bold';
        }
        
        // Coloana cu statusul
        const celulaStatus = document.createElement('td');
        const spanStatus = document.createElement('span');
        
        if (zi.deschis) {
            spanStatus.textContent = 'Deschis';
            spanStatus.className = 'status-deschis';
        } else {
            spanStatus.textContent = 'Închis';
            spanStatus.className = 'status-inchis';
        }
        
        celulaStatus.appendChild(spanStatus);
        
        rand.appendChild(celulaZi);
        rand.appendChild(celulaProgram);
        rand.appendChild(celulaStatus);
        
        tabelCorp.appendChild(rand);
    });
}

// Actualizează statusul curent al magazinului
function actualizeazaStatusCurent() {
    const statusMagazin = document.getElementById('status-magazin');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const oraCurentaText = document.getElementById('ora-curenta-text');
    
    if (!statusMagazin || !statusIcon || !statusText || !oraCurentaText) return;
    
    const deschis = esteDeschisAcum();
    
    // Actualizează ora curentă
    oraCurentaText.textContent = formateazaOraCurenta();
    
    // Actualizează statusul
    if (deschis) {
        statusMagazin.className = 'status-indicator deschis';
        statusIcon.className = 'fas fa-check-circle';
        statusText.textContent = 'MAGAZINUL ESTE DESCHIS ACUM';
    } else {
        statusMagazin.className = 'status-indicator inchis';
        statusIcon.className = 'fas fa-times-circle';
        statusText.textContent = 'MAGAZINUL ESTE ÎNCHIS ACUM';
    }
}

// Afișează orarul
async function afiseazaOrar() {
    // Încarcă datele dacă nu sunt deja încărcate
    if (!orarData) {
        await incarcaOrarData();
    }
    
    const overlay = document.getElementById('orar-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        // Construiește tabelul
        construiesteOrar();
        
        // Actualizează statusul curent
        actualizeazaStatusCurent();
        
        // Actualizează statusul la fiecare secundă
        const intervalStatus = setInterval(actualizeazaStatusCurent, 1000);
        
        // Înregistrează intervalul pentru a-l putea opri când se închide orarul
        overlay.setAttribute('data-interval', intervalStatus);
        
        // Închide automat după 15 secunde (opțional)
        orarTimeout = setTimeout(() => {
            inchideOrar();
        }, 15000);
        
        // Adaugă event listener pentru ESC
        document.addEventListener('keydown', inchideOrarEsc);
        
        // Adaugă event listener pentru click pe overlay
        overlay.addEventListener('click', inchideOrarClick);
    }
}

// Închide orarul
function inchideOrar() {
    const overlay = document.getElementById('orar-overlay');
    if (overlay) {
        // Animație de ieșire
        overlay.style.animation = 'fadeOut 0.3s ease-in-out';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.animation = '';
        }, 300);
        
        // Oprește intervalul de actualizare
        const intervalId = overlay.getAttribute('data-interval');
        if (intervalId) {
            clearInterval(parseInt(intervalId));
            overlay.removeAttribute('data-interval');
        }
        
        // Oprește timeout-ul automat
        if (orarTimeout) {
            clearTimeout(orarTimeout);
            orarTimeout = null;
        }
        
        // Elimină event listeners
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

// Adaugă CSS pentru animația fadeOut
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

// Inițializare când se încarcă pagina
document.addEventListener('DOMContentLoaded', function() {
    // Adaugă animațiile CSS
    adaugaAnimatiiCSS();
    
    // Preîncarcă datele orarului
    incarcaOrarData();
    
    // Verifică dacă există butonul de orar și adaugă event listener
    const btnOrar = document.getElementById('btn-orar');
    if (btnOrar) {
        btnOrar.addEventListener('click', afiseazaOrar);
    }
    
    // Verifică dacă există linkul de orar în footer și adaugă event listener
    const linkOrar = document.getElementById('link-orar');
    if (linkOrar) {
        linkOrar.addEventListener('click', function(e) {
            e.preventDefault();
            afiseazaOrar();
        });
    }
});

// Export pentru folosire globală
window.afiseazaOrar = afiseazaOrar;
window.inchideOrar = inchideOrar;