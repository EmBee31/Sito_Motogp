// Statistiche dei piloti
let M = {Nome:"Manuel Bonelli",Nazione:"Italia",Numero:31,Esordio:"2024",Mondiali:0,Gare:0,Vittorie:0,Podi:0,Punti:0,Pole:0,FL:0};
let L = {Nome:"Lorenzo Gabrielli",Nazione:"Italia",Numero:16,Esordio:"2024",Mondiali:0,Gare:0,Vittorie:0,Podi:0,Punti:0,Pole:0,FL:0};

const gareInfo = [
    { nome: "Lusail", img: "https://flagcdn.com/w80/qa.png" },
    { nome: "Portimão", img: "https://flagcdn.com/w80/pt.png" },
    { nome: "Americhe", img: "https://flagcdn.com/w80/us-tx.png" },
    { nome: "Jerez", img: "https://flagcdn.com/w80/es.png" },
    { nome: "Le Mans", img: "https://flagcdn.com/w80/fr.png" },
    { nome: "Catalogna 1", img: "https://flagcdn.com/w80/es.png" },
    { nome: "Mugello", img: "https://flagcdn.com/w80/it.png" },
    { nome: "Assen", img: "https://flagcdn.com/w80/nl.png" },
    { nome: "Sachsenring", img: "https://flagcdn.com/w80/de.png" },
    { nome: "Silverstone", img: "https://flagcdn.com/w80/gb.png" },
    { nome: "Red Bull Ring", img: "https://flagcdn.com/w80/at.png" },
    { nome: "Aragón", img: "https://flagcdn.com/w80/es.png" },
    { nome: "Misano 1", img: "https://flagcdn.com/w80/sm.png" },
    { nome: "Misano 2", img: "https://flagcdn.com/w80/sm.png" },
    { nome: "Mandalika", img: "https://flagcdn.com/w80/id.png" },
    { nome: "Motegi", img: "https://flagcdn.com/w80/jp.png" },
    { nome: "Phillip Island", img: "https://flagcdn.com/w80/au.png" },
    { nome: "Buriram", img: "https://flagcdn.com/w80/th.png" },
    { nome: "Sepang", img: "https://flagcdn.com/w80/my.png" },
    { nome: "Catalogna 2", img: "https://flagcdn.com/w80/es.png" },
];

// Estrazione anno e categoria dalla riga principale
function estraiAnnoCategoria(sheet) {
    const cellA1 = sheet['A1'];
    if (!cellA1 || !cellA1.v) {
        return { anno: "2024", categoria: "Moto3" };
    }
    
    const testo = cellA1.v.toString().toUpperCase();
    
    // Estrazione anno
    const annoMatch = testo.match(/\b(20\d{2})\b/);
    const anno = annoMatch ? annoMatch[1] : "2024";
    
    // Estrazione categoria
    const categoriaMatch = testo.match(/MOTO\s*(\d+)/i);
    const categoria = categoriaMatch ? `Moto${categoriaMatch[1]}` : "Moto3";
    
    console.log("Anno estratto:", anno, "Categoria:", categoria);
    return { anno, categoria };
}

// Estrazione storico pilota
async function estraiStoricoPilota(sheet, pilotaNome) {
    const storico = [];
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

    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({c: C, r: startRow})];
        storico.push(cell ? cell.v : null);
    }
    
    console.log(`Storico per ${pilotaNome}:`, storico);
    return storico;
}

// Conteggio pole e FL
function getPole(sheet, nomePilota) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({c:0,r:R})];
        if (cell && cell.v === "TEMPI IN QUALIFICA") {
            startRow = (nomePilota==="Manuel Bonelli") ? R+5 : R+3;
            break;
        }
    }
    if (startRow===-1) return [0,0];

    let poles=0, fl=0;
    for (let C=range.s.c; C<=range.e.c; C++) {
        const cell = sheet[XLSX.utils.encode_cell({c:C,r:startRow})];
        if (cell && typeof cell.v==="string") {
            if (cell.v.toLowerCase().includes("pole")) poles++;
            if (cell.v.includes("FL")) fl++;
        }
    }
    return [poles, fl];
}

// Aggiornamento statistiche pilota
function aggiornaStatistiche(sheet, storicoPilota) {
    if (!storicoPilota) return;
    
    const nome = storicoPilota[0];
    const punti = Number(storicoPilota[1]) || 0;
    const moto = storicoPilota[2] || "N/D";
    const gare = storicoPilota.slice(3);
    const [poles, fl] = getPole(sheet, nome);

    const pilota = (nome==="Manuel Bonelli") ? M : L;
    pilota.Punti += punti;
    pilota.Pole += poles;
    pilota.FL += fl;
    pilota.Moto = moto;

    for (let g of gare) {
        if (g != null && g !== '' && g !== 'RIT') {
            pilota.Gare++;
            const posizione = Number(g);
            if (!isNaN(posizione) && posizione <= 3) {
                pilota.Podi++;
                if(posizione === 1) pilota.Vittorie++;
            }
        }
    }
}

// Estrazione classifica piloti completa
function estraiClassificaPilotiCompleta(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('pilota')) {
            startRow = R + 1;
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 1})];
        const cellScuderia = sheet[XLSX.utils.encode_cell({r: R, c: 2})];
        
        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('team')) {
            break;
        }
        
        if (!cellPilota || !cellPilota.v || cellPilota.v.toString().trim() === '') {
            continue;
        }
        
        const pilota = cellPilota.v.toString().trim();
        
        if (pilota === '' || pilota.toLowerCase().includes('pilota') || pilota.toLowerCase().includes('stagione')) {
            continue;
        }
        
        const scuderia = cellScuderia ? cellScuderia.v.toString().trim() : '';
        
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
            } else if (cellPunti.v !== undefined && cellPunti.v !== null) {
                punti = parseInt(cellPunti.v) || 0;
            }
        }
        
        if (pilota && pilota !== 'PILOTA') {
            risultati.push({
                Pilota: pilota,
                Scuderia: scuderia,
                Punti: punti
            });
        }
    }
    
    return risultati;
}

// Calcolo punti da formula
function calcolaPuntiDaFormula(formula, sheet) {
    const matches = formula.match(/[A-Z]+\d+/g);
    if (!matches) return 0;
    
    let totale = 0;
    
    matches.forEach(ref => {
        const cell = sheet[ref];
        if (cell && cell.v) {
            totale += parseInt(cell.v) || 0;
        }
    });
    
    return totale;
}

// Calcolo posizione in classifica
function calcolaPosizioneInClassifica(nomePilota, classificaPiloti) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        return "-";
    }
    
    const classificaOrdinata = [...classificaPiloti].sort((a, b) => {
        const puntiA = a.Punti || 0;
        const puntiB = b.Punti || 0;
        return puntiB - puntiA;
    });
    
    const posizione = classificaOrdinata.findIndex(pilota => 
        pilota.Pilota && pilota.Pilota.toString().trim() === nomePilota.trim()
    );
    
    return posizione !== -1 ? posizione + 1 : "-";
}

// Creazione infobox
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

// Creazione tabella storico gare con posizione in campionato
function createTabellaStorico(storicoPilota, anno, categoria, classificaPiloti) {
    if (!storicoPilota) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Dati pilota non disponibili";
        return errorDiv;
    }

    const nome = storicoPilota[0];
    const puntiTot = storicoPilota[1] || 0;
    const moto = storicoPilota[2] || "N/D";
    const gareRisultati = storicoPilota.slice(3);

    const posizione = calcolaPosizioneInClassifica(nome, classificaPiloti);

    const table = document.createElement('table');
    table.className = "wikitable";

    const header = document.createElement('tr');
    header.innerHTML = `
        <th>Nome</th>
        <th>Anno</th>
        <th>Categoria</th>
        <th>Moto</th>
    `;
    
    for (let g of gareInfo) {
        header.innerHTML += `<th><img src="${g.img}" width="40" height="20" alt="${g.nome}" title="${g.nome}"></th>`;
    }
    
    header.innerHTML += `<th>Punti Totali</th><th>Posizione Campionato</th>`;
    table.appendChild(header);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${nome}</td>
        <td>${anno}</td>
        <td>${categoria}</td>
        <td>${moto}</td>
    `;
    
    for (let i = 0; i < gareInfo.length; i++) {
        const pos = gareRisultati[i] != null ? gareRisultati[i] : '-';
        let classe = '';
        
        if (pos === 1) classe = 'posizione-1';
        else if (pos === 2) classe = 'posizione-2';
        else if (pos === 3) classe = 'posizione-3';
        else if (pos >= 4 && pos <= 15) classe = 'posizione-punti'; // Verde chiaro Wikipedia
        else if (pos === 'RIT' || pos === 'rit') classe = 'ritirato'; // Rosso chiaro Wikipedia
        else if (pos === '-' || pos === null || pos === '') classe = 'non-classificato'; // Grigio Wikipedia
        
        row.innerHTML += `<td class="${classe}">${pos !== '-' ? pos : '-'}</td>`;
    }
    
    row.innerHTML += `<td>${puntiTot}</td><td>${posizione}°</td>`;
    table.appendChild(row);

    return table;
}

// Main function
async function main() {
    try {
        const response = await fetch('../docs/classifica.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const { anno, categoria } = estraiAnnoCategoria(sheet);
        console.log("Anno e categoria:", anno, categoria);

        const classificaPiloti = estraiClassificaPilotiCompleta(sheet);
        console.log("Classifica piloti completa:", classificaPiloti);

        const storicoBonelli = await estraiStoricoPilota(sheet, "Manuel Bonelli");
        const storicoGabrielli = await estraiStoricoPilota(sheet, "Lorenzo Gabrielli");

        if (storicoBonelli) aggiornaStatistiche(sheet, storicoBonelli);
        if (storicoGabrielli) aggiornaStatistiche(sheet, storicoGabrielli);

        const infoboxContainer = document.getElementById('infobox-container');
        if (infoboxContainer) {
            infoboxContainer.appendChild(createTabellaPilota(M));
            infoboxContainer.appendChild(createTabellaPilota(L));
        }

        const storicoContainer = document.getElementById('storico-container');
        if (storicoContainer) {
            if (storicoBonelli) {
                storicoContainer.appendChild(createTabellaStorico(storicoBonelli, anno, categoria, classificaPiloti));
            }
            if (storicoGabrielli) {
                storicoContainer.appendChild(createTabellaStorico(storicoGabrielli, anno, categoria, classificaPiloti));
            }
        }

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

// Avvio
document.addEventListener('DOMContentLoaded', function() {
    main().catch(err => console.error(err));
});