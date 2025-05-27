const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const sass = require("sass");
const sharp = require("sharp");
const pg = require("pg");
const Client = pg.Client;

const client = new Client({
    database: "elitekits",
    user: "filip", 
    password: "123456",
    host: "localhost",
    port: 5432
});

async function connectDB() {
    try {
        await client.connect();
        const result = await client.query("SELECT NOW() as timp, COUNT(*) as total FROM tricouri");
        console.log("Conexiune BD reușită:", result.rows[0]);
    } catch (err) {
        console.error("Eroare conectare baza de date:", err.message);
    }
}

global.obiectGlobal = {
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/scss"),
    folderBackup: path.join(__dirname, "backup"),
    intervalBackupCleanup: 30
};

["temp", "backup"].forEach(f => {
    const folder = path.join(__dirname, f);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

async function stergeBackupVechi() {
    try {
        const folderBackup = obiectGlobal.folderBackup;
        const intervalMinute = obiectGlobal.intervalBackupCleanup;
        const acum = new Date();
        const limitaTimp = new Date(acum.getTime() - intervalMinute * 60 * 1000);
        
        console.log(`[BACKUP] Verificare fișiere mai vechi de ${intervalMinute} minute...`);
        
        const stergeRecursiv = async (folderCurent) => {
            try {
                const fisiere = await fsp.readdir(folderCurent, { withFileTypes: true });
                
                for (const fisier of fisiere) {
                    const caleFisier = path.join(folderCurent, fisier.name);
                    
                    if (fisier.isDirectory()) {
                        await stergeRecursiv(caleFisier);
                        
                        try {
                            const fisiereFolderCurent = await fsp.readdir(caleFisier);
                            if (fisiereFolderCurent.length === 0) {
                                await fsp.rmdir(caleFisier);
                                console.log(`[BACKUP] Folder gol șters: ${caleFisier}`);
                            }
                        } catch (err) {
                        }
                    } else {
                        try {
                            const statFisier = await fsp.stat(caleFisier);
                            if (statFisier.mtime < limitaTimp) {
                                await fsp.unlink(caleFisier);
                                console.log(`[BACKUP] Fișier vechi șters: ${caleFisier}`);
                            }
                        } catch (err) {
                        }
                    }
                }
            } catch (err) {
                console.error(`[BACKUP] Eroare la citirea folderului ${folderCurent}:`, err.message);
            }
        };
        
        if (fs.existsSync(folderBackup)) {
            await stergeRecursiv(folderBackup);
        }
        
    } catch (err) {
        console.error("[BACKUP] Eroare la cleanup-ul backup-ului:", err.message);
    }
}

const intervalCleanup = setInterval(() => {
    stergeBackupVechi();
}, 15 * 60 * 1000);

async function compileazaScss(caleScss, caleCss) {
    const scssAbs = path.isAbsolute(caleScss)
        ? caleScss
        : path.join(obiectGlobal.folderScss, caleScss);

    const cssAbs = caleCss
        ? (path.isAbsolute(caleCss) ? caleCss : path.join(obiectGlobal.folderCss, caleCss))
        : path.join(obiectGlobal.folderScss, path.basename(scssAbs, ".scss") + ".css");

    const backupPath = path.join(obiectGlobal.folderBackup, "resurse/scss");
    await fsp.mkdir(backupPath, { recursive: true });
    
    const originalStderr = process.stderr.write;
    const originalStdout = process.stdout.write;

    try {
        if (fs.existsSync(cssAbs)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const numeFisier = path.basename(cssAbs, ".css");
            const caleBackup = path.join(backupPath, `${numeFisier}_${timestamp}.css`);
            
            try {
                await fsp.copyFile(cssAbs, caleBackup);
            } catch (copyErr) {
                console.log(`[SCSS] Nu s-a putut face backup: ${copyErr.message}`);
            }
        }
        
        process.stderr.write = function(chunk, encoding, callback) {
            if (typeof chunk === 'string' && !chunk.includes('Deprecation Warning')) {
                return originalStderr.call(process.stderr, chunk, encoding, callback);
            }
            if (Buffer.isBuffer(chunk)) {
                const str = chunk.toString();
                if (!str.includes('Deprecation Warning')) {
                    return originalStderr.call(process.stderr, chunk, encoding, callback);
                }
            }
            if (callback) callback();
            return true;
        };
        
        process.stdout.write = function(chunk, encoding, callback) {
            if (typeof chunk === 'string' && !chunk.includes('Deprecation Warning')) {
                return originalStdout.call(process.stdout, chunk, encoding, callback);
            }
            if (Buffer.isBuffer(chunk)) {
                const str = chunk.toString();
                if (!str.includes('Deprecation Warning')) {
                    return originalStdout.call(process.stdout, chunk, encoding, callback);
                }
            }
            if (callback) callback();
            return true;
        };

        const rezultat = sass.compile(scssAbs, { style: "expanded" });
        
        process.stderr.write = originalStderr;
        process.stdout.write = originalStdout;
        
        await fsp.writeFile(cssAbs, rezultat.css);
        console.log(`[SCSS] Compilat: ${scssAbs} -> ${cssAbs}`);
    } catch (err) {
        process.stderr.write = originalStderr;
        process.stdout.write = originalStdout;
        console.error(`[Eroare] La compilarea ${scssAbs}:`, err.message);
    }
}

function compileazaToateScss() {
    const fisiere = fs.readdirSync(obiectGlobal.folderScss).filter(f => f.endsWith(".scss"));
    for (let f of fisiere) {
        if (f === "custom.scss") {
            compileazaScss(f, path.join(obiectGlobal.folderCss, "custom.css"));
        } else {
            compileazaScss(f);
        }
    }
}

fs.watch(obiectGlobal.folderScss, (event, filename) => {
    if (filename && filename.endsWith(".scss")) {
        console.log(`[SCSS] Detectat eveniment: ${event} la ${filename}`);
        
        let caleCss;
        if (filename === "custom.scss") {
            caleCss = path.join(obiectGlobal.folderCss, "custom.css");
        }

        compileazaScss(filename, caleCss);
    }
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Folderul proiectului:", __dirname);
console.log("Calea fisierului index.js:", __filename);
console.log("Folderul curent de lucru:", process.cwd());

app.set("view engine", "ejs");

const obGlobal = {
    obErori: null
};

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);

    obGlobal.obErori.eroare_default.imagine = obGlobal.obErori.cale_baza + "/" + obGlobal.obErori.eroare_default.imagine;
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function(elem) { 
        return elem.identificator == identificator;
    });
    
    let titluCustom, textCustom, imagineCustom;
    
    if (eroare) {
        if (eroare.status)
            res.status(identificator);
        titluCustom = titlu || eroare.titlu;
        textCustom = text || eroare.text;
        imagineCustom = imagine || eroare.imagine;
    } else {
        let err = obGlobal.obErori.eroare_default;
        titluCustom = titlu || err.titlu;
        textCustom = text || err.text;
        imagineCustom = imagine || err.imagine;
    }

    imagineCustom = imagineCustom.replace(/\\/g, '/');
    
    res.render("pagini/eroare", {
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom,
    });
}

function filtreazaImaginiDupaTimp(imagini, ora) {
    return imagini.filter(imagine => {
        const interval = imagine.timp.split("-");
        if (interval.length !== 2) return false;
        
        const oraStart = interval[0].trim();
        const oraEnd = interval[1].trim();
    
        const [startH, startM] = oraStart.split(":").map(Number);
        const [endH, endM] = oraEnd.split(":").map(Number);
        const [currentH, currentM] = ora.split(":").map(Number);
        
        const startMinute = startH * 60 + startM;
        const endMinute = endH * 60 + endM;
        const currentMinute = currentH * 60 + currentM;
        
        return currentMinute >= startMinute && currentMinute <= endMinute;
    });
}

async function creeazaImaginiRedimensionate(numeFisier, caleFisier, caleFolderDest) {
    if (!fs.existsSync(caleFolderDest)) {
        fs.mkdirSync(caleFolderDest, { recursive: true });
    }
    
    const caleImagineOut = path.join(caleFolderDest, numeFisier);

    if (fs.existsSync(caleImagineOut)) {
        return;
    }
    
    try {
        await sharp(caleFisier)
            .resize({
                width: path.basename(caleFolderDest) === "mic" ? 150 : 300,
                height: path.basename(caleFolderDest) === "mic" ? 150 : 300,
                fit: "cover"
            })
            .toFile(caleImagineOut);
    } catch (err) {
        console.error(`Eroare la redimensionarea imaginii ${numeFisier}:`, err);
    }
}

function incarcaImaginiGalerie(req, res, next) {
    try {
        const caleJson = path.join(__dirname, "resurse/json/galerie.json");
        const galerie = JSON.parse(fs.readFileSync(caleJson).toString("utf8"));
        const oraCurenta = new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", hour12: false });
        const imaginiFiltered = filtreazaImaginiDupaTimp(galerie.imagini, oraCurenta);
        const caleGalerie = path.join(__dirname, galerie.cale_galerie);
        const caleMic = path.join(caleGalerie, "mic");
        const caleMediu = path.join(caleGalerie, "mediu");

        if (!fs.existsSync(caleMic)) {
            fs.mkdirSync(caleMic, { recursive: true });
        }
        
        if (!fs.existsSync(caleMediu)) {
            fs.mkdirSync(caleMediu, { recursive: true });
        }

        imaginiFiltered.forEach(imagine => {
            const numeFisier = imagine.cale_imagine;
            const caleFisier = path.join(caleGalerie, numeFisier);
            
            if (fs.existsSync(caleFisier)) {
                creeazaImaginiRedimensionate(numeFisier, caleFisier, caleMic);
                creeazaImaginiRedimensionate(numeFisier, caleFisier, caleMediu);
            }
        });
        
        res.locals.imagini = imaginiFiltered;
        res.locals.cale_galerie = galerie.cale_galerie;
    } catch (err) {
        console.error("Eroare la încărcarea galeriei:", err);
    }
    
    next();
}

async function obtineProduseSimilare(produsId, produs) {
    try {
        const query = `
            WITH produse_similare AS (
                SELECT 
                    id, nume, descriere, pret, tip_echipa, sezon, categorie, 
                    caracteristici, pentru_copii, imagine, echipa, liga, tara, 
                    jucator, numar_tricou, data_adaugare,
                    (
                        CASE WHEN echipa = $2 THEN 30 ELSE 0 END +
                        CASE WHEN tip_echipa = $3 THEN 25 ELSE 0 END +
                        CASE WHEN categorie = $4 THEN 20 ELSE 0 END +
                        CASE WHEN liga = $5 AND liga IS NOT NULL THEN 15 ELSE 0 END +
                        CASE WHEN pentru_copii = $6 THEN 10 ELSE 0 END +
                        CASE WHEN tara = $7 AND tara IS NOT NULL THEN 10 ELSE 0 END +
                        CASE WHEN sezon = $8 THEN 8 ELSE 0 END +
                        CASE 
                            WHEN pret BETWEEN $9 * 0.7 AND $9 * 1.3 THEN 15
                            WHEN pret BETWEEN $9 * 0.5 AND $9 * 1.5 THEN 8
                            ELSE 0 
                        END +
                        CASE 
                            WHEN caracteristici && $10::VARCHAR[] THEN 12
                            ELSE 0
                        END
                    ) AS scor_similaritate
                FROM tricouri 
                WHERE id != $1
            )
            SELECT *
            FROM produse_similare
            WHERE scor_similaritate > 15
            ORDER BY scor_similaritate DESC, nume ASC
            LIMIT 6
        `;

        const rezultat = await client.query(query, [
            produsId,
            produs.echipa,
            produs.tip_echipa,
            produs.categorie,
            produs.liga,
            produs.pentru_copii,
            produs.tara,
            produs.sezon,
            produs.pret,
            produs.caracteristici || []
        ]);

        return rezultat.rows;

    } catch (err) {
        console.error("Eroare la obținerea produselor similare:", err.message);
        
        try {
            const fallbackQuery = `
                SELECT id, nume, descriere, pret, tip_echipa, sezon, categorie, 
                       caracteristici, pentru_copii, imagine, echipa, liga, tara, 
                       jucator, numar_tricou, data_adaugare
                FROM tricouri 
                WHERE id != $1 
                AND (categorie = $2 OR tip_echipa = $3)
                ORDER BY RANDOM()
                LIMIT 4
            `;
            
            const fallbackRezultat = await client.query(fallbackQuery, [
                produsId, 
                produs.categorie, 
                produs.tip_echipa
            ]);
            
            return fallbackRezultat.rows;
        } catch (fallbackErr) {
            console.error("Eroare și la fallback:", fallbackErr.message);
            return [];
        }
    }
}

const vect_foldere = ["temp", "resurse/imagini/galerie", "resurse/imagini/galerie/mic", "resurse/imagini/galerie/mediu", "resurse/json"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
    }
}

app.use(function(req, res, next) {
    res.locals.ip = req.ip;
    next();
});

app.use(async function(req, res, next) {
    try {
        const rezultat = await client.query(`
            SELECT unnest(enum_range(null::tipuri_echipe)) as tip_echipa
            ORDER BY tip_echipa
        `);
        res.locals.categoriiMeniu = rezultat.rows.map(row => row.tip_echipa);
    } catch (err) {
        console.error("Eroare middleware categorii:", err.message);
        res.locals.categoriiMeniu = ['club', 'nationala', 'fotbalist'];
    }
    next();
});

app.use("/resurse", function(req, res, next) {
    const fullPath = path.join(__dirname, "resurse", req.url);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        if (!req.url.endsWith("/")) {
            afisareEroare(res, 403);
            return;
        }
    }
    next();
}, express.static(path.join(__dirname, "resurse")));

app.get("/favicon.ico", function(req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon.ico"));
});

app.get(["/", "/index", "/home"], incarcaImaginiGalerie, function(req, res) {
    res.render("pagini/index", {ip: req.ip});
});

app.get("/index/a", incarcaImaginiGalerie, function(req, res) {
    res.render("pagini/index", {ip: req.ip});
});

app.get("/cerere", function(req, res) {
    res.send("<p style='color:blue'>Buna ziua</p>");
});

app.get("/fisier", function(req, res) {
    res.sendFile(path.join(__dirname, "package.json"));
});

app.get('/produse', async (req, res) => {
    const tipEchipaFiltru = req.query.tip_echipa;
    
    try {
        let query = `
            SELECT id, nume, descriere, pret, tip_echipa, sezon, categorie, 
                   pentru_copii, imagine, echipa, liga, tara, jucator, 
                   numar_tricou, caracteristici, data_adaugare
            FROM tricouri 
        `;
        
        let params = [];
        
        if (tipEchipaFiltru && tipEchipaFiltru !== 'toate') {
            query += ' WHERE tip_echipa = $1';
            params.push(tipEchipaFiltru);
        }
        
        query += ' ORDER BY nume ASC';
        
        const rezultatProduse = await client.query(query, params);
        
        let produseProcesate = rezultatProduse.rows;
        if (produseProcesate.length > 0) {
            const categorii = {};
            
            produseProcesate.forEach(produs => {
                const categorie = produs.categorie;
                if (!categorii[categorie] || produs.pret < categorii[categorie].pret) {
                    categorii[categorie] = produs;
                }
            });
            
            const celeMaiIeftineIds = Object.values(categorii).map(p => p.id);
            produseProcesate = produseProcesate.map(produs => ({
                ...produs,
                esteCelMaiIeftin: celeMaiIeftineIds.includes(produs.id)
            }));
        }
        
        let rezultatCategorii = null;
        try {
            rezultatCategorii = await client.query(`
                SELECT DISTINCT unnest(enum_range(null::categ_tricou)) as unnest 
                ORDER BY unnest
            `);
        } catch (catErr) {
            console.log("Nu s-au putut încărca categoriile din enum");
        }
        
        res.render('pagini/produse', { 
            produse: produseProcesate,
            optiuni: rezultatCategorii ? rezultatCategorii.rows : null,
            tipEchipaFiltru: tipEchipaFiltru || 'toate',
            ip: req.ip || 'necunoscut'
        });
        
    } catch (err) {
        console.error("Eroare la încărcarea produselor:", err.message);
        
        res.render('pagini/produse', { 
            produse: null,
            optiuni: null,
            tipEchipaFiltru: tipEchipaFiltru || 'toate',
            ip: req.ip || 'necunoscut'
        });
    }
});

app.get('/api/produse', async (req, res) => {
    const tipEchipaFiltru = req.query.tip_echipa;
    
    try {
        let query = `
            SELECT id, nume, descriere, pret, tip_echipa, sezon, categorie, 
                   pentru_copii, imagine, echipa, liga, tara, jucator, 
                   numar_tricou, caracteristici, data_adaugare
            FROM tricouri 
        `;
        
        let params = [];
        
        if (tipEchipaFiltru && tipEchipaFiltru !== 'toate') {
            query += ' WHERE tip_echipa = $1';
            params.push(tipEchipaFiltru);
        }
        
        query += ' ORDER BY nume ASC';
        
        const result = await client.query(query, params);
        
        let produseAPI = result.rows;
        if (produseAPI.length > 0) {
            const categorii = {};
            
            produseAPI.forEach(produs => {
                const categorie = produs.categorie;
                if (!categorii[categorie] || produs.pret < categorii[categorie].pret) {
                    categorii[categorie] = produs;
                }
            });
            
            const celeMaiIeftineIds = Object.values(categorii).map(p => p.id);
            produseAPI = produseAPI.map(produs => ({
                ...produs,
                esteCelMaiIeftin: celeMaiIeftineIds.includes(produs.id)
            }));
        }
        
        res.json(produseAPI);
        
    } catch (err) {
        console.error("Eroare API produse:", err.message);
        res.json([]);
    }
});

app.get('/produs/:id', async (req, res) => {
    const produsId = parseInt(req.params.id);
    
    if (isNaN(produsId)) {
        afisareEroare(res, 404, "Produs negăsit", "ID-ul produsului nu este valid");
        return;
    }
    
    try {
        const rezultat = await client.query(`
            SELECT id, nume, descriere, pret, tip_echipa, sezon, categorie, 
                   caracteristici, pentru_copii, imagine, echipa, liga, tara, 
                   jucator, numar_tricou, data_adaugare
            FROM tricouri 
            WHERE id = $1
        `, [produsId]);
        
        if (rezultat.rows.length === 0) {
            afisareEroare(res, 404, "Produs negăsit", "Nu există un produs cu acest ID");
            return;
        }
        
        const produs = rezultat.rows[0];
        const produseSimilare = await obtineProduseSimilare(produsId, produs);
        const seturiProdus = await obtineSeturiPentruProdus(produsId);
        
        res.render('pagini/produs', { 
            prod: produs,
            produseSimilare: produseSimilare,
            seturiProdus: seturiProdus,
            ip: req.ip || 'necunoscut'
        });
        
    } catch (err) {
        console.error("Eroare la încărcarea produsului:", err.message);
        afisareEroare(res, 500, "Eroare server", "Nu s-a putut încărca produsul");
    }
});

app.get('/seturi', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id as set_id,
                s.nume_set,
                s.descriere_set,
                COUNT(as_set.id_produs) as numar_produse,
                json_agg(
                    json_build_object(
                        'id', t.id,
                        'nume', t.nume,
                        'pret', t.pret,
                        'imagine', t.imagine,
                        'echipa', t.echipa,
                        'categorie', t.categorie,
                        'tip_echipa', t.tip_echipa
                    ) ORDER BY t.nume
                ) as produse
            FROM seturi s
            LEFT JOIN asociere_set as_set ON s.id = as_set.id_set
            LEFT JOIN tricouri t ON as_set.id_produs = t.id
            GROUP BY s.id, s.nume_set, s.descriere_set
            HAVING COUNT(as_set.id_produs) > 0
            ORDER BY s.nume_set
        `;
        
        const rezultat = await client.query(query);
        
        const seturiCuPreturi = rezultat.rows.map(set => {
            const numProduse = set.numar_produse;
            const pretTotal = set.produse.reduce((sum, produs) => sum + parseFloat(produs.pret), 0);
            const reducereProcentaj = Math.min(5, numProduse) * 5;
            const pretCuReducere = pretTotal * (1 - reducereProcentaj / 100);
            
            return {
                ...set,
                pret_total: pretTotal,
                reducere_procentaj: reducereProcentaj,
                pret_final: pretCuReducere,
                economie: pretTotal - pretCuReducere
            };
        });
        
        res.render('pagini/seturi', { 
            seturi: seturiCuPreturi,
            ip: req.ip || 'necunoscut'
        });
        
    } catch (err) {
        console.error("Eroare la încărcarea seturilor:", err.message);
        afisareEroare(res, 500, "Eroare server", "Nu s-au putut încărca seturile de produse");
    }
});

app.get('/set/:id', async (req, res) => {
    const setId = parseInt(req.params.id);
    
    if (isNaN(setId)) {
        afisareEroare(res, 404, "Set negăsit", "ID-ul setului nu este valid");
        return;
    }
    
    try {
        const query = `
            SELECT 
                s.id as set_id,
                s.nume_set,
                s.descriere_set,
                json_agg(
                    json_build_object(
                        'id', t.id,
                        'nume', t.nume,
                        'descriere', t.descriere,
                        'pret', t.pret,
                        'imagine', t.imagine,
                        'echipa', t.echipa,
                        'liga', t.liga,
                        'tara', t.tara,
                        'categorie', t.categorie,
                        'tip_echipa', t.tip_echipa,
                        'sezon', t.sezon,
                        'pentru_copii', t.pentru_copii,
                        'caracteristici', t.caracteristici
                    ) ORDER BY t.nume
                ) as produse
            FROM seturi s
            JOIN asociere_set as_set ON s.id = as_set.id_set
            JOIN tricouri t ON as_set.id_produs = t.id
            WHERE s.id = $1
            GROUP BY s.id, s.nume_set, s.descriere_set
        `;
        
        const rezultat = await client.query(query, [setId]);
        
        if (rezultat.rows.length === 0) {
            afisareEroare(res, 404, "Set negăsit", "Nu există un set cu acest ID");
            return;
        }
        
        const set = rezultat.rows[0];
        const numProduse = set.produse.length;
        const pretTotal = set.produse.reduce((sum, produs) => sum + parseFloat(produs.pret), 0);
        const reducereProcentaj = Math.min(5, numProduse) * 5;
        const pretCuReducere = pretTotal * (1 - reducereProcentaj / 100);
        
        const setComplet = {
            ...set,
            pret_total: pretTotal,
            reducere_procentaj: reducereProcentaj,
            pret_final: pretCuReducere,
            economie: pretTotal - pretCuReducere
        };
        
        res.render('pagini/set', { 
            set: setComplet,
            ip: req.ip || 'necunoscut'
        });
        
    } catch (err) {
        console.error("Eroare la încărcarea setului:", err.message);
        afisareEroare(res, 500, "Eroare server", "Nu s-a putut încărca setul");
    }
});

async function obtineSeturiPentruProdus(produsId) {
    try {
        const query = `
            SELECT 
                s.id as set_id,
                s.nume_set,
                s.descriere_set,
                COUNT(as_set.id_produs) as numar_produse_in_set,
                json_agg(
                    json_build_object(
                        'id', t.id,
                        'nume', t.nume,
                        'pret', t.pret,
                        'imagine', t.imagine
                    ) ORDER BY t.nume
                ) FILTER (WHERE t.id != $1) as alte_produse_din_set
            FROM seturi s
            JOIN asociere_set as_set ON s.id = as_set.id_set
            JOIN asociere_set as_current ON s.id = as_current.id_set AND as_current.id_produs = $1
            LEFT JOIN tricouri t ON as_set.id_produs = t.id
            GROUP BY s.id, s.nume_set, s.descriere_set
            ORDER BY s.nume_set
        `;
        
        const rezultat = await client.query(query, [produsId]);
        
        const seturiCuPreturi = [];
        
        for (let set of rezultat.rows) {
            const queryPreturi = `
                SELECT t.pret 
                FROM tricouri t
                JOIN asociere_set as_set ON t.id = as_set.id_produs
                WHERE as_set.id_set = $1
            `;
            
            const pretRez = await client.query(queryPreturi, [set.set_id]);
            const pretTotal = pretRez.rows.reduce((sum, row) => sum + parseFloat(row.pret), 0);
            const reducereProcentaj = Math.min(5, set.numar_produse_in_set) * 5;
            const pretCuReducere = pretTotal * (1 - reducereProcentaj / 100);
            
            seturiCuPreturi.push({
                ...set,
                pret_total: pretTotal,
                reducere_procentaj: reducereProcentaj,
                pret_final: pretCuReducere,
                economie: pretTotal - pretCuReducere
            });
        }
        
        return seturiCuPreturi;
        
    } catch (err) {
        console.error("Eroare la obținerea seturilor pentru produs:", err.message);
        return [];
    }
}

app.get('/comparare-produse', function(req, res) {
    const produs1Param = req.query.produs1;
    const produs2Param = req.query.produs2;
    
    if (!produs1Param || !produs2Param) {
        afisareEroare(res, 400, "Date incomplete", "Nu s-au primit datele necesare pentru compararea produselor.");
        return;
    }
    
    try {
        const produs1 = JSON.parse(decodeURIComponent(produs1Param));
        const produs2 = JSON.parse(decodeURIComponent(produs2Param));
        
        if (!produs1.id || !produs2.id || !produs1.nume || !produs2.nume) {
            throw new Error('Date produse incomplete');
        }
        
        res.render('pagini/comparare-produse', { 
            produs1: produs1,
            produs2: produs2,
            ip: req.ip || 'necunoscut'
        });
        
    } catch (error) {
        console.error('Eroare la procesarea comparării:', error);
        afisareEroare(res, 400, "Eroare de procesare", "S-a produs o eroare la procesarea datelor pentru comparare.");
    }
});

app.get("/*.ejs", function(req, res) {
    afisareEroare(res, 400);
});

app.get("/galerie", incarcaImaginiGalerie, function(req, res) {
    res.render("pagini/galerie", {ip: req.ip});
});

app.get("/*", function(req, res) {
    try {
        const middlewares = [];
        if (req.url.includes("galerie")) {
            middlewares.push(incarcaImaginiGalerie);
        }
        
        const renderPage = function() {
            res.render("pagini" + req.url, {ip: req.ip}, function(err, rezultatRandare) {
                if (err) {
                    if (err.message.startsWith("Failed to lookup view")) {
                        afisareEroare(res, 404);
                    } else {
                        afisareEroare(res);
                    }
                } else {
                    res.send(rezultatRandare);
                }
            });
        };
        
        if (middlewares.length > 0) {
            let idx = 0;
            const next = function() {
                if (idx < middlewares.length) {
                    const mw = middlewares[idx++];
                    mw(req, res, next);
                } else {
                    renderPage();
                }
            };
            next();
        } else {
            renderPage();
        }
    } catch (errRandare) {
        if (errRandare.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        } else {
            afisareEroare(res);
        }
    }
});

async function startServer() {
    await connectDB();
    compileazaToateScss();
    
    app.listen(8080, () => {
        console.log("Serverul Elite Kits rulează pe http://localhost:8080");
        console.log(`[BACKUP] Cleanup automat activat - fișiere mai vechi de ${obiectGlobal.intervalBackupCleanup} minute vor fi șterse`);
    });
}

process.on('SIGINT', async () => {
    console.log('\nÎnchidere server...');
    
    if (intervalCleanup) {
        clearInterval(intervalCleanup);
        console.log('Interval cleanup backup oprit');
    }
    
    try {
        await client.end();
        console.log('Conexiune baza de date închisă');
    } catch (err) {
        console.log('Eroare la închiderea conexiunii DB');
    }
    process.exit(0);
});

startServer().catch(err => {
    console.error('Eroare la pornirea serverului:', err);
    app.listen(8080, () => {
        console.log("Server pornit fără conexiune DB pe http://localhost:8080");
        console.log(`[BACKUP] Cleanup automat activat - fișiere mai vechi de ${obiectGlobal.intervalBackupCleanup} minute vor fi șterse`);
    });
});