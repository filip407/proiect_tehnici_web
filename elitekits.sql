DROP TYPE IF EXISTS categ_tricou;
DROP TYPE IF EXISTS tipuri_echipe;

CREATE TYPE categ_tricou AS ENUM('acasa', 'deplasare', 'editie speciala', 'antrenament', 'retro', 'comemorativ');
CREATE TYPE tipuri_echipe AS ENUM('club', 'nationala', 'fotbalist');

CREATE TABLE IF NOT EXISTS tricouri (
   id serial PRIMARY KEY,
   nume VARCHAR(100) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   tip_echipa tipuri_echipe DEFAULT 'club',
   sezon VARCHAR(20) NOT NULL,
   categorie categ_tricou DEFAULT 'acasa',
   caracteristici VARCHAR[],
   pentru_copii BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   echipa VARCHAR(100) NOT NULL,
   liga VARCHAR(100),
   tara VARCHAR(50),
   jucator VARCHAR(100),
   numar_tricou INT CHECK (numar_tricou >= 1 AND numar_tricou <= 99),
   data_adaugare DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO tricouri (nume, descriere, pret, sezon, tip_echipa, categorie, caracteristici, pentru_copii, imagine, echipa, liga, tara, jucator, numar_tricou, data_adaugare) VALUES 

('Tricou FC Barcelona 2019/2020 Acasă', 'Noul design revoluționar cu inserții de carbon pentru o ventilație optimă', 299.99, '2019/2020', 'club', 'acasa', '{"DryFit","carbon inserts","antimicrobial"}', FALSE, 'barcelona-2019-acasa.jpg', 'FC Barcelona', 'La Liga', 'Spania', NULL, NULL, '2025-01-15'),

('Tricou Real Madrid 2024/2025 Acasă', 'Inspirat de istoria glorioasă a clubului, cu accente aurii și tehnologie DryFit', 289.99, '2024/2025', 'club', 'acasa', '{"DryFit","gold accents","premium fabric"}', FALSE, 'real-madrid-2024-acasa.jpg', 'Real Madrid', 'La Liga', 'Spania', NULL, NULL, '2025-01-10'),

('Tricou România Euro 2024', 'Ediție specială cu detalii tricolore elegante', 199.99, '2024', 'nationala', 'editie speciala', '{"tricolor","captain signature","commemorative"}', FALSE, 'romania-euro-2024.jpg', 'România', 'Euro 2024', 'România', NULL, NULL, '2024-03-20'),

('Tricou Manchester United 2024/2025 Acasă', 'Tricoul clasic al diavolilor roșii cu tehnologie modernă', 279.99, '2024/2025', 'club', 'acasa', '{"moisture wicking","classic design","premium cotton"}', FALSE, 'manchester-united-2024-acasa.jpg', 'Manchester United', 'Premier League', 'Anglia', NULL, NULL, '2025-02-01'),

('Tricou Liverpool 2019/2020 Acasă', 'You''ll Never Walk Alone - tricoul legendar al Reds', 269.99, '2019/2020', 'club', 'acasa', '{"breathable","iconic red","YNWA emblem"}', FALSE, 'liverpool-2019-acasa.jpg', 'Liverpool', 'Premier League', 'Anglia', NULL, NULL, '2025-01-25'),

('Tricou Manchester City 2019/2020 Acasă', 'Sky Blues cu design modern și tehnologie Climacool', 289.99, '2019/2020', 'club', 'acasa', '{"Climacool","sky blue","modern fit"}', FALSE, 'manchester-city-2019-acasa.jpg', 'Manchester City', 'Premier League', 'Anglia', NULL, NULL, '2025-02-10'),

('Tricou Bayern München 2019/2020 Acasă', 'Mia san mia - tricoul campionilor Bavariei', 299.99, '2019/2020', 'club', 'acasa', '{"Bavarian pride","championship quality","ergonomic"}', FALSE, 'bayern-2019-acasa.jpg', 'Bayern München', 'Bundesliga', 'Germania', NULL, NULL, '2025-01-30'),

('Tricou Juventus 2019/2020 Acasă', 'Tricoul iconic al echipei din Torino', 259.99, '2019/2020', 'club', 'acasa', '{"black white stripes","Italian craftsmanship","classic"}', FALSE, 'juventus-2019-acasa.jpg', 'Juventus', 'Serie A', 'Italia', NULL, NULL, '2025-02-05'),

('Tricou PSG 2019/2020 Acasă', 'Ici c''est Paris - elegența pariziană în tricou', 319.99, '2019/2020', 'club', 'acasa', '{"Parisian elegance","luxury fabric","modern design"}', FALSE, 'psg-2019-acasa.jpg', 'Paris Saint-Germain', 'Ligue 1', 'Franța', NULL, NULL, '2025-01-20'),

('Tricou Messi #10 Barcelona Retro 2010/2011', 'Tricou retro cu numele și numărul legendei argentiniene', 189.99, '2010/2011', 'fotbalist', 'retro', '{"retro design","Messi legend","collector item"}', FALSE, 'messi-barcelona-retro.jpg', 'FC Barcelona', 'La Liga', 'Spania', 'Lionel Messi', 10, '2023-11-15'),

('Tricou Ronaldo #7 Manchester United 2021/2022', 'Întoarcerea regelui la Old Trafford', 249.99, '2021/2022', 'fotbalist', 'comemorativ', '{"CR7 return","Old Trafford legend","premium quality"}', FALSE, 'ronaldo-united-2021.jpg', 'Manchester United', 'Premier League', 'Anglia', 'Cristiano Ronaldo', 7, '2023-09-10'),

('Tricou Copii Barcelona 2024/2025', 'Tricou pentru micii suporteri', 149.99, '2024/2025', 'club', 'acasa', '{"kid friendly","soft fabric","durable"}', TRUE, 'barcelona-2024-copii.jpg', 'FC Barcelona', 'La Liga', 'Spania', NULL, NULL, '2025-01-18'),

('Tricou Portugalia 2022/2023', 'Tricoul naționalei lusitane cu tradiție', 179.99, '2022/2023', 'nationala', 'acasa', '{"Portuguese pride","traditional colors","national team"}', FALSE, 'portugalia-2022.jpg', 'Portugalia', 'Nations League', 'Portugalia', NULL, NULL, '2024-01-12'),

('Tricou Antrenament Real Madrid 2025', 'Tricou de antrenament folosit de Los Blancos', 129.99, '2024/2025', 'club', 'antrenament', '{"training gear","lightweight","sweat resistant"}', FALSE, 'real-madrid-antrenament.jpg', 'Real Madrid', 'La Liga', 'Spania', NULL, NULL, '2024-12-20'),

('Tricou Haaland #9 Manchester City 2025', 'Tricoul fenomenului norvegian', 329.99, '2025/2026', 'fotbalist', 'acasa', '{"Haaland power","goal machine","premium edition"}', FALSE, 'haaland-city-2025.jpg', 'Manchester City', 'Premier League', 'Anglia', 'Erling Haaland', 9, '2025-02-15'),

('Tricou Vintage Brazil 1970', 'Tricoul legendar al Mondialului din 1970', 159.99, '1970', 'nationala', 'retro', '{"World Cup 1970","Pelé era","vintage classic"}', FALSE, 'brazil-1970-vintage.jpg', 'Brazilia', 'World Cup', 'Brazilia', NULL, NULL, '2023-06-01'),

('Tricou Real Madrid 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - clasicul tricou alb', 289.99, '2024/2025', 'club', 'acasa', '{"DryFit","classic white","breathable"}', FALSE, 'tricou1.jpg', 'Real Madrid', 'La Liga', 'Spania', NULL, NULL, '2024-08-15'),

('Tricou Barcelona 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - varianta neagră', 299.99, '2024/2025', 'club', 'deplasare', '{"DryFit","black edition","premium fabric"}', FALSE, 'tricou2.jpg', 'FC Barcelona', 'La Liga', 'Spania', NULL, NULL, '2024-08-20'),

('Tricou Arsenal 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - varianta neagră', 259.99, '2024/2025', 'club', 'deplasare', '{"gunners spirit","black edition","modern fit"}', FALSE, 'tricou3.jpg', 'Arsenal', 'Premier League', 'Anglia', NULL, NULL, '2024-08-25'),

('Tricou Juventus 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - clasicele dungi alb-negru', 259.99, '2024/2025', 'club', 'acasa', '{"black white stripes","Italian craftsmanship","traditional"}', FALSE, 'tricou4.jpg', 'Juventus', 'Serie A', 'Italia', NULL, NULL, '2024-08-30'),

('Tricou PSG Acasă 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025', 319.99, '2024/2025', 'club', 'acasa', '{"Parisian elegance","blue pride","luxury fabric"}', FALSE, 'tricou5.jpg', 'Paris Saint-Germain', 'Ligue 1', 'Franța', NULL, NULL, '2024-09-05'),

('Tricou Bayern München Ediție Specială 2024/2025', 'Tricou ediție specială, sezonul 2024-2025', 329.99, '2024/2025', 'club', 'editie speciala', '{"Bavarian pride","special edition","premium quality"}', FALSE, 'tricou6.jpg', 'Bayern München', 'Bundesliga', 'Germania', NULL, NULL, '2024-09-10'),

('Tricou Real Madrid Deplasare 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - varianta portocalie', 289.99, '2024/2025', 'club', 'deplasare', '{"DryFit","orange design","breathable"}', FALSE, 'tricou7.jpg', 'Real Madrid', 'La Liga', 'Spania', NULL, NULL, '2024-09-15'),

('Tricou Tottenham Hotspur 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025', 249.99, '2024/2025', 'club', 'acasa', '{"Spurs pride","white tradition","premium cotton"}', FALSE, 'tricou8.jpg', 'Tottenham Hotspur', 'Premier League', 'Anglia', NULL, NULL, '2024-09-20'),

('Tricou AC Milan 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025 - clasicele dungi roșu-negru', 269.99, '2024/2025', 'club', 'acasa', '{"Milan tradition","red black stripes","San Siro spirit"}', FALSE, 'tricou9.jpg', 'AC Milan', 'Serie A', 'Italia', NULL, NULL, '2024-09-25'),

('Tricou Bayern Leverkusen 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025', 229.99, '2024/2025', 'club', 'acasa', '{"Werkself spirit","red design","German quality"}', FALSE, 'tricou10.jpg', 'Bayer Leverkusen', 'Bundesliga', 'Germania', NULL, NULL, '2024-10-01'),

('Tricou Lyon 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025', 219.99, '2024/2025', 'club', 'deplasare', '{"OL pride","black edition","French style"}', FALSE, 'tricou11.jpg', 'Olympique Lyon', 'Ligue 1', 'Franța', NULL, NULL, '2024-10-05'),

('Tricou Marseille 2024/2025', 'Tricou oficial de joc, sezonul 2024-2025', 209.99, '2024/2025', 'club', 'acasa', '{"OM tradition","blue pride","Mediterranean style"}', FALSE, 'tricou12.jpg', 'Olympique Marseille', 'Ligue 1', 'Franța', NULL, NULL, '2024-10-10');

CREATE TABLE IF NOT EXISTS seturi (
    id SERIAL PRIMARY KEY,
    nume_set VARCHAR(150) NOT NULL UNIQUE,
    descriere_set TEXT
);

CREATE TABLE IF NOT EXISTS asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INTEGER REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INTEGER REFERENCES tricouri(id) ON DELETE CASCADE,
    UNIQUE(id_set, id_produs) -- Un produs nu poate fi de două ori în același set
);

INSERT INTO seturi (nume_set, descriere_set) VALUES 
('Pack Champions League', 'Setul complet pentru fanii UEFA Champions League - tricourile celor mai mari echipe europene'),
('Clasicele Spaniei', 'Rivalitatea eternă - Real Madrid și Barcelona în același pachet premium'),
('Premier League Elite', 'Cele mai iconice tricouri din Premier League într-un singur set'),
('Naționala României', 'Colecția completă a tricoului naționalei României pentru suporteri adevărați'),
('Legendele Fotbalului', 'Tricourile unor fotbaliști legendari care au marcat istoria fotbalului'),
('Set Copii Champions', 'Setul perfect pentru micii fotbaliști - tricouri adaptate pentru copii'),
('Tricouri Retro Collection', 'O călătorie în timp prin cele mai emblematice tricouri din istoria fotbalului');

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(1, 2),  -- Real Madrid 2024/2025 Acasă
(1, 1),  -- FC Barcelona 2019/2020 Acasă  
(1, 7),  -- Bayern München 2019/2020 Acasă
(1, 8),  -- Juventus 2019/2020 Acasă
(1, 9);  -- PSG 2019/2020 Acasă

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(2, 2),  -- Real Madrid 2024/2025 Acasă
(2, 17), -- Real Madrid 2024/2025
(2, 23), -- Real Madrid Deplasare 2024/2025
(2, 1),  -- FC Barcelona 2019/2020 Acasă
(2, 18); -- Barcelona 2024/2025

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(3, 4),  -- Manchester United 2024/2025 Acasă
(3, 11), -- Ronaldo #7 Manchester United 2021/2022
(3, 5),  -- Liverpool 2019/2020 Acasă
(3, 6),  -- Manchester City 2019/2020 Acasă
(3, 15), -- Haaland #9 Manchester City 2025
(3, 19); -- Arsenal 2024/2025

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(4, 3),  -- Tricou România Euro 2024
(4, 13); -- Tricou Portugalia 2022/2023 (pentru diversitate)

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(5, 10), -- Messi #10 Barcelona Retro 2010/2011
(5, 11), -- Ronaldo #7 Manchester United 2021/2022
(5, 15); -- Haaland #9 Manchester City 2025

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(6, 12), -- Tricou Copii Barcelona 2024/2025
(6, 1),  -- FC Barcelona 2019/2020 Acasă
(6, 2);  -- Real Madrid 2024/2025 Acasă

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(7, 10), -- Messi #10 Barcelona Retro 2010/2011
(7, 16), -- Tricou Vintage Brazil 1970
(7, 11); -- Ronaldo #7 Manchester United 2021/2022

GRANT ALL PRIVILEGES ON tricouri TO filip;
GRANT ALL PRIVILEGES ON seturi TO filip;
GRANT ALL PRIVILEGES ON asociere_set TO filip;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO filip;