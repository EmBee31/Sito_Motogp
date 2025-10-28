document.getElementById('btn-piloti').addEventListener('click', () => mostraClassifica('piloti'));
document.getElementById('btn-team').addEventListener('click', () => mostraClassifica('team'));
document.getElementById('btn-costruttori').addEventListener('click', () => mostraClassifica('costruttori'));

// Mostra la classifica piloti al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    mostraClassifica('piloti');
});




async function mostraClassifica(tipo) {
    const container = document.getElementById('tabella-classifica');
    
    // RIDOTTO: da 0.3s a 0.2s
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s ease';
    
    // RIDOTTO: da 300ms a 150ms
    setTimeout(async () => {
        const response = await fetch('../docs/classifica.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        let risultati = [];

        if (tipo === 'piloti') {
            risultati = estraiClassificaPiloti(sheet);
        } else if (tipo === 'team') {
            risultati = estraiClassificaTeam(sheet);
        } else if (tipo === 'costruttori') {
            risultati = estraiClassificaCostruttori(sheet);
        }

        risultati.sort((a, b) => b.Punti - a.Punti);
        renderTabella(risultati, tipo);
        
        // RIDOTTO: da 50ms a 20ms
        setTimeout(() => {
            container.style.opacity = '1';
        }, 10);
        
        // RIDOTTO: da 400ms a 250ms
        setTimeout(() => {
            scrollToClassifica();
        }, 125);
        
    }, 125); // RIDOTTO: da 300ms a 150ms
}

function scrollToClassifica() {
    const tabellaClassifica = document.getElementById('tabella-classifica');
    if (tabellaClassifica) {
        tabellaClassifica.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Le altre funzioni rimangono uguali...
function estraiClassificaPiloti(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Cerchiamo la riga che contiene "PILOTA"
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 0})]; // Colonna A
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('pilota')) {
            startRow = R + 1; // Iniziamo dalla riga successiva
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    console.log("Inizio lettura piloti dalla riga:", startRow);
    
    // Leggiamo i dati dei piloti
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({r: R, c: 0})]; // Colonna A - PILOTA
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 1})]; // Colonna B - PUNTI
        const cellScuderia = sheet[XLSX.utils.encode_cell({r: R, c: 2})]; // Colonna C - SCUDERIA
        
        // DEBUG: stampa i valori delle celle
        console.log(`Riga ${R}:`, {
            pilota: cellPilota ? cellPilota.v : 'null',
            punti: cellPunti ? cellPunti.v : 'null',
            scuderia: cellScuderia ? cellScuderia.v : 'null'
        });
        
        // Se troviamo "TEAM" nella colonna A, smettiamo (fine sezione piloti)
        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('team')) {
            console.log("Trovato 'TEAM', fine sezione piloti");
            break;
        }
        
        // Se la cella pilota è vuota o non esiste, saltiamo
        if (!cellPilota || !cellPilota.v || cellPilota.v.toString().trim() === '') {
            continue;
        }
        
        const pilota = cellPilota.v.toString().trim();
        
        // Saltiamo le righe che non sono nomi di piloti (es: righe vuote, titoli, etc.)
        if (pilota === '' || pilota.toLowerCase().includes('pilota') || pilota.toLowerCase().includes('stagione')) {
            continue;
        }
        
        const scuderia = cellScuderia ? cellScuderia.v.toString().trim() : '';
        
        // Gestione dei punti
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                // Se è una formula, proviamo a calcolarla
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
                console.log(`Formula per ${pilota}: ${cellPunti.f} = ${punti}`);
            } else if (cellPunti.v !== undefined && cellPunti.v !== null) {
                punti = parseInt(cellPunti.v) || 0;
            }
        }
        
        console.log(`Aggiungo pilota: ${pilota}, Punti: ${punti}, Scuderia: ${scuderia}`);
        
        if (pilota && pilota !== 'PILOTA') {
            risultati.push({
                Pilota: pilota,
                Scuderia: scuderia,
                Punti: punti
            });
        }
    }
    
    console.log("Piloti estratti:", risultati);
    return risultati;
}

function estraiClassificaTeam(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Cerchiamo la sezione TEAM (dopo i piloti)
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 0})]; // Colonna A
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('team') && 
            sheet[XLSX.utils.encode_cell({r: R, c: 1})] && 
            sheet[XLSX.utils.encode_cell({r: R, c: 1})].v.toString().toLowerCase().includes('punti')) {
            startRow = R + 1; // Iniziamo dalla riga successiva
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    // Leggiamo i dati dei team
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellTeam = sheet[XLSX.utils.encode_cell({r: R, c: 0})]; // Colonna A - TEAM
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 1})]; // Colonna B - PUNTI
        
        // Se non c'è più un team, smettiamo
        if (!cellTeam || !cellTeam.v || cellTeam.v.toString().trim() === '') {
            break;
        }
        
        const team = cellTeam.v.toString().trim();
        
        // Gestione dei punti
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
            } else if (cellPunti.v) {
                punti = parseInt(cellPunti.v) || 0;
            }
        }
        
        if (team && punti > 0) {
            risultati.push({
                Team: team,
                Punti: punti
            });
        }
    }
    
    return risultati;
}

function estraiClassificaCostruttori(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Cerchiamo la sezione COSTRUTTORI (accanto ai team)
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 3})]; // Colonna D
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('costruttori')) {
            startRow = R + 1; // Iniziamo dalla riga successiva
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    // Leggiamo i dati dei costruttori
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellCostruttore = sheet[XLSX.utils.encode_cell({r: R, c: 3})]; // Colonna D - COSTRUTTORE
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 4})]; // Colonna E - PUNTI
        
        // Se non c'è più un costruttore, smettiamo
        if (!cellCostruttore || !cellCostruttore.v || cellCostruttore.v.toString().trim() === '') {
            break;
        }
        
        const costruttore = cellCostruttore.v.toString().trim();
        
        // Gestione dei punti
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
            } else if (cellPunti.v) {
                punti = parseInt(cellPunti.v) || 0;
            }
        }
        
        if (costruttore && punti > 0) {
            risultati.push({
                Costruttore: costruttore,
                Punti: punti
            });
        }
    }
    
    return risultati;
}

function calcolaPuntiDaFormula(formula, sheet) {
    // Estrai i riferimenti delle celle dalla formula
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

function renderTabella(dati, tipo) {
    const container = document.getElementById('tabella-classifica');
    container.innerHTML = '';

    if (dati.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #666; font-style: italic;">Nessun dato trovato per ${tipo}</p>`;
        return;
    }

    let html = `<h2>Classifica ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h2>`;
    html += '<table class="classifica-table"><thead><tr>';

    // Aggiungi colonna Posizione
    html += '<th>Pos</th>';
    
    // Intestazioni rimanenti
    Object.keys(dati[0]).forEach(key => {
        html += `<th>${key}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Dati
    dati.forEach((riga, index) => {
        html += '<tr>';
        
        // Colonna posizione (vuota, gestita dal CSS)
        html += '<td></td>';
        
        // Dati effettivi
        Object.values(riga).forEach(val => {
            html += `<td>${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}