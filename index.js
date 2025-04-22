const express = require("express");
const path = require("path");
const fs = require("fs");

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

const vect_foldere = ["temp"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
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

app.get(["/", "/index", "/home"], function(req, res) {
    res.render("pagini/index", {ip: req.ip});
});

app.get("/index/a", function(req, res) {
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

app.get("/*", function(req, res) {
    try {
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