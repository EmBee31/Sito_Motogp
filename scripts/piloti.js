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

// NUOVA FUNZIONE: Verifica se un pilota ha vinto il campionato (CON CONTROLLO SICUREZZA)
function verificaVincitoreCampionato(nomePilota, classificaPiloti, sheet) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        console.log("Classifica piloti vuota o non disponibile");
        return false;
    }
    
    try {
        // Ottieni la classifica finale con spareggi
        const classificaFinale = calcolaClassificaFinale(classificaPiloti, sheet);
        
        // Controlla se il pilota è primo in classifica
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

// NUOVA FUNZIONE: Calcola classifica finale completa con spareggi (CON CONTROLLI SICUREZZA)
function calcolaClassificaFinale(classificaPiloti, sheet) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        console.log("Nessun dato pilota per calcolare la classifica finale");
        return [];
    }
    
    try {
        // Ottieni i risultati completi di ogni pilota per gli spareggi
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
        }).filter(pilota => pilota !== null); // Rimuovi eventuali valori null

        if (classificaConRisultati.length === 0) {
            console.log("Nessun pilota valido per la classifica finale");
            return [];
        }
        
        // Ordina con spareggi completi
        const classificaOrdinata = [...classificaConRisultati].sort((a, b) => {
            try {
                const puntiA = a.Punti || 0;
                const puntiB = b.Punti || 0;
                
                // 1. Ordina per punti (discendente)
                if (puntiB !== puntiA) {
                    return puntiB - puntiA;
                }
                
                // 2. SPAREGGIO: maggior numero di vittorie
                if (b.vittorie !== a.vittorie) {
                    return b.vittorie - a.vittorie;
                }
                
                // 3. SPAREGGIO: maggior numero di secondi posti
                if (b.secondi !== a.secondi) {
                    return b.secondi - a.secondi;
                }
                
                // 4. SPAREGGIO: maggior numero di terzi posti
                if (b.terzi !== a.terzi) {
                    return b.terzi - a.terzi;
                }
                
                // 5. SPAREGGIO: maggior numero di quarti posti
                if (b.quarti !== a.quarti) {
                    return b.quarti - a.quarti;
                }
                
                // 6. SPAREGGIO: maggior numero di quinti posti
                if (b.quinti !== a.quinti) {
                    return b.quinti - a.quinti;
                }
                
                // 7. SPAREGGIO: risultato migliore nell'ultima gara
                const ultimoRisultatoA = ottieniUltimoRisultatoValido(a.risultati);
                const ultimoRisultatoB = ottieniUltimoRisultatoValido(b.risultati);
                if (ultimoRisultatoA !== ultimoRisultatoB) {
                    return ultimoRisultatoA - ultimoRisultatoB; // Posizione più bassa = meglio
                }
                
                // 8. Se tutto è uguale, ordine alfabetico inverso (Z-A) come ultimo spareggio
                return (b.Pilota || '').localeCompare(a.Pilota || '');
            } catch (error) {
                console.error("Errore nell'ordinamento:", error);
                return 0;
            }
        });
        
        return classificaOrdinata;
    } catch (error) {
        console.error("Errore critico nel calcolo classifica finale:", error);
        return classificaPiloti; // Fallback: ritorna classifica originale
    }
}

// Aggiornamento statistiche pilota (MODIFICATA per includere mondiali con controlli)
function aggiornaStatistiche(sheet, storicoPilota, classificaPiloti, anno) {
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

    // Conta gare, vittorie e podi
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
    
    // VERIFICA SE HA VINTO IL CAMPIONATO (solo se abbiamo dati validi)
    if (classificaPiloti && classificaPiloti.length > 0) {
        try {
            if (verificaVincitoreCampionato(nome, classificaPiloti, sheet)) {
                pilota.Mondiali++;
                console.log(`🎉 ${nome} ha vinto il campionato ${anno}! Mondiali: ${pilota.Mondiali}`);
            }
        } catch (error) {
            console.error(`Errore nella verifica del campionato per ${nome}:`, error);
        }
    } else {
        console.log(`Classifica non disponibile per verificare il campionato di ${nome}`);
    }
}

// Estrazione classifica piloti completa - VERSIONE CORRETTA
function estraiClassificaPilotiCompleta(sheet) {
    const risultati = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    // Trova la riga d'inizio (dopo "PILOTA")
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

    // Legge i dati dei piloti
    for (let R = startRow; R <= range.e.r; ++R) {
        const cellPilota = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
        const cellPunti = sheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
        const cellScuderia = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })];

        // Stop se arriviamo alla sezione TEAM
        if (cellPilota && cellPilota.v && cellPilota.v.toString().toLowerCase().includes('team')) {
            console.log("Trovata sezione TEAM, interrompo estrazione piloti");
            break;
        }

        // Salta righe vuote o non valide
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

        // --- CALCOLO PUNTI (stessa logica della versione funzionante) ---
        let punti = 0;

        if (cellPunti) {
            if (cellPunti.v !== undefined && cellPunti.v !== null) {
                // Se Excel ha già salvato il valore calcolato, usiamolo
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
                // Se c'è solo una formula, usa la funzione calcolaPuntiDaFormula migliorata
                punti = calcolaPuntiDaFormulaCompleta(cellPunti.f, sheet);
            }
        }

        // Se abbiamo trovato un pilota valido, aggiungilo
        if (pilota && punti >= 0) {
            // Arrotonda solo se serve a mostrare mezzi punti (es. 67.5)
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

// Versione migliorata di calcolaPuntiDaFormula per la classifica completa
function calcolaPuntiDaFormulaCompleta(formula, sheet) {
    // Estrai i riferimenti delle celle dalla formula
    const matches = formula.match(/[A-Z]+\d+/g);
    if (!matches) {
        // Se non ci sono riferimenti a celle, prova a estrarre numeri direttamente
        const numberMatches = formula.match(/\d+\.?\d*/g);
        return numberMatches ? numberMatches.reduce((sum, num) => sum + parseFloat(num), 0) : 0;
    }
    
    let totale = 0;
    
    matches.forEach(ref => {
        const cell = sheet[ref];
        if (cell) {
            if (cell.v !== undefined && cell.v !== null) {
                // Se è un numero
                if (typeof cell.v === 'number') {
                    totale += cell.v;
                } 
                // Se è una stringa, controlla se è un numero o "RIT"
                else if (typeof cell.v === 'string') {
                    const trimmed = cell.v.trim().toUpperCase();
                    if (trimmed === 'RIT' || trimmed === '' || trimmed === 'DNS' || trimmed === 'DNF') {
                        // Ritirato = 0 punti
                        totale += 0;
                    } else {
                        // Prova a convertire in numero
                        const num = parseFloat(trimmed);
                        if (!isNaN(num)) {
                            totale += num;
                        }
                    }
                }
            }
        }
    });
    
    // Aggiungi eventuali numeri direttamente nella formula (mezzi punti)
    const directNumbers = formula.match(/\b\d+\.?\d*\b/g);
    if (directNumbers) {
        directNumbers.forEach(numStr => {
            // Evita di contare due volte i numeri già presi dalle celle
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

// Calcolo posizione in classifica con spareggi completi (CON CONTROLLI)
function calcolaPosizioneInClassifica(nomePilota, classificaPiloti, sheet) {
    if (!classificaPiloti || classificaPiloti.length === 0) {
        console.log("Classifica non disponibile per calcolare la posizione");
        return "-";
    }
    
    try {
        const classificaFinale = calcolaClassificaFinale(classificaPiloti, sheet);
        
        // Cerca il pilota
        const nomeCercato = nomePilota.trim().toLowerCase();
        const posizione = classificaFinale.findIndex(pilota => {
            if (!pilota || !pilota.Pilota) return false;
            return pilota.Pilota.toString().trim().toLowerCase() === nomeCercato;
        });
        
        return posizione !== -1 ? posizione + 1 : "-";
    } catch (error) {
        console.error("Errore nel calcolo della posizione:", error);
        return "-";
    }
}

// Funzioni helper per gli spareggi (CON CONTROLLI)
function ottieniRisultatiPilota(nomePilota, sheet) {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const risultati = [];
    
    // Trova la riga del pilota
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
    
    // Estrai i risultati dalle colonne delle gare (da colonna 3 in poi)
    for (let C = 3; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({r: rigaPilota, c: C})];
        if (cell && cell.v !== undefined && cell.v !== null) {
            if (typeof cell.v === 'number') {
                risultati.push(cell.v);
            } else if (typeof cell.v === 'string') {
                const trimmed = cell.v.trim().toUpperCase();
                if (trimmed === 'RIT' || trimmed === 'DNS' || trimmed === 'DNF') {
                    risultati.push(999); // Ritirato = valore alto per l'ordinamento
                } else {
                    const num = parseInt(trimmed);
                    if (!isNaN(num)) {
                        risultati.push(num);
                    } else {
                        risultati.push(999); // Valore non numerico = ritirato
                    }
                }
            }
        } else {
            risultati.push(999); // Cella vuota = ritirato
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
    
    // Filtra solo i risultati validi (non ritiri) e prendi l'ultimo
    const risultatiValidi = risultati.filter(pos => pos < 999);
    return risultatiValidi.length > 0 ? risultatiValidi[risultatiValidi.length - 1] : 999;
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
function createTabellaStorico(storicoPilota, anno, categoria, classificaPiloti, sheet) {
    if (!storicoPilota) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Dati pilota non disponibili";
        return errorDiv;
    }

    const nome = storicoPilota[0];
    const puntiTot = storicoPilota[1] || 0;
    const moto = storicoPilota[2] || "N/D";
    const gareRisultati = storicoPilota.slice(3);

    const posizione = calcolaPosizioneInClassifica(nome, classificaPiloti, sheet);

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

// Main function (MODIFICATA con migliori controlli)
async function main() {
    try {
        const response = await fetch('../docs/classifica.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const { anno, categoria } = estraiAnnoCategoria(sheet);
        console.log("Anno e categoria:", anno, categoria);

        const classificaPiloti = estraiClassificaPilotiCompleta(sheet);
        
        // MOSTRA LA CLASSIFICA FINALE IN CONSOLE (solo se disponibile)
        if (classificaPiloti && classificaPiloti.length > 0) {
            try {
                const classificaFinale = calcolaClassificaFinale(classificaPiloti, sheet);
                console.log("🏆 CLASSIFICA FINALE:", classificaFinale.map((p, i) => `${i+1}°: ${p.Pilota} - ${p.Punti} punti`));
            } catch (error) {
                console.log("Classifica finale non calcolabile, ma continuo con i dati base");
            }
        } else {
            console.log("Nessun dato di classifica disponibile per questa stagione");
        }

        const storicoBonelli = await estraiStoricoPilota(sheet, "Manuel Bonelli");
        const storicoGabrielli = await estraiStoricoPilota(sheet, "Lorenzo Gabrielli");

        // MODIFICATO: Passa classificaPiloti e anno per verificare i mondiali
        if (storicoBonelli) aggiornaStatistiche(sheet, storicoBonelli, classificaPiloti, anno);
        if (storicoGabrielli) aggiornaStatistiche(sheet, storicoGabrielli, classificaPiloti, anno);

        const infoboxContainer = document.getElementById('infobox-container');
        if (infoboxContainer) {
            infoboxContainer.appendChild(createTabellaPilota(M));
            infoboxContainer.appendChild(createTabellaPilota(L));
        }

        const storicoContainer = document.getElementById('storico-container');
        if (storicoContainer) {
            if (storicoBonelli) {
                storicoContainer.appendChild(createTabellaStorico(storicoBonelli, anno, categoria, classificaPiloti, sheet));
            }
            if (storicoGabrielli) {
                storicoContainer.appendChild(createTabellaStorico(storicoGabrielli, anno, categoria, classificaPiloti, sheet));
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