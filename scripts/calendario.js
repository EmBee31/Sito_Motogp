document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("contenuto-testo");
    const trackImage = document.getElementById("track-image");
    const trackDate = document.getElementById("track-date");
    const risultatiBtn = document.getElementById("btn-risultati");
    const flagCards = document.querySelectorAll('[class*="flag-card-"]');
    


    // Nascondi i risultati e il titolo all'avvio
    container.style.display = 'none';
    mostraNewsHeader(false);

    nascondiTrackInfo();
    console.log("Flag cards trovate:", flagCards.length);

    function getBasePath() {
        const nomePagina = window.location.pathname.split('/').pop();

        if (nomePagina.includes('2024')) {
            return '../../docs/moto3/';
        } else if (nomePagina.includes('2025')) {
            return '../../docs/moto2/';
        }else {
            return '../../docs/motogp/';
        }
    }

    function getAnno(){
        const nomePagina = window.location.pathname.split('/').pop();
        if (nomePagina.includes('2024')) {
            return '2024';
        }
        return nomePagina.includes('2025') ? '2025' : '2026';
    }



    function getTrackDatas(anno){
        if (anno === '2024') {
            return {
                    'lusail': {
                        image: '../../immagini/piste/lusail.jpg',
                        date: '8-10 Marzo 2024'
                    },
                    'portimao': {
                        image: '../../immagini/piste/portimao.jpg', 
                        date: '22-24 Marzo 2024'
                    },
                    'americhe': {
                        image: '../../immagini/piste/americhe.jpg',
                        date: '12-14 Aprile 2024'
                    },
                    'jerez': {
                        image: '../../immagini/piste/jerez.jpg',
                        date: '26-28 Aprile 2024'
                    },
                    'lemans': {
                        image: '../../immagini/piste/lemans.jpg',
                        date: '10-12 Maggio 2024'
                    },
                    'catalogna1': {
                        image: '../../immagini/piste/catalogna.jpg',
                        date: '24-26 Maggio 2024'
                    },
                    'mugello': {
                        image: '../../immagini/piste/mugello.jpg',
                        date: '31 Maggio - 2 Giugno 2024'
                    },
                    'assen': {
                        image: '../../immagini/piste/assen.jpg',
                        date: '28-30 Giugno 2024'
                    },
                    'sachsenring': {
                        image: '../../immagini/piste/sachsenring.jpg',
                        date: '5-7 Luglio 2024'
                    },
                    'silverstone': {
                        image: '../../immagini/piste/silverstone.jpg',
                        date: '2-4 Agosto 2024'
                    },
                    'redbullring': {
                        image: '../../immagini/piste/redbullring.jpg',
                        date: '16-18 Agosto 2024'
                    },
                    'aragon': {
                        image: '../../immagini/piste/aragon.jpg',
                        date: '30 Agosto - 1 Settembre 2024'
                    },
                    'misano1': {
                        image: '../../immagini/piste/misano.jpg',
                        date: '6-8 Settembre 2024'
                    },
                    'misano2': {
                        image: '../../immagini/piste/misano.jpg',
                        date: '20-22 Settembre 2024'
                    },
                    'mandalika': {
                        image: '../../immagini/piste/mandalika.jpg',
                        date: '27-29 Settembre 2024'
                    },
                    'motegi': {
                        image: '../../immagini/piste/motegi.jpg',
                        date: '4-6 Ottobre 2024'
                    },
                    'phillipisland': {
                        image: '../../immagini/piste/phillipisland.jpg',
                        date: '18-20 Ottobre 2024'
                    },
                    'buriram': {
                        image: '../../immagini/piste/buriram.jpg',
                        date: '25-27 Ottobre 2024'
                    },
                    'sepang': {
                        image: '../../immagini/piste/sepang.jpg',
                        date: '1-3 Novembre 2024'
                    },
                    'catalogna2': {
                        image: '../../immagini/piste/catalogna.jpg',
                        date: '15-17 Novembre 2024'
                    }
                };
        } else if (anno === '2025') {
            return {
                'buriram': {
                    image: '../../immagini/piste/buriram.jpg',
                    date: '28 Febbrario - 2 Marzo 2025'
                },
                'valencia1': {
                    image: '../../immagini/piste/valencia.jpg',
                    date: '14-16 Marzo 2025'
                },
                'americhe': {
                    image: '../../immagini/piste/americhe.jpg',
                    date: '28-30 Marzo 2025'
                },
                'lusail': {
                    image: '../../immagini/piste/lusail.jpg', 
                    date: '11-13 Aprile 2025'
                },
                'jerez': {
                    image: '../../immagini/piste/jerez.jpg',
                    date: '25-27 Aprile 2025'
                },
                'lemans': {
                    image: '../../immagini/piste/lemans.jpg',
                    date: '9-11 Maggio 2025'
                },
                'silverstone': {
                    image: '../../immagini/piste/silverstone.jpg',
                    date: '23-25 Maggio 2025'
                },
                'aragon': {
                    image: '../../immagini/piste/aragon.jpg',
                    date: '6-8 Giugno 2025'
                },
                'mugello': {
                    image: '../../immagini/piste/mugello.jpg',
                    date: '20-22 Giugno 2025'
                },
                'assen': {
                    image: '../../immagini/piste/assen.jpg',
                    date: '27-29 Giugno 2025'
                },
                'sachsenring': {
                    image: '../../immagini/piste/sachsenring.jpg',
                    date: '11-13 Luglio 2025'
                },
                'sokol': {
                    image: '../../immagini/piste/sokol.jpg',
                    date: '18-20 Luglio 2025'
                },
                'redbullring': {
                    image: '../../immagini/piste/redbullring.jpg',
                    date: '15-17 Agosto 2025'
                },
                'buddh': {
                    image: '../../immagini/piste/buddh.jpg',
                    date: '22-24 Agosto 2025'
                },
                'catalogna': {
                    image: '../../immagini/piste/catalogna.jpg',
                    date: '5-7 Settembre 2025'
                },
                'misano': {
                    image: '../../immagini/piste/misano.jpg',
                    date: '12-14 Settembre 2025'
                },
                'motegi': {
                    image: '../../immagini/piste/motegi.jpg',
                    date: '26-28 Settembre 2025'
                },
                'mandalika': {
                    image: '../../immagini/piste/mandalika.jpg',
                    date: '3-5 Ottobre 2025'
                },
                'phillipisland': {
                    image: '../../immagini/piste/phillipisland.jpg',
                    date: '17-19 Ottobre 2025'
                },
                'sepang': {
                    image: '../../immagini/piste/sepang.jpg',
                    date: '24-26 Ottobre 2025'
                },
                'portimao': {
                    image: '../../immagini/piste/portimao.jpg', 
                    date: '7-9 Novembre 2025'
                },
                'valencia2': {
                    image: '../../immagini/piste/valencia.jpg',
                    date: '14-16 Novembre 2025'
                }
            };
        } else {
            // Dati per il 2026
            return {
                // Aggiungi i dati delle piste per il 2026 qui
            };
        }   
    }
    // Mappa delle piste con immagini e date
    const trackData = getTrackDatas(getAnno());

    setTimeout(() => {
        scrollToCalendario();
    }, 500);
    

    // Aggiungi event listener a tutte le flag cards
    flagCards.forEach(card => {
        card.addEventListener('click', () => {
            const gara = card.getAttribute('data-gara');
            console.log("Cliccato:", gara);
            
            caricaGara(gara);
            
            // Evidenzia la card attiva
            flagCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    // Event listener per il pulsante Risultati
    risultatiBtn.addEventListener('click', () => {
        mostraRisultati();
    });
    
    // Nuova funzione per nascondere la sezione pista (senza display: none)
    function nascondiTrackInfo() {
        const trackInfo = document.querySelector('.track-info');
        if (trackInfo) {
            trackInfo.style.opacity = '0';
            trackInfo.style.visibility = 'hidden';
            trackInfo.style.height = '0';
            trackInfo.style.margin = '0';
            trackInfo.style.padding = '0';
            trackInfo.style.overflow = 'hidden';
            trackInfo.style.transition = 'all 0.3s ease';
        }
    }

    // Nuova funzione per mostrare la sezione pista
    function mostraTrackInfo() {
        const trackInfo = document.querySelector('.track-info');
        if (trackInfo) {
            trackInfo.style.opacity = '1';
            trackInfo.style.visibility = 'visible';
            trackInfo.style.height = 'auto';
            trackInfo.style.margin = '50px auto 30px auto';
            trackInfo.style.padding = '0 20px';
            trackInfo.style.overflow = 'visible';
        }
    }

    function scrollToCalendario() {
        const flagsContainer = document.querySelector('.flags-3');
        if (flagsContainer) {
            flagsContainer.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center' // Centra verticalmente nella viewport
            });
        }
    }

    async function caricaGara(nomeGara) {
        const basePath = getBasePath();
        const textFile = `${basePath}/${nomeGara}.txt`;
        
        if (!container) {
            console.error("Elemento 'contenuto-testo' non trovato!");
            return;
        }

        try {
            mostraTrackInfo();
            // Aggiorna immagine e data PRIMA del caricamento
            aggiornaTrackInfo(nomeGara);
            
            // NASCONDI i risultati all'inizio
            container.style.display = 'none';
            mostraNewsHeader(false);
            
            const response = await fetch(textFile);
            if (!response.ok) throw new Error(`File non trovato: ${textFile}`);
            
            const data = await response.text();
        
            // 🔍 NUOVO CONTROLLO: file vuoto o solo spazi
            if (!data.trim()) {
                throw new Error(`File vuoto: ${textFile}`);
            }
        
            processaTesto(data, container);
            
            // Scroll smooth verso la pista dopo il caricamento
            setTimeout(() => {
                scrollToTrack();
            }, 100);
            
        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <p style="text-align: center; color: black; font-weight: bold; font-size: 20px;">
                    🏁 La gara non è ancora stata disputata 🏁
                </p>`;
            
            // Anche in caso di errore, nascondi i risultati
            container.style.display = 'none';
            mostraNewsHeader(false);
            
            setTimeout(() => {
                scrollToTrack();
            }, 100);
        }
    }
 
    
    function mostraRisultati() {
        // Mostra i risultati con fade in
        container.style.display = 'block';
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.3s ease';
    
        // Verifica se il contenuto indica che la gara non è stata disputata
        const isNotRun = container.innerHTML.includes('La gara non è ancora stata disputata');
    
        // Mostra o nascondi l'intestazione "Ultime news"
        mostraNewsHeader(!isNotRun);
    
        setTimeout(() => {
            container.style.opacity = '1';
        }, 50);
    
        // Scroll solo verso la sezione giusta
        setTimeout(() => {
            if (isNotRun) {
                scrollToTrack();
            } else {
                scrollToNews();
            }
        }, 100);
    }

    function aggiornaTrackInfo(nomeGara) {
        const track = trackData[nomeGara];
        if (track) {
            trackImage.src = track.image;
            trackImage.alt = `Circuito ${nomeGara}`;
            trackDate.textContent = track.date;
            
            // Gestione errore immagine
            trackImage.onerror = function() {
                this.src = '../immagini/piste/default.jpg';
                console.warn(`Immagine non trovata per ${nomeGara}`);
            };
        }
    }

    function mostraNewsHeader(mostra) {
        const newsHeader = document.querySelector('.news_header');
        if (newsHeader) {
            if (mostra) {
                newsHeader.style.display = 'block';
                setTimeout(() => {
                    newsHeader.style.opacity = '1';
                }, 50);
            } else {
                newsHeader.style.opacity = '0';
                setTimeout(() => {
                    newsHeader.style.display = 'none';
                }, 300);
            }
        }
    }

    function scrollToTrack() {
        const trackInfo = document.querySelector('.track-info');
        if (trackInfo) {
            // Calcola la posizione del trackInfo
            const trackInfoRect = trackInfo.getBoundingClientRect();
            const trackInfoTop = trackInfoRect.top + window.pageYOffset;
            
            // Calcola dove dovrebbe essere il tasto risultati (circa 300px sotto il trackInfo)
            const targetPosition = trackInfoTop + 300;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    function scrollToNews() {
        const newsHeader = document.querySelector('.news_header');
        if (newsHeader) {
            newsHeader.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    function processaTesto(data, container) {
        data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        container.innerHTML = "";
    
        const lines = data.split('\n');
        let emptyLineCount = 0;
        let buffer = [];
        let isFirstBlock = true; // <-- nuovo flag
    
        lines.forEach(line => {
            if (line.trim() === "") {
                emptyLineCount++;
            } else {
                if (buffer.length > 0 && emptyLineCount > 0) {
                    processBuffer(buffer, emptyLineCount, container, isFirstBlock);
                    buffer = [];
                    isFirstBlock = false; // solo il primo blocco sarà trattato come titolo
                }
                buffer.push(line);
                emptyLineCount = 0;
            }
        });
    
        if (buffer.length > 0) {
            processBuffer(buffer, emptyLineCount, container, isFirstBlock);
        }
    }
    

    function processBuffer(buffer, emptyLineCount, container, isFirstBlock = false) {
        const text = buffer.join('\n').trim();
        if (!text) return;
    
        if (text.includes('📊 Pagelle') || text.includes('Pilota') || text.includes('Voto') || text.includes('Descrizione')) {
            createTableSection(text, container);
            return;
        }
    
        const quoteMatch = text.match(/^"([^"]+)"\s*–?\s*([^-]+)$/);
        if (quoteMatch) {
            createQuoteSection(quoteMatch[1], quoteMatch[2], container);
            return;
        }
    
        const p = document.createElement("p");
        let formattedText = text.replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;")
                                .replace(/  /g, ' &nbsp;')
                                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                                .replace(/"([^"]+)"/g, '<i>$1</i>');
    
        p.innerHTML = formattedText;
        p.style.whiteSpace = 'pre-wrap';
        p.style.marginBottom = `${emptyLineCount * 1.5}em`;
    
        // 🎯 Se è il primo blocco di testo, formattalo come titolo
        if (isFirstBlock) {
            p.style.fontSize = '1.8em';
            p.style.fontWeight = 'bold';
            p.style.textAlign = 'center';
            p.style.color = '#111';
            p.style.marginBottom = '1em';
        }
    
        container.appendChild(p);
    }
    

    function createQuoteSection(quote, source, container) {
        const quoteDiv = document.createElement("div");
        quoteDiv.className = "quote-section";

        const img = document.createElement("img");
        const sourceKey = source.trim().toLowerCase().replace(/[\s\.]+/g, '');
        img.src = `../../immagini/loghi/${sourceKey}.jpg`;
        img.alt = source;
        img.className = "quote-logo";
        img.onerror = function() { this.style.display = 'none'; };

        const quoteContent = document.createElement("div");
        quoteContent.className = "quote-content";

        const quoteText = document.createElement("blockquote");
        quoteText.innerHTML = `<i>${quote}</i>`;

        const quoteSource = document.createElement("cite");
        quoteSource.textContent = `– ${source.trim()}`;

        quoteContent.appendChild(quoteText);
        quoteContent.appendChild(quoteSource);

        quoteDiv.appendChild(img);
        quoteDiv.appendChild(quoteContent);
        container.appendChild(quoteDiv);
    }

    function createTableSection(text, container) {
        const tableSection = document.createElement("div");
        tableSection.className = "table-section";

        const lines = text.split('\n');
        let tableRows = [];

        lines.forEach(line => {
            if (line.includes('📊 Pagelle')) {
                const title = document.createElement("h3");
                title.textContent = "📊 Pagelle";
                title.className = "table-title";
                tableSection.appendChild(title);
            } else if (line.includes('Pilota') && line.includes('Voto') && line.includes('Descrizione')) {
                // intestazione trovata
            } else if (line.trim() && !line.includes('---')) {
                tableRows.push(line);
            }
        });

        const table = document.createElement("table");
        table.className = "rating-table";

        // Intestazione
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        ['Pilota', 'Voto', 'Descrizione'].forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            if (text === 'Voto') th.className = 'voto-th';
            if (text === 'Descrizione') th.className = 'desc-th';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Corpo
        const tbody = document.createElement("tbody");

        tableRows.forEach(row => {
            const columns = row.split(/\t|\s{2,}/).filter(col => col.trim());
            if (columns.length >= 3) {
                const tr = document.createElement("tr");

                // Pilota
                const tdPilota = document.createElement("td");
                tdPilota.className = "pilota-cell";

                const pilotaName = columns[0].trim();
                const img = document.createElement("img");
                const pilotaKey = pilotaName.toLowerCase().replace(/\s+/g, '-');
                img.src = `../images/${pilotaKey}.jpg`;
                img.alt = pilotaName;
                img.className = "pilota-image";
                img.onerror = function() { this.style.display = 'none'; };

                const nameSpan = document.createElement("span");
                nameSpan.textContent = pilotaName;
                nameSpan.className = "pilota-name";

                tdPilota.appendChild(img);
                tdPilota.appendChild(nameSpan);
                tr.appendChild(tdPilota);

                // Voto
                const tdVoto = document.createElement("td");
                tdVoto.className = "voto-cell";
                tdVoto.textContent = columns[1].trim();
                tr.appendChild(tdVoto);

                // Descrizione
                const tdDesc = document.createElement("td");
                tdDesc.className = "desc-cell";
                tdDesc.textContent = columns[2].trim();
                tr.appendChild(tdDesc);

                tbody.appendChild(tr);
            }
        });

        table.appendChild(tbody);
        tableSection.appendChild(table);
        container.appendChild(tableSection);
    }
});