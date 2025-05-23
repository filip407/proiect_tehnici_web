const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const sass = require("sass");
const sharp = require("sharp");

global.obiectGlobal = {
  folderScss: path.join(__dirname, "resurse/scss"),
  folderCss: path.join(__dirname, "resurse/scss"),
  folderBackup: path.join(__dirname, "backup")
};

["temp", "backup"].forEach(f => {
  const folder = path.join(__dirname, f);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

async function compileazaScss(caleScss, caleCss) {
  const scssAbs = path.isAbsolute(caleScss)
    ? caleScss
    : path.join(obiectGlobal.folderScss, caleScss);

  const cssAbs = caleCss
    ? (path.isAbsolute(caleCss) ? caleCss : path.join(obiectGlobal.folderCss, caleCss))
    : path.join(obiectGlobal.folderCss, path.basename(scssAbs, ".scss") + ".css");

  const backupPath = path.join(obiectGlobal.folderBackup, "resurse/scss");
  await fsp.mkdir(backupPath, { recursive: true });

  try {
    if (fs.existsSync(cssAbs)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const numeFisier = path.basename(cssAbs, ".css");
      const caleBackup = path.join(backupPath, `${numeFisier}_${timestamp}.css`);
      await fsp.copyFile(cssAbs, caleBackup);
    }

    const rezultat = sass.compile(scssAbs, { style: "expanded" });
    await fsp.writeFile(cssAbs, rezultat.css);
    console.log(`[SCSS] Compilat: ${scssAbs} -> ${cssAbs}`);
  } catch (err) {
    console.error(`[Eroare] La compilarea ${scssAbs}:`, err.message);
  }
}

function compileazaToateScss() {
    const fisiere = fs.readdirSync(obiectGlobal.folderScss).filter(f => f.endsWith(".scss"));
    for (let f of fisiere) {
      compileazaScss(f);
    }
    
    if (fs.existsSync(path.join(obiectGlobal.folderScss, "custom.scss"))) {
      compileazaScss("custom.scss", path.join(obiectGlobal.folderCss, "custom.css"));
      console.log("Am compilat custom.scss");
    }
  }
  

  fs.watch(obiectGlobal.folderScss, (event, filename) => {
    if (filename && filename.endsWith(".scss")) {
      console.log(`[SCSS] Detectat eveniment: ${event} pe ${filename}`);
      
      let caleCss;
      if (filename === "custom.scss") {
        caleCss = path.join(obiectGlobal.folderCss, "custom.css");
      } 

      compileazaScss(filename, caleCss);
    }
  });

app = express();

console.log("Folderul proiectului: ", __dirname);
console.log("Calea fisierului index.js: ", __filename);
console.log("Folderul curent de lucru: ", process.cwd());

app.set("view engine", "ejs");

obGlobal = {
    obErori: null
}

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    console.log(continut)
    obGlobal.obErori = JSON.parse(continut);
    console.log(obGlobal.obErori)

    obGlobal.obErori.eroare_default.imagine = obGlobal.obErori.cale_baza + "/" + obGlobal.obErori.eroare_default.imagine;
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine = obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
    console.log(obGlobal.obErori)
    
}

initErori();

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elem){ 
        return elem.identificator == identificator;
    });
    
    let titluCustom, textCustom, imagineCustom;
    
    if(eroare){
        if(eroare.status)
            res.status(identificator);
        titluCustom = titlu || eroare.titlu;
        textCustom = text || eroare.text;
        imagineCustom = imagine || eroare.imagine;
    }
    else{
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

const vect_foldere = ["temp", "resurse/imagini/galerie", "resurse/imagini/galerie/mic", "resurse/imagini/galerie/mediu", "resurse/json"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
        console.log(`Creat folder: ${folder}`);
    } else {
        console.log(`Folderul ${folder} există deja.`);
    }
}

app.use(function(req, res, next) {
    res.locals.ip = req.ip;
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
                    console.log(rezultatRandare);
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

app.listen(8080);
console.log("Serverul a pornit");