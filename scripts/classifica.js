document.getElementById('btn-piloti').addEventListener('click', () => mostraClassifica('piloti'));
document.getElementById('btn-team').addEventListener('click', () => mostraClassifica('team'));
document.getElementById('btn-costruttori').addEventListener('click', () => mostraClassifica('costruttori'));

// Mostra la classifica piloti al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    mostraClassifica('piloti');
});

function getNomeFileClassifica() {
    const nomePagina = window.location.pathname.split('/').pop();
    const nomeBase = nomePagina.replace('.html', '');
    const percorso = `../../docs/classifiche/${nomeBase}.xlsx`;
    
    console.log('Tentativo di caricare file:', percorso);
    return percorso;
}

async function mostraClassifica(tipo) {
    const container = document.getElementById('tabella-classifica');
    
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s ease';
    
    setTimeout(async () => {
        const response = await fetch(getNomeFileClassifica());
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

        // MODIFICA: Aggiungi spareggi invece di semplice ordinamento per punti
        risultati = ordinaConSpareggi(risultati, tipo, sheet);
        
        renderTabella(risultati, tipo);
        
        setTimeout(() => {
            container.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            scrollToClassifica();
        }, 125);
        
    }, 125);
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

// FUNZIONE SPAREGGI - MODIFICA PRINCIPALE
function ordinaConSpareggi(risultati, tipo, sheet) {
    if (tipo === 'piloti') {
        return risultati.sort((a, b) => {
            const puntiA = a.Punti || 0;
            const puntiB = b.Punti || 0;
            
            // 1. Ordina per punti (discendente)
            if (puntiB !== puntiA) {
                return puntiB - puntiA;
            }
            
            // 2. SPAREGGIO: maggior numero di vittorie
            const vittorieA = contaVittoriePilota(a.Pilota, sheet);
            const vittorieB = contaVittoriePilota(b.Pilota, sheet);
            if (vittorieB !== vittorieA) {
                return vittorieB - vittorieA;
            }
            
            // 3. SPAREGGIO: maggior numero di secondi posti
            const secondiA = contaSecondiPilota(a.Pilota, sheet);
            const secondiB = contaSecondiPilota(b.Pilota, sheet);
            if (secondiB !== secondiA) {
                return secondiB - secondiA;
            }
            
            // 4. SPAREGGIO: maggior numero di terzi posti
            const terziA = contaTerziPilota(a.Pilota, sheet);
            const terziB = contaTerziPilota(b.Pilota, sheet);
            if (terziB !== terziA) {
                return terziB - terziA;
            }
            
            // 5. Se tutto è uguale, ordine alfabetico
            return a.Pilota.localeCompare(b.Pilota);
        });
    } else {
        // Per team e costruttori, semplice ordine alfabetico in caso di parità
        return risultati.sort((a, b) => {
            const puntiA = a.Punti || 0;
            const puntiB = b.Punti || 0;
            
            if (puntiB !== puntiA) {
                return puntiB - puntiA;
            }
            
            const nomeA = a.Team || a.Costruttore || '';
            const nomeB = b.Team || b.Costruttore || '';
            return nomeA.localeCompare(nomeB);
        });
    }
}

// FUNZIONI HELPER PER SPAREGGI PILOTI
function contaVittoriePilota(nomePilota, sheet) {
    const risultati = ottieniRisultatiPilota(nomePilota, sheet);
    return risultati.filter(pos => pos === 1).length;
}

function contaSecondiPilota(nomePilota, sheet) {
    const risultati = ottieniRisultatiPilota(nomePilota, sheet);
    return risultati.filter(pos => pos === 2).length;
}

function contaTerziPilota(nomePilota, sheet) {
    const risultati = ottieniRisultatiPilota(nomePilota, sheet);
    return risultati.filter(pos => pos === 3).length;
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
    
    if (rigaPilota === -1) return risultati;
    
    for (let C = 3; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({r: rigaPilota, c: C})];
        if (cell && cell.v !== undefined && cell.v !== null) {
            if (typeof cell.v === 'number') {
                risultati.push(cell.v);
            } else if (typeof cell.v === 'string') {
                const trimmed = cell.v.trim().toUpperCase();
                if (trimmed === 'RIT' || trimmed === 'DNS' || trimmed === 'DNF') {
                    // Ignora ritiri per il conteggio vittorie/podi
                } else {
                    const num = parseInt(trimmed);
                    if (!isNaN(num)) {
                        risultati.push(num);
                    }
                }
            }
        }
    }
    
    return risultati;
}

// RESTANTE CODICE ESISTENTE (NESSUN ALTRO CAMBIAMENTO)
function estraiClassificaPiloti(sheet) {
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

    if (startRow === -1) return risultati;

    for (let R = startRow; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
        const cellPunti = sheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
        const cellScuderia = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })];

        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('team')) {
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

        const scuderia = cellScuderia ? cellScuderia.v.toString().trim() : '';

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
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
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

    return risultati;
}

function estraiClassificaTeam(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('team') && 
            sheet[XLSX.utils.encode_cell({r: R, c: 1})] && 
            sheet[XLSX.utils.encode_cell({r: R, c: 1})].v.toString().toLowerCase().includes('punti')) {
            startRow = R + 1;
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellTeam = sheet[XLSX.utils.encode_cell({r: R, c: 0})];
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 1})];
        
        if (!cellTeam || !cellTeam.v || cellTeam.v.toString().trim() === '') {
            break;
        }
        
        const team = cellTeam.v.toString().trim();
        
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
            } else if (cellPunti.v) {
                punti = parseFloat(cellPunti.v) || 0;
            }
        }
        
        if (team) {
            risultati.push({
                Team: team,
                Punti: Math.round(punti * 10) / 10
            });
        }
    }
    
    return risultati;
}

function estraiClassificaCostruttori(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    let startRow = -1;
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({r: R, c: 3})];
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('costruttori')) {
            startRow = R + 1;
            break;
        }
    }
    
    if (startRow === -1) return risultati;
    
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellCostruttore = sheet[XLSX.utils.encode_cell({r: R, c: 3})];
        const cellPunti = sheet[XLSX.utils.encode_cell({r: R, c: 4})];
        
        if (!cellCostruttore || !cellCostruttore.v || cellCostruttore.v.toString().trim() === '') {
            break;
        }
        
        const costruttore = cellCostruttore.v.toString().trim();
        
        let punti = 0;
        if (cellPunti) {
            if (cellPunti.f) {
                punti = calcolaPuntiDaFormula(cellPunti.f, sheet);
            } else if (cellPunti.v) {
                punti = parseFloat(cellPunti.v) || 0;
            }
        }
        
        if (costruttore) {
            risultati.push({
                Costruttore: costruttore,
                Punti: Math.round(punti * 10) / 10
            });
        }
    }
    
    return risultati;
}

function calcolaPuntiDaFormula(formula, sheet) {
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

function renderTabella(dati, tipo) {
    const container = document.getElementById('tabella-classifica');
    container.innerHTML = '';

    if (dati.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #666; font-style: italic;">Nessun dato trovato per ${tipo}</p>`;
        return;
    }

    let html = `<h2>Classifica ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h2>`;
    html += '<table class="classifica-table"><thead><tr>';
    html += '<th>Pos</th>';
    
    Object.keys(dati[0]).forEach(key => {
        html += `<th>${key}</th>`;
    });
    html += '</tr></thead><tbody>';

    dati.forEach((riga, index) => {
        html += '<tr>';
        html += '<td></td>';
        Object.values(riga).forEach(val => {
            html += `<td>${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}