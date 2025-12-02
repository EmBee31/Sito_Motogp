// Statistiche dei piloti
let M = {Nome:"Manuel Bonelli",Nazione:"Italia",Numero:31,Esordio:"2024",Mondiali:0,Gare:0,Vittorie:0,Podi:0,Punti:0,Pole:0,FL:0};
let L = {Nome:"Lorenzo Gabrielli",Nazione:"Italia",Numero:16,Esordio:"2024",Mondiali:0,Gare:0,Vittorie:0,Podi:0,Punti:0,Pole:0,FL:0};

// Array dei file Excel da processare
const excelFiles = [
    '../docs/classifiche/classifica2024.xlsx',
    '../docs/classifiche/classifica2025.xlsx',
    '../docs/classifiche/classifica2026.xlsx'
];

// Variabile per memorizzare il numero di gare per anno
let numeroGarePerAnno = {};

function formattaNomeTeam(nomeTeam) {
    if (!nomeTeam || typeof nomeTeam !== 'string') {
        return nomeTeam || "N/D";
    }
    
    // Converti in minuscolo e dividi le parole
    const parole = nomeTeam.toLowerCase().split(' ');
    
    // Capitalizza ogni parola
    const paroleCapitalizzate = parole.map(parola => {
        // Se la parola è vuota, ritorna vuota
        if (!parola) return '';
        
        // Capitalizza la prima lettera e lascia il resto in minuscolo
        return parola.charAt(0).toUpperCase() + parola.slice(1).toLowerCase();
    });
    
    // Ricostruisci la stringa
    return paroleCapitalizzate.join(' ').trim();
}

// FUNZIONE PER VERIFICARE SE ESISTE LA TABELLA "CLASSIFICA PILOTI"
function esisteClassificaPiloti(sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Cerca la tabella "CLASSIFICA PILOTI" nel foglio
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({c: C, r: R})];
            if (cell && cell.v && cell.v.toString().toLowerCase().includes('classifica piloti')) {
                console.log("✅ Tabella 'CLASSIFICA PILOTI' trovata");
                return true;
            }
        }
    }
    
    console.log("❌ Tabella 'CLASSIFICA PILOTI' non trovata");
    return false;
}

// MODIFICA: FUNZIONE PER ESTRARRE DINAMICAMENTE E CONTARE LE GARE DAL FILE EXCEL
function estraiGareInfo(sheet) {
    const gareInfo = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    let rigaGare = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('pilota')) {
            rigaGare = R;
            break;
        }
    }
    
    if (rigaGare === -1) {
        console.log("Intestazione 'PILOTA' non trovata");
        return [];
    }
    
    const mappaCircuiti = {
        'qatar': { nome: "Lusail", img: "https://flagcdn.com/w80/qa.png" },
        'lusail': { nome: "Lusail", img: "https://flagcdn.com/w80/qa.png" },
        'portogallo': { nome: "Portimão", img: "https://flagcdn.com/w80/pt.png" },
        'portimao': { nome: "Portimão", img: "https://flagcdn.com/w80/pt.png" },
        'americhe': { nome: "Americhe", img: "https://flagcdn.com/w80/us-tx.png" },
        'spagna': { nome: "Jerez", img: "https://flagcdn.com/w80/es.png" },
        'jerez': { nome: "Jerez", img: "https://flagcdn.com/w80/es.png" },
        'francia': { nome: "Le Mans", img: "https://flagcdn.com/w80/fr.png" },
        'lemans': { nome: "Le Mans", img: "https://flagcdn.com/w80/fr.png" },
        'catalogna': { nome: "Catalogna", img: "https://flagcdn.com/w80/es.png" },
        'italia': { nome: "Mugello", img: "https://flagcdn.com/w80/it.png" },
        'mugello': { nome: "Mugello", img: "https://flagcdn.com/w80/it.png" },
        'olanda': { nome: "Assen", img: "https://flagcdn.com/w80/nl.png" },
        'assen': { nome: "Assen", img: "https://flagcdn.com/w80/nl.png" },
        'germania': { nome: "Sachsenring", img: "https://flagcdn.com/w80/de.png" },
        'sachsenring': { nome: "Sachsenring", img: "https://flagcdn.com/w80/de.png" },
        'gran bretagna': { nome: "Silverstone", img: "https://flagcdn.com/w80/gb.png" },
        'silverstone': { nome: "Silverstone", img: "https://flagcdn.com/w80/gb.png" },
        'austria': { nome: "Red Bull Ring", img: "https://flagcdn.com/w80/at.png" },
        'redbullring': { nome: "Red Bull Ring", img: "https://flagcdn.com/w80/at.png" },
        'aragon': { nome: "Aragón", img: "https://flagcdn.com/w80/es.png" },
        'misano': { nome: "Misano", img: "https://flagcdn.com/w80/sm.png" },
        'indonesia': { nome: "Mandalika", img: "https://flagcdn.com/w80/id.png" },
        'mandalika': { nome: "Mandalika", img: "https://flagcdn.com/w80/id.png" },
        'giappone': { nome: "Motegi", img: "https://flagcdn.com/w80/jp.png" },
        'motegi': { nome: "Motegi", img: "https://flagcdn.com/w80/jp.png" },
        'australia': { nome: "Phillip Island", img: "https://flagcdn.com/w80/au.png" },
        'phillipisland': { nome: "Phillip Island", img: "https://flagcdn.com/w80/au.png" },
        'thailandia': { nome: "Buriram", img: "https://flagcdn.com/w80/th.png" },
        'buriram': { nome: "Buriram", img: "https://flagcdn.com/w80/th.png" },
        'sepang': { nome: "Sepang", img: "https://flagcdn.com/w80/my.png" },
        'valencia': { nome: "Valencia", img: "https://flagcdn.com/w80/es.png" },
        'termas': { nome: "Termas de Río Hondo", img: "https://flagcdn.com/w80/ar.png" },
        'brno': { nome: "Brno", img: "https://flagcdn.com/w80/cz.png" },
        'buddh': { nome: "Buddh", img: "https://flagcdn.com/w80/in.png" },
        'india': { nome: "Buddh", img: "https://flagcdn.com/w80/in.png" },
        'malesia': { nome: "Sepang", img: "https://flagcdn.com/w80/my.png" },
        'rp. ceca': { nome: "Brno", img: "https://flagcdn.com/w80/cz.png" },
        'argentina': { nome: "Termas de Río Hondo", img: "https://flagcdn.com/w80/ar.png" },
        'usa': { nome: "Americhe", img: "https://flagcdn.com/w80/us-tx.png" },
        'kazakhstan': { nome: "Sokol", img: "https://flagcdn.com/w80/kz.png" }
    };
    
    const contatoriPiste = {};
    
    // CONTEGGIO EFFETTIVO DELLE GARE
    // Iniziamo dalla colonna 3 (D) che è la prima colonna di gara dopo: 0=Pilota, 1=Punti, 2=Scuderia
    let numeroGare = 0;
    
    for (let C = 3; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({r: rigaGare, c: C})];
        
        // Se la cella è vuota o non esiste, TERMINA il conteggio
        if (!cell || !cell.v || cell.v.toString().trim() === '') {
            console.log(`Terminato conteggio gare alla colonna ${C} - cella vuota`);
            break;
        }
        
        const valoreCella = cell.v;
        const valoreStringa = valoreCella.toString().trim();
        const nomeGara = valoreStringa.toLowerCase();
        
        // Se il valore è un numero (non è il nome di una gara), TERMINA
        if (typeof valoreCella === 'number' || !isNaN(parseFloat(valoreStringa))) {
            console.log(`Terminato conteggio gare alla colonna ${C} - trovato numero: ${valoreCella}`);
            break;
        }
        
        // Se il nome della gara è "TEAM" o riferimenti a sezioni successive, TERMINA
        if (nomeGara.includes('team') || nomeGara.includes('costruttori') || 
            nomeGara.includes('classifica') || nomeGara.includes('qualifica')) {
            console.log(`Terminato conteggio gare alla colonna ${C} - trovata sezione: ${valoreStringa}`);
            break;
        }
        
        // AUMENTA IL CONTATORE DELLE GARE
        numeroGare++;
        
        // Processa la gara
        let circuitoTrovato = null;
        let chiaveTrovata = null;
        
        for (const [key, circuito] of Object.entries(mappaCircuiti)) {
            if (nomeGara.includes(key)) {
                circuitoTrovato = { ...circuito };
                chiaveTrovata = key;
                break;
            }
        }
        
        if (circuitoTrovato) {
            if (!contatoriPiste[chiaveTrovata]) {
                contatoriPiste[chiaveTrovata] = 1;
            } else {
                contatoriPiste[chiaveTrovata]++;
            }
            
            if (contatoriPiste[chiaveTrovata] > 1) {
                circuitoTrovato.nome = `${circuitoTrovato.nome} ${contatoriPiste[chiaveTrovata]}`;
            }
            
            gareInfo.push(circuitoTrovato);
        } else {
            gareInfo.push({
                nome: valoreStringa,
                img: "https://flagcdn.com/w80/_unitednations.png"
            });
        }
    }
    
    console.log(`🏁 Gare estratte dinamicamente: ${numeroGare} gare totali`);
    console.log("Lista gare:", gareInfo);
    return gareInfo;
}

// MODIFICA: Funzione per processare un singolo file Excel
async function processExcelFile(filePath) {
    try {
        console.log(`📊 Tentativo di caricare: ${filePath}`);
        
        const response = await fetch(filePath);
        if (!response.ok) {
            console.log(`❌ File non trovato: ${filePath}`);
            return null;
        }
        
        console.log(`✅ File trovato: ${filePath}`);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const { anno, categoria } = estraiAnnoCategoria(sheet);
        console.log(`Anno e categoria da ${filePath}:`, anno, categoria);

        const gareInfo = estraiGareInfo(sheet);
        
        // Memorizza il numero di gare per questo anno
        numeroGarePerAnno[anno] = gareInfo.length;

        if (gareInfo.length === 0) {
            console.log(`❌ Nessuna gara trovata nel file ${filePath}`);
            return null;
        }

        const classificaPiloti = estraiClassificaPilotiCompleta(sheet);
        
        // Verifica se esiste la tabella CLASSIFICA PILOTI prima di calcolare il campionato
        const classificaFinale = esisteClassificaPiloti(sheet) ? calcolaClassificaFinale(classificaPiloti, sheet) : null;
        
        if (classificaFinale) {
            console.log(`🏆 CLASSIFICA FINALE ${anno}:`, classificaFinale.map((p, i) => `${i+1}°: ${p.Pilota} - ${p.Punti} punti`));
        } else {
            console.log(`ℹ️ Campionato ${anno} ancora in corso - ${gareInfo.length} gare programmate`);
        }

        const storicoBonelli = await estraiStoricoPilota(sheet, "Manuel Bonelli", gareInfo.length);
        const storicoGabrielli = await estraiStoricoPilota(sheet, "Lorenzo Gabrielli", gareInfo.length);

        // Passa anche il numero di gare a aggiornaStatistiche
        if (storicoBonelli) aggiornaStatistiche(sheet, storicoBonelli, classificaFinale, anno, gareInfo.length);
        if (storicoGabrielli) aggiornaStatistiche(sheet, storicoGabrielli, classificaFinale, anno, gareInfo.length);

        return {
            anno,
            categoria,
            gareInfo,
            numeroGare: gareInfo.length,
            classificaPiloti: classificaFinale || classificaPiloti,
            storicoBonelli,
            storicoGabrielli,
            sheet,
            campionatoCompletato: !!classificaFinale
        };

    } catch (error) {
        console.error(`Errore nel processare ${filePath}:`, error);
        return null;
    }
}

// MODIFICA: Main function che itera su tutti i file nell'array
async function main() {
    try {
        console.log('File Excel da processare:', excelFiles);
        
        const risultati = [];
        
        for (const filePath of excelFiles) {
            const risultato = await processExcelFile(filePath);
            if (risultato) {
                risultati.push(risultato);
            }
        }
        
        console.log('Processamento completato per', risultati.length, 'file su', excelFiles.length);
        
        mostraRisultatiNelDOM(risultati);
        
        const container = document.querySelector('.tabelle-container');
        if (container) {
            const containerTop = container.getBoundingClientRect().top + window.scrollY;
            const containerHeight = container.offsetHeight;
            const offset = 150;
            const scrollPosition = containerTop + containerHeight / 2 - window.innerHeight / 2 + offset;

            window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }

    } catch (err) {
        console.error("Errore nel main:", err);
    }
}

// MODIFICA: Mostra i risultati nel DOM con stile Wikipedia e tabelle attaccate
function mostraRisultatiNelDOM(risultati) {
    const infoboxContainer = document.getElementById('infobox-container');
    const storicoContainer = document.getElementById('storico-container');
    
    if (!infoboxContainer || !storicoContainer) {
        console.error("Contenitori non trovati nel DOM");
        return;
    }
    
    infoboxContainer.innerHTML = '';
    storicoContainer.innerHTML = '';
    
    // Mostra le statistiche cumulative dei piloti
    infoboxContainer.appendChild(createTabellaPilota(M));
    infoboxContainer.appendChild(createTabellaPilota(L));
    
    // Raggruppa le tabelle per pilota
    const storicoBonelli = [];
    const storicoGabrielli = [];
    
    risultati.forEach(risultato => {
        const { anno, categoria, gareInfo, storicoBonelli: sb, storicoGabrielli: sg, classificaPiloti, sheet, campionatoCompletato } = risultato;
        
        if (sb) {
            storicoBonelli.push({
                anno, categoria, gareInfo, storicoPilota: sb, classificaPiloti, sheet, campionatoCompletato
            });
        }
        if (sg) {
            storicoGabrielli.push({
                anno, categoria, gareInfo, storicoPilota: sg, classificaPiloti, sheet, campionatoCompletato
            });
        }
    });
    
    // Crea container per Manuel Bonelli con tutte le tabelle attaccate
    if (storicoBonelli.length > 0) {
        // Container principale per tutto il blocco Bonelli
        const bonelliSection = document.createElement('div');
        bonelliSection.className = 'pilota-section';
        bonelliSection.style.marginBottom = '40px';
        bonelliSection.style.width = '100%'; // Occupa tutta la larghezza
        
        // Titolo principale sopra le tabelle
        const bonelliTitle = document.createElement('h2');
        bonelliTitle.textContent = 'Manuel Bonelli';
        bonelliTitle.style.marginTop = '40px';
        bonelliTitle.style.marginBottom = '20px';
        bonelliTitle.style.color = '#2c3e50';
        bonelliTitle.style.borderBottom = '2px solid #2c3e50';
        bonelliTitle.style.paddingBottom = '10px';
        bonelliTitle.style.fontSize = '24px';
        bonelliTitle.style.textAlign = 'center';
        bonelliTitle.style.width = '100%'; // Occupa tutta la larghezza
        bonelliSection.appendChild(bonelliTitle);
        
        // Container per le tabelle attaccate
        const bonelliTablesContainer = document.createElement('div');
        bonelliTablesContainer.className = 'tables-container-attached';
        bonelliTablesContainer.style.width = '100%'; // Occupa tutta la larghezza
        
        storicoBonelli.forEach(dati => {
            const tabella = createTabellaStorico(
                dati.storicoPilota, 
                dati.anno, 
                dati.categoria, 
                dati.classificaPiloti, 
                dati.sheet, 
                dati.gareInfo,
                dati.campionatoCompletato
            );
            // Rimuovi il margine inferiore per attaccare le tabelle
            tabella.style.marginBottom = '0';
            tabella.style.borderBottom = 'none';
            tabella.style.width = '100%'; // Occupa tutta la larghezza
            bonelliTablesContainer.appendChild(tabella);
        });
        
        bonelliSection.appendChild(bonelliTablesContainer);
        storicoContainer.appendChild(bonelliSection);
    }
    
    // Crea container per Lorenzo Gabrielli con tutte le tabelle attaccate
    if (storicoGabrielli.length > 0) {
        // Container principale per tutto il blocco Gabrielli
        const gabrielliSection = document.createElement('div');
        gabrielliSection.className = 'pilota-section';
        gabrielliSection.style.marginBottom = '40px';
        gabrielliSection.style.width = '100%'; // Occupa tutta la larghezza
        
        // Titolo principale sopra le tabelle
        const gabrielliTitle = document.createElement('h2');
        gabrielliTitle.textContent = 'Lorenzo Gabrielli';
        gabrielliTitle.style.marginTop = '40px';
        gabrielliTitle.style.marginBottom = '20px';
        gabrielliTitle.style.color = '#2c3e50';
        gabrielliTitle.style.borderBottom = '2px solid #2c3e50';
        gabrielliTitle.style.paddingBottom = '10px';
        gabrielliTitle.style.fontSize = '24px';
        gabrielliTitle.style.textAlign = 'center';
        gabrielliTitle.style.width = '100%'; // Occupa tutta la larghezza
        gabrielliSection.appendChild(gabrielliTitle);
        
        // Container per le tabelle attaccate
        const gabrielliTablesContainer = document.createElement('div');
        gabrielliTablesContainer.className = 'tables-container-attached';
        gabrielliTablesContainer.style.width = '100%'; // Occupa tutta la larghezza
        
        storicoGabrielli.forEach(dati => {
            const tabella = createTabellaStorico(
                dati.storicoPilota, 
                dati.anno, 
                dati.categoria, 
                dati.classificaPiloti, 
                dati.sheet, 
                dati.gareInfo,
                dati.campionatoCompletato
            );
            // Rimuovi il margine inferiore per attaccare le tabelle
            tabella.style.marginBottom = '0';
            tabella.style.borderBottom = 'none';
            tabella.style.width = '100%'; // Occupa tutta la larghezza
            gabrielliTablesContainer.appendChild(tabella);
        });
        
        gabrielliSection.appendChild(gabrielliTablesContainer);
        storicoContainer.appendChild(gabrielliSection);
    }
    
    if (risultati.length === 0) {
        storicoContainer.innerHTML = '<p style="text-align: center; color: #666;">Nessun dato disponibile</p>';
    }
}

// Le altre funzioni rimangono UGUALI
function estraiAnnoCategoria(sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Cerca la riga che contiene "STAGIONE"
    let rigaIntestazione = -1;
    let testoIntestazione = '';
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({c: C, r: R})];
            if (cell && cell.v) {
                const testo = cell.v.toString();
                if (testo.toUpperCase().includes('STAGIONE')) {
                    rigaIntestazione = R;
                    testoIntestazione = testo;
                    console.log(`✅ Trovata intestazione: "${testoIntestazione}" alla riga ${R}`);
                    break;
                }
            }
        }
        if (rigaIntestazione !== -1) break;
    }
    
    if (rigaIntestazione === -1 || !testoIntestazione) {
        console.log("❌ Intestazione 'STAGIONE' non trovata");
        return { anno: "ND", categoria: "ND" };
    }
    
    let anno = "ND";
    let categoria = "ND";
    
    // Estrai anno: cerca 4 cifre dopo "STAGIONE"
    const matchAnno = testoIntestazione.match(/STAGIONE\s+(\d{4})/i);
    if (matchAnno) {
        anno = matchAnno[1];
    }
    
    // Cerca la categoria dopo i due punti
    const parti = testoIntestazione.split(':');
    if (parti.length >= 2) {
        categoria = parti[1].trim();
        
        // Normalizza la categoria
        categoria = categoria
            .replace(/\s+/g, '')  // Rimuovi tutti gli spazi
            .replace(/^moto/i, 'Moto')  // Capitalizza "Moto"
            .replace(/gp$/i, 'GP');     // Mantieni "GP" maiuscolo
            
        // Se dopo la normalizzazione è "MotoGP", lascialo così
        if (categoria.toLowerCase() === 'motogp') {
            categoria = 'MotoGP';
        }
    }
    
    // Se ancora non trova, cerca nella stringa intera
    if (categoria === '' || categoria === 'ND') {
        const matchCategoria = testoIntestazione.match(/(Moto\s*\d+|Moto\s*GP)/i);
        if (matchCategoria) {
            categoria = matchCategoria[1]
                .replace(/\s+/g, '')  // Rimuovi spazi
                .replace(/^moto/i, 'Moto')
                .replace(/gp$/i, 'GP');
        }
    }
    
    console.log(`✅ Estratto: Anno "${anno}", Categoria "${categoria}"`);
    
    return { anno, categoria };
}

// MODIFICA: Aggiornata per usare il numero effettivo di gare
async function estraiStoricoPilota(sheet, pilotaNome, numeroGareStagione) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let startRow = -1;

    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({c: 0, r: R})];
        if (cell && cell.v && cell.v.toString().trim() === pilotaNome) {
            startRow = R;
            break;
        }
    }
    
    if (startRow === -1) {
        console.error(`Pilota ${pilotaNome} non trovato`);
        return null;
    }

    // Calcola il numero massimo di colonne da estrarre
    // Colonne: 0=Pilota, 1=Punti, 2=Scuderia, 3+=Gare
    const maxColonne = 3 + numeroGareStagione; // Base + gare
    
    console.log(`📊 Per ${pilotaNome}: ${numeroGareStagione} gare di stagione (colonne totali: ${maxColonne})`);

    const storico = [];
    for (let C = 0; C <= maxColonne; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({c: C, r: startRow})];
        storico.push(cell ? cell.v : null);
    }
    
    console.log(`Storico per ${pilotaNome}:`, storico.length, "colonne - prime 10:", storico.slice(0, 10));
    return storico;
}

function getPole(sheet, nomePilota) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let poles = 0, fl = 0;
    
    console.log(`🔍 Cercando Pole/FL per: ${nomePilota}`);
    
    // FASE 1: Trova qualsiasi riga che contenga "qualifica"
    let rigaQualifica = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({c:C,r:R})];
            if (cell && cell.v && cell.v.toString().toLowerCase().includes('qualifica')) {
                rigaQualifica = R;
                console.log(`📊 Trovata sezione qualifica alla riga ${R}: "${cell.v}"`);
                break;
            }
        }
        if (rigaQualifica !== -1) break;
    }
    
    if (rigaQualifica === -1) {
        console.log("❌ Sezione qualifica non trovata");
        return [0, 0];
    }
    
    // FASE 2: Cerca il pilota nelle righe successive (controlla fino a fine foglio)
    let rigaPilota = -1;
    for (let R = rigaQualifica + 1; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({c:0,r:R})];
        // Se la prima cella non è vuota, potrebbe essere un pilota
        if (cell && cell.v && cell.v.toString().trim() !== '') {
            const cellValue = cell.v.toString();
            // Controlla se è il nostro pilota
            if (cellValue.toLowerCase().includes(nomePilota.toLowerCase())) {
                rigaPilota = R;
                console.log(`🎯 Trovato ${nomePilota} alla riga ${R}: "${cellValue}"`);
                break;
            }
        }
    }
    
    if (rigaPilota === -1) {
        console.log(`❌ ${nomePilota} non trovato dopo la sezione qualifica`);
        return [0, 0];
    }
    
    // FASE 3: Analizza TUTTA la riga del pilota
    console.log(`📝 Analizzando TUTTA la riga ${rigaPilota} per ${nomePilota}:`);
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({c:C,r:rigaPilota})];
        if (cell && cell.v) {
            const cellValue = cell.v.toString();
            
            // Conta le Pole (case insensitive)
            const lowerValue = cellValue.toLowerCase();
            if (lowerValue.includes('pole')) {
                poles++;
                console.log(`   ✅ POLE alla colonna ${C}: "${cellValue}"`);
            }
            
            // Conta i FL (case insensitive)
            if (lowerValue.includes('fl')) {
                fl++;
                console.log(`   ✅ FL alla colonna ${C}: "${cellValue}"`);
            }
        }
    }
    
    console.log(`🏁 RISULTATI FINALI per ${nomePilota}: ${poles} Pole, ${fl} FL`);
    return [poles, fl];
}

function verificaVincitoreCampionato(nomePilota, classificaFinale) {
    if (!classificaFinale || classificaFinale.length === 0) {
        console.log("Classifica finale non disponibile");
        return false;
    }
    
    try {
        if (classificaFinale.length > 0) {
            const primoClassificato = classificaFinale[0];
            const isVincitore = primoClassificato.Pilota && 
                               primoClassificato.Pilota.toString().trim().toLowerCase() === nomePilota.trim().toLowerCase();
            
            if (isVincitore) {
                console.log(`🏆 ${nomePilota} è il campione!`);
            }
            return isVincitore;
        }
    } catch (error) {
        console.error("Errore nel calcolo del vincitore:", error);
        return false;
    }
    
    return false;
}

function calcolaClassificaFinale(classificaPiloti, sheet) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        console.log("Nessun dato pilota per calcolare la classifica finale");
        return [];
    }
    
    try {
        const classificaConRisultati = classificaPiloti.map(pilota => {
            if (!pilota || !pilota.Pilota) {
                console.warn("Pilota non valido nella classifica:", pilota);
                return null;
            }
            
            try {
                const risultati = ottieniRisultatiPilota(pilota.Pilota, sheet);
                return {
                    ...pilota,
                    risultati: risultati,
                    vittorie: contaPosizioni(risultati, 1),
                    secondi: contaPosizioni(risultati, 2),
                    terzi: contaPosizioni(risultati, 3),
                    quarti: contaPosizioni(risultati, 4),
                    quinti: contaPosizioni(risultati, 5)
                };
            } catch (error) {
                console.error(`Errore nell'elaborazione di ${pilota.Pilota}:`, error);
                return {
                    ...pilota,
                    risultati: [],
                    vittorie: 0,
                    secondi: 0,
                    terzi: 0,
                    quarti: 0,
                    quinti: 0
                };
            }
        }).filter(pilota => pilota !== null);

        if (classificaConRisultati.length === 0) {
            console.log("Nessun pilota valido per la classifica finale");
            return [];
        }
        
        const classificaOrdinata = [...classificaConRisultati].sort((a, b) => {
            try {
                const puntiA = a.Punti || 0;
                const puntiB = b.Punti || 0;
                
                if (puntiB !== puntiA) {
                    return puntiB - puntiA;
                }
                
                if (b.vittorie !== a.vittorie) {
                    return b.vittorie - a.vittorie;
                }
                
                if (b.secondi !== a.secondi) {
                    return b.secondi - a.secondi;
                }
                
                if (b.terzi !== a.terzi) {
                    return b.terzi - a.terzi;
                }
                
                if (b.quarti !== a.quarti) {
                    return b.quarti - a.quarti;
                }
                
                if (b.quinti !== a.quinti) {
                    return b.quinti - a.quinti;
                }
                
                const ultimoRisultatoA = ottieniUltimoRisultatoValido(a.risultati);
                const ultimoRisultatoB = ottieniUltimoRisultatoValido(b.risultati);
                if (ultimoRisultatoA !== ultimoRisultatoB) {
                    return ultimoRisultatoA - ultimoRisultatoB;
                }
                
                return (b.Pilota || '').localeCompare(a.Pilota || '');
            } catch (error) {
                console.error("Errore nell'ordinamento:", error);
                return 0;
            }
        });
        
        return classificaOrdinata;
    } catch (error) {
        console.error("Errore critico nel calcolo classifica finale:", error);
        return classificaPiloti;
    }
}

// MODIFICA: Aggiornata per usare il numero corretto di gare
function aggiornaStatistiche(sheet, storicoPilota, classificaFinale, anno, numeroGareStagione) {
    if (!storicoPilota) return;
    
    const nome = storicoPilota[0];
    const punti = Number(storicoPilota[1]) || 0;
    const moto = storicoPilota[2] || "N/D";
    
    // Prendi solo le colonne delle gare (dalla colonna 3 in poi)
    const gare = storicoPilota.slice(3);
    
    console.log(`📊 ${anno}: ${nome} - ${gare.length} gare nel file (stagione: ${numeroGareStagione} gare)`);
    
    const [poles, fl] = getPole(sheet, nome);

    const pilota = (nome==="Manuel Bonelli") ? M : L;
    pilota.Punti += punti;
    pilota.Pole += poles;
    pilota.FL += fl;
    pilota.Moto = moto;

    // Considera solo il numero effettivo di gare della stagione
    const gareDaConsiderare = Math.min(gare.length, numeroGareStagione);
    
    for (let i = 0; i < gareDaConsiderare; i++) {
        const g = gare[i];
        
        // Conta SOLO le gare con "RIT" o numeri (gare partecipate)
        // Celle vuote = gara non ancora disputata → NON conta
        // NP = non partecipato → NON conta
        if (g === 'RIT' || g === 'rit' || (g != null && g !== '' && !isNaN(Number(g)))) {
            pilota.Gare++;
            
            // Solo per risultati numerici (posizioni) calcola podi e vittorie
            if (g !== 'RIT' && g !== 'rit') {
                const posizione = Number(g);
                if (posizione <= 3) {
                    pilota.Podi++;
                    if(posizione === 1) pilota.Vittorie++;
                }
            }
        }
        // Celle vuote/null = non contano (gare future o non disputate)
        // NP = non contano (esplicitamente non partecipato)
    }
    
    // Aggiorna i mondiali solo se la classifica finale è disponibile
    if (classificaFinale && classificaFinale.length > 0) {
        try {
            if (verificaVincitoreCampionato(nome, classificaFinale)) {
                pilota.Mondiali++;
                console.log(`🎉 ${nome} ha vinto il campionato ${anno}! Mondiali: ${pilota.Mondiali}`);
            }
        } catch (error) {
            console.error(`Errore nella verifica del campionato per ${nome}:`, error);
        }
    } else {
        console.log(`Classifica finale non disponibile per ${anno} - nessun mondiale aggiunto per ${nome}`);
    }
}

function estraiClassificaPilotiCompleta(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('pilota')) {
            startRow = R + 1;
            break;
        }
    }

    if (startRow === -1) {
        console.log("Intestazione 'PILOTA' non trovata");
        return risultati;
    }

    for (let R = startRow; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
        const cellPunti = sheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
        const cellScuderia = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })];

        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('team')) {
            console.log("Trovata sezione TEAM, interrompo estrazione piloti");
            break;
        }

        if (!cellPilota || !cellPilota.v) continue;

        const pilota = cellPilota.v.toString().trim();
        if (
            pilota === '' ||
            pilota.toLowerCase().includes('pilota') ||
            pilota.toLowerCase().includes('stagione')
        ) {
            continue;
        }

        const scuderia = cellScuderia ? formattaNomeTeam(cellScuderia.v.toString().trim()) : '';

        let punti = 0;
        if (cellPunti) {
            if (cellPunti.v !== undefined && cellPunti.v !== null) {
                const val = cellPunti.v;
                if (typeof val === 'number') {
                    punti = val;
                } else if (typeof val === 'string') {
                    const trimmed = val.trim().toUpperCase();
                    if (!['RIT', 'DNS', 'DNF', 'DSQ', ''].includes(trimmed)) {
                        const num = Number(trimmed.replace(',', '.'));
                        if (!isNaN(num)) punti = num;
                    }
                }
            } else if (cellPunti.f) {
                punti = calcolaPuntiDaFormulaCompleta(cellPunti.f, sheet);
            }
        }

        if (pilota && punti >= 0) {
            const puntiArrotondati = Math.round(punti * 10) / 10;
            risultati.push({
                Pilota: pilota,
                Scuderia: scuderia,
                Punti: puntiArrotondati
            });
        }
    }

    console.log("Classifica piloti estratta:", risultati.length, "pilot" + (risultati.length !== 1 ? 'i' : ''));
    return risultati;
}

function calcolaPuntiDaFormulaCompleta(formula, sheet) {
    const matches = formula.match(/[A-Z]+\d+/g);
    if (!matches) {
        const numberMatches = formula.match(/\d+\.?\d*/g);
        return numberMatches ? numberMatches.reduce((sum, num) => sum + parseFloat(num), 0) : 0;
    }
    
    let totale = 0;
    
    matches.forEach(ref => {
        const cell = sheet[ref];
        if (cell) {
            if (cell.v !== undefined && cell.v !== null) {
                if (typeof cell.v === 'number') {
                    totale += cell.v;
                } else if (typeof cell.v === 'string') {
                    const trimmed = cell.v.trim().toUpperCase();
                    if (trimmed === 'RIT' || trimmed === '' || trimmed === 'DNS' || trimmed === 'DNF') {
                        totale += 0;
                    } else {
                        const num = parseFloat(trimmed);
                        if (!isNaN(num)) {
                            totale += num;
                        }
                    }
                }
            }
        }
    });
    
    const directNumbers = formula.match(/\b\d+\.?\d*\b/g);
    if (directNumbers) {
        directNumbers.forEach(numStr => {
            if (!formula.includes('Z' + numStr)) {
                const num = parseFloat(numStr);
                if (!isNaN(num)) {
                    totale += num;
                }
            }
        });
    }
    
    return totale;
}

function calcolaPosizioneInClassifica(nomePilota, classificaPiloti, sheet) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        console.log("Classifica non disponibile per calcolare la posizione");
        return "-";
    }
    
    try {
        const nomeCercato = nomePilota.trim().toLowerCase();
        const posizione = classificaPiloti.findIndex(pilota => {
            if (!pilota || !pilota.Pilota) return false;
            return pilota.Pilota.toString().trim().toLowerCase() === nomeCercato;
        });
        
        return posizione !== -1 ? posizione + 1 : "-";
    } catch (error) {
        console.error("Errore nel calcolo della posizione:", error);
        return "-";
    }
}

function ottieniRisultatiPilota(nomePilota, sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const risultati = [];
    
    let rigaPilota = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        if (cell && cell.v && cell.v.toString().trim().toLowerCase() === nomePilota.trim().toLowerCase()) {
            rigaPilota = R;
            break;
        }
    }
    
    if (rigaPilota === -1) {
        console.log(`Pilota ${nomePilota} non trovato per estrarre risultati`);
        return risultati;
    }
    
    for (let C = 3; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({r: rigaPilota, c: C})];
        if (cell && cell.v !== undefined && cell.v !== null) {
            if (typeof cell.v === 'number') {
                risultati.push(cell.v);
            } else if (typeof cell.v === 'string') {
                const trimmed = cell.v.trim().toUpperCase();
                if (trimmed === 'RIT' || trimmed === 'DNS' || trimmed === 'DNF') {
                    risultati.push(999);
                } else {
                    const num = parseInt(trimmed);
                    if (!isNaN(num)) {
                        risultati.push(num);
                    } else {
                        risultati.push(999);
                    }
                }
            }
        } else {
            risultati.push(999);
        }
    }
    
    return risultati;
}

function contaPosizioni(risultati, posizione) {
    if (!risultati || !Array.isArray(risultati)) return 0;
    return risultati.filter(pos => pos === posizione).length;
}

function ottieniUltimoRisultatoValido(risultati) {
    if (!risultati || !Array.isArray(risultati)) return 999;
    
    const risultatiValidi = risultati.filter(pos => pos < 999);
    return risultatiValidi.length > 0 ? risultatiValidi[risultatiValidi.length - 1] : 999;
}

function createTabellaPilota(pilota) {
    const container = document.createElement('div');
    container.className = "infobox";
    container.innerHTML = `
        <table>
            <tr><th colspan="2">${pilota.Nome}</th></tr>
            <tr><td>Nazione</td><td>${pilota.Nazione}</td></tr>
            <tr><td>Numero</td><td>${pilota.Numero}</td></tr>
            <tr><td>Esordio</td><td>${pilota.Esordio}</td></tr>
            <tr><td>Mondiali</td><td>${pilota.Mondiali}</td></tr>
            <tr><td>Gare</td><td>${pilota.Gare}</td></tr>
            <tr><td>Vittorie</td><td>${pilota.Vittorie}</td></tr>
            <tr><td>Podi</td><td>${pilota.Podi}</td></tr>
            <tr><td>Punti</td><td>${pilota.Punti}</td></tr>
            <tr><td>Pole</td><td>${pilota.Pole}</td></tr>
            <tr><td>FL</td><td>${pilota.FL}</td></tr>
        </table>`;
    return container;
}

// MODIFICA: Aggiornata per gestire il numero corretto di gare
function createTabellaStorico(storicoPilota, anno, categoria, classificaPiloti, sheet, gareInfo, campionatoCompletato) {
    if (!storicoPilota) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Dati pilota non disponibili";
        return errorDiv;
    }

    const nome = storicoPilota[0];
    const puntiTot = storicoPilota[1] || 0;
    const moto = formattaNomeTeam(storicoPilota[2] || "N/D");
    
    // Prendi solo il numero effettivo di gare basato su gareInfo
    const gareRisultati = storicoPilota.slice(3, 3 + gareInfo.length);
    
    // Se ci sono meno risultati che gare, riempi con '-'
    while (gareRisultati.length < gareInfo.length) {
        gareRisultati.push('-');
    }
    
    const posizione = campionatoCompletato ? calcolaPosizioneInClassifica(nome, classificaPiloti, sheet) : "-";

    // Normalizza la categoria per il controllo
    const categoriaNormalizzata = categoria
        .replace(/\s+/g, '')  // Rimuovi spazi
        .toLowerCase();        // Converti in minuscolo
    
    console.log(`📊 Categoria normalizzata per tabella: "${categoria}" → "${categoriaNormalizzata}"`);

    // --- CREA LA TABELLA ---
    const table = document.createElement('table');
    table.className = "wikitable";
    table.style.marginBottom = '0';
    table.style.borderBottom = '1px solid #ccc';
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';

    const header = document.createElement('tr');
    
    // LARGHEZZE DIVERSIFICATE PER CATEGORIA
    if (categoriaNormalizzata === 'moto3') {
        console.log(`🎯 Creazione tabella Moto3 per ${anno}`);
        // TABELLA MOTO3 - LARGHEZZE MANUALI (PIÙ COMPATTE)
        header.innerHTML = `
            <th style="width: 83px; height: 60px;">Anno</th>
            <th style="width: 100.5px; height: 60px;">Categoria</th>
            <th style="width: 118px; height: 60px;">Moto</th>
        `;

        // Per Moto3, larghezza fissa delle colonne gara
        const larghezzaGaraMoto3 = 65; // Larghezza fissa per Moto3
        
        for (let g of gareInfo) {
            header.innerHTML += `<th style="width: ${larghezzaGaraMoto3}px; height: 60px;">
                <img src="${g.img}" width="35" height="17" alt="${g.nome}" title="${g.nome}">
            </th>`;
        }

        header.innerHTML += `<th style="width: 95px; height: 60px;">Punti</th><th style="width: 70.5px; height: 60px;">Pos.</th>`;
        table.appendChild(header);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="height: 50px; width: 70px;">${anno}</td>
            <td style="height: 50px; width: 80px;">${categoria}</td>
            <td style="height: 50px; width: 100px;">${moto}</td>
        `;

        for (let i = 0; i < gareInfo.length; i++) {
            const pos = gareRisultati[i] != null ? gareRisultati[i] : '-';
            let classe = '';

            if (pos === 1) classe = 'posizione-1';
            else if (pos === 2) classe = 'posizione-2';
            else if (pos === 3) classe = 'posizione-3';
            else if (pos >= 4 && pos <= 15) classe = 'posizione-punti';
            else if (pos === 'RIT' || pos === 'rit') classe = 'ritirato';
            else if (pos === '-' || pos === null || pos === '') classe = 'non-classificato';

            row.innerHTML += `<td class="${classe}" style="height: 50px; width: ${larghezzaGaraMoto3}px;">${pos !== '-' ? pos : '-'}</td>`;
        }

        row.innerHTML += `<td style="height: 50px; width: 60px;">${puntiTot}</td><td style="height: 50px; width: 50px;">${posizione}${campionatoCompletato ? '°' : ''}</td>`;
        table.appendChild(row);
        
    } else {
        console.log(`🏍️ Creazione tabella ${categoria} per ${anno}`);
        // TABELLE PER MOTO2/MotoGP - LARGHEZZE RIDOTTE PER ANNO/CATEGORIA/MOTO
        header.innerHTML = `
            <th style="width: 70px; height: 60px;">Anno</th>          <!-- Ridotto da 80px -->
            <th style="width: 85px; height: 60px;">Categoria</th>     <!-- Ridotto da 100px -->
            <th style="width: 100px; height: 60px;">Moto</th>         <!-- Ridotto da 120px -->
        `;

        // Calcola larghezza gara con nuove larghezze fisse ridotte
        const larghezzaFissaTotale = 70 + 85 + 100 + 80 + 60; // Anno + Categoria + Moto + Punti + Pos
        const larghezzaDisponibile = 100 - larghezzaFissaTotale;
        
        const larghezzaGaraMinima = 50;
        const larghezzaGaraMassima = 75;
        
        let larghezzaGara;
        if (gareInfo.length > 0) {
            const larghezzaCalcolata = larghezzaDisponibile / gareInfo.length;
            // Limita la larghezza tra minimo e massimo
            larghezzaGara = Math.max(larghezzaGaraMinima, Math.min(larghezzaGaraMassima, larghezzaCalcolata));
        } else {
            larghezzaGara = larghezzaGaraMinima;
        }
        
        // Arrotonda per eccesso per evitare decimali
        larghezzaGara = Math.ceil(larghezzaGara);
        
        for (let g of gareInfo) {
            header.innerHTML += `<th style="width: ${larghezzaGara}px; height: 60px; min-width: ${larghezzaGaraMinima}px; max-width: ${larghezzaGaraMassima}px;">
                <img src="${g.img}" width="38" height="19" alt="${g.nome}" title="${g.nome}">
            </th>`;
        }

        header.innerHTML += `<th style="width: 80px; height: 60px;">Punti</th><th style="width: 60px; height: 60px;">Pos.</th>`;
        table.appendChild(header);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="height: 50px; width: 70px;">${anno}</td>
            <td style="height: 50px; width: 85px;">${categoria}</td>
            <td style="height: 50px; width: 100px;">${moto}</td>
        `;

        for (let i = 0; i < gareInfo.length; i++) {
            const pos = gareRisultati[i] != null ? gareRisultati[i] : '-';
            let classe = '';

            if (pos === 1) classe = 'posizione-1';
            else if (pos === 2) classe = 'posizione-2';
            else if (pos === 3) classe = 'posizione-3';
            else if (pos >= 4 && pos <= 15) classe = 'posizione-punti';
            else if (pos === 'RIT' || pos === 'rit') classe = 'ritirato';
            else if (pos === '-' || pos === null || pos === '') classe = 'non-classificato';

            row.innerHTML += `<td class="${classe}" style="height: 50px; width: ${larghezzaGara}px; min-width: ${larghezzaGaraMinima}px; max-width: ${larghezzaGaraMassima}px;">${pos !== '-' ? pos : '-'}</td>`;
        }

        row.innerHTML += `<td style="height: 50px; width: 80px;">${puntiTot}</td><td style="height: 50px; width: 60px;">${posizione}${campionatoCompletato ? '°' : ''}</td>`;
        table.appendChild(row);
    }

    // --- WRAPPER SCORRIBILE SOLO MOBILE ---
    const wrapper = document.createElement('div');
    wrapper.className = "wikitable-wrapper";
    wrapper.appendChild(table);

    return wrapper;
}

// Avvio
document.addEventListener('DOMContentLoaded', function() {
    main().catch(err => console.error(err));
});