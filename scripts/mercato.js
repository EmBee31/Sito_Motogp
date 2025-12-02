fetch("docs/mercato.txt")
  .then(response => {
    if (!response.ok) {
      throw new Error("Errore nel caricamento del file: " + response.status);
    }
    return response.text();
  })
  .then(testo => {
    const container = document.getElementById("contenuto-testo");
    container.innerHTML = "";

    const paragrafi = testo
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Dati delle piste con date e codici bandiera
    const trackData = {
      'americhe': { image: 'immagini/piste/americhe.jpg', date: '28-30 Marzo 2026', bandiera: 'us' },
      'aragon': { image: 'immagini/piste/aragon.jpg', date: '28-30 Agosto 2026', bandiera: 'es' },
      'assen': { image: 'immagini/piste/assen.jpg', date: '26-28 Giugno 2026', bandiera: 'nl' },
      'buddh': { image: 'immagini/piste/buddh.jpg', date: '20-22 Marzo 2026', bandiera: 'in' },
      'brno': { image: 'immagini/piste/brno.jpg', date: '19-21 Giugno 2026', bandiera: 'cz' },
      'buriram': { image: 'immagini/piste/buriram.jpg', date: '27 Febbraio - 1 Marzo 2026', bandiera: 'th' },
      'catalogna': { image: 'immagini/piste/catalogna.jpg', date: '15-17 Maggio 2026', bandiera: 'es' },
      'jerez': { image: 'immagini/piste/jerez.jpg', date: '24-26 Aprile 2026', bandiera: 'es' },
      'lemans': { image: 'immagini/piste/lemans.jpg', date: '8-10 Maggio 2026', bandiera: 'fr' },
      'lusail': { image: 'immagini/piste/lusail.jpg', date: '10-12 Aprile 2026', bandiera: 'qa' },
      'mandalika': { image: 'immagini/piste/mandalika.jpg', date: '9-11 Ottobre 2026', bandiera: 'id' },
      'misano': { image: 'immagini/piste/misano.jpg', date: '11-13 Settembre 2026', bandiera: 'sm' },
      'motegi': { image: 'immagini/piste/motegi.jpg', date: '2-4 Ottobre 2026', bandiera: 'jp' },
      'mugello': { image: 'immagini/piste/mugello.jpg', date: '29-31 Maggio 2026', bandiera: 'it' },
      'phillipisland': { image: 'immagini/piste/phillipisland.jpg', date: '23-25 Ottobre 2026', bandiera: 'au' },
      'portimao': { image: 'immagini/piste/portimao.jpg', date: '13-15 Novembre 2026', bandiera: 'pt' },
      'redbullring': { image: 'immagini/piste/redbullring.jpg', date: '18-20 Settembre 2026', bandiera: 'at' },
      'sachsenring': { image: 'immagini/piste/sachsenring.jpg', date: '10-12 Luglio 2026', bandiera: 'de' },
      'sepang': { image: 'immagini/piste/sepang.jpg', date: '30 Ottobre - 1 Novembre 2026', bandiera: 'my' },
      'sokol': { image: 'immagini/piste/sokol.jpg', date: '5-7 Giugno 2026', bandiera: 'kz' },
      'silverstone': { image: 'immagini/piste/silverstone.jpg', date: '7-9 Agosto 2026', bandiera: 'gb' },
      'termas': { image: 'immagini/piste/termas.jpg', date: '20-22 Marzo 2026', bandiera: 'ar' },
      'valencia': { image: 'immagini/piste/valencia.jpg', date: '20-22 Novembre 2026', bandiera: 'es' },
    };

    paragrafi.forEach((p, index) => {
      const bolla = document.createElement("div");
      bolla.className = "notizia-bolla";
      
      // Cerca di matchare con una pista reale
      const gpMatch = trovaGPMatch(p, trackData);
      
      let dataFormattata;
      let codiceBandiera = '';
      
      if (gpMatch) {
        // Usa la data reale e la bandiera
        dataFormattata = gpMatch.date;
        codiceBandiera = gpMatch.bandiera;
        console.log(`Trovato match: ${Object.keys(trackData).find(key => trackData[key] === gpMatch)} con bandiera: ${codiceBandiera}`);
      } else {
        // Fallback: data fittizia
        const data = new Date();
        data.setDate(data.getDate() - index);
        dataFormattata = data.toLocaleDateString('it-IT');
        console.log(`Nessun match trovato per: ${p.substring(0, 50)}...`);
      }
      
      // Crea il contenuto con la bandiera
      const contenutoDiv = document.createElement("div");
      contenutoDiv.className = "notizia-contenuto";
      
      if (codiceBandiera) {
        // Crea l'elemento bandiera usando FlagCDN
        const bandieraImg = document.createElement("img");
        bandieraImg.src = `https://flagcdn.com/w40/${codiceBandiera}.png`;
        bandieraImg.alt = codiceBandiera;
        bandieraImg.className = "bandiera-notizia";
        bandieraImg.style.cssText = `
          width: 20px;
          height: 15px;
          vertical-align: middle;
          margin-right: 8px;
          border: 1px solid black;       /* bordo nero */
          box-sizing: border-box;         /* assicura che il bordo non ingrandisca l'immagine */
          border-radius: 2px;             /* opzionale: angoli leggermente arrotondati */
        `;
        
        // Aggiungi la bandiera prima del testo
        contenutoDiv.appendChild(bandieraImg);
      }
      
      // Aggiungi il testo formattato
      const testoFormattato = document.createElement("div");
      testoFormattato.innerHTML = p.replace(/\n/g, "<br>");
      contenutoDiv.appendChild(testoFormattato);
      
      bolla.innerHTML = `
        <div class="notizia-data">${dataFormattata}</div>
      `;
      bolla.appendChild(contenutoDiv);
      
      container.appendChild(bolla);
    });
  })
  .catch(error => {
    console.error("Errore:", error);
    document.getElementById("contenuto-testo").textContent =
      "Impossibile caricare le notizie di mercato.";
  });


// Funzione per trovare il match con un GP - VERSIONE MIGLIORATA
function trovaGPMatch(testoNotizia, trackData) {
    // Regex: cattura tutto tra "GP" e "-" (es. "VALENCIA" in "GP VALENCIA - MOTOGP")
    const regex = /GP\s+([A-Za-zÀ-ÿ\s]+?)\s*-/i;
    const match = testoNotizia.match(regex);
  
    if (!match) return null;
  
    // Pulizia e minuscolo
    const nomeGPEstratto = match[1].trim().toLowerCase();
    console.log("Nome GP estratto:", nomeGPEstratto);

  const mappaturaNomi = {
    'americhe': ['americhe', 'austin', 'texas', 'cota'],
    'aragon': ['aragon', 'aragona'],
    'assen': ['assen', 'olanda'],
    'buddh': ['buddh', 'india'],
    'brno': ['brno', 'cechia', 'czechia'],
    'buriram': ['buriram', 'thailandia', 'thai'],
    'catalogna': ['catalogna', 'barcellona', 'spagna'],
    'jerez': ['jerez', 'andalusia', 'spagna'],
    'lemans': ['lemans', 'francia'],
    'lusail': ['lusail', 'qatar'],
    'mandalika': ['mandalika', 'indonesia'],
    'misano': ['misano', 'san marino'],
    'motegi': ['motegi', 'giappone'],
    'mugello': ['mugello', 'italia', 'toscana'],
    'phillipisland': ['phillipisland', 'australia', 'phillip island'],
    'portimao': ['portimao', 'portogallo'],
    'redbullring': ['redbullring', 'austria'],
    'sachsenring': ['sachsenring', 'germania'],
    'sepang': ['sepang', 'malesia'],
    'sokol': ['sokol', 'kazakistan', 'kazakhstan'],
    'silverstone': ['silverstone', 'gran bretagna', 'inghilterra'],
    'termas': ['termas', 'argentina'],
    'valencia': ['valencia', 'comunidad valenciana','spagna'],
  };

 // Cerca match
 for (const [gpKey, nomi] of Object.entries(mappaturaNomi)) {
    if (nomi.some(nome => nomeGPEstratto.includes(nome.toLowerCase()))) {
      console.log(`Match trovato: ${gpKey}`);
      return trackData[gpKey];
    }
  }

  console.log("Nessun match trovato");
  return null;
}
