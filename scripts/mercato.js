fetch("../Sito_Motogp/docs/mercato.txt")
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
      'buriram': { image: 'immagini/piste/buriram.jpg', date: '28 Febbraio - 2 Marzo 2025', bandiera: 'th' },
      'valencia1': { image: 'immagini/piste/valencia.jpg', date: '14-16 Marzo 2025', bandiera: 'es' },
      'americhe': { image: 'immagini/piste/americhe.jpg', date: '28-30 Marzo 2025', bandiera: 'us' },
      'lusail': { image: 'immagini/piste/lusail.jpg', date: '11-13 Aprile 2025', bandiera: 'qa' },
      'jerez': { image: 'immagini/piste/jerez.jpg', date: '25-27 Aprile 2025', bandiera: 'es' },
      'lemans': { image: 'immagini/piste/lemans.jpg', date: '9-11 Maggio 2025', bandiera: 'fr' },
      'silverstone': { image: 'immagini/piste/silverstone.jpg', date: '23-25 Maggio 2025', bandiera: 'gb' },
      'aragon': { image: 'immagini/piste/aragon.jpg', date: '6-8 Giugno 2025', bandiera: 'es' },
      'mugello': { image: 'immagini/piste/mugello.jpg', date: '20-22 Giugno 2025', bandiera: 'it' },
      'assen': { image: 'immagini/piste/assen.jpg', date: '27-29 Giugno 2025', bandiera: 'nl' },
      'sachsenring': { image: 'immagini/piste/sachsenring.jpg', date: '11-13 Luglio 2025', bandiera: 'de' },
      'sokol': { image: 'immagini/piste/sokol.jpg', date: '18-20 Luglio 2025', bandiera: 'kz' },
      'redbullring': { image: 'immagini/piste/redbullring.jpg', date: '15-17 Agosto 2025', bandiera: 'at' },
      'buddh': { image: 'immagini/piste/buddh.jpg', date: '22-24 Agosto 2025', bandiera: 'in' },
      'catalogna': { image: 'immagini/piste/catalogna.jpg', date: '5-7 Settembre 2025', bandiera: 'es' },
      'misano': { image: 'immagini/piste/misano.jpg', date: '12-14 Settembre 2025', bandiera: 'sm' },
      'motegi': { image: 'immagini/piste/motegi.jpg', date: '26-28 Settembre 2025', bandiera: 'jp' },
      'mandalika': { image: 'immagini/piste/mandalika.jpg', date: '3-5 Ottobre 2025', bandiera: 'id' },
      'phillipisland': { image: 'immagini/piste/phillipisland.jpg', date: '17-19 Ottobre 2025', bandiera: 'au' },
      'sepang': { image: 'immagini/piste/sepang.jpg', date: '24-26 Ottobre 2025', bandiera: 'my' },
      'portimao': { image: 'immagini/piste/portimao.jpg', date: '7-9 Novembre 2025', bandiera: 'pt' },
      'valencia2': { image: 'immagini/piste/valencia.jpg', date: '14-16 Novembre 2025', bandiera: 'es' }
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
        bandieraImg.style.cssText = "width: 20px; height: 15px; vertical-align: middle; margin-right: 8px;";
        
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
  const mappaturaNomi = {
    'buriram': ['buriram', 'thailandia', 'thai'],
    'valencia1': ['valencia', 'europa'],
    'valencia2': ['valencia', 'comunità valenciana'],
    'americhe': ['americhe', 'austin', 'texas', 'cota'],
    'lusail': ['lusail', 'qatar'],
    'jerez': ['jerez', 'andalusia'],
    'lemans': ['lemans', 'francia'],
    'silverstone': ['silverstone', 'gran bretagna', 'inghilterra'],
    'aragon': ['aragon', 'aragona'],
    'mugello': ['mugello', 'italia', 'toscana'],
    'assen': ['assen', 'olanda'],
    'sachsenring': ['sachsenring', 'germania'],
    'sokol': ['sokol', 'kazakistan'],
    'redbullring': ['redbullring', 'austria'],
    'buddh': ['buddh', 'india'],
    'catalogna': ['catalogna', 'barcellona'],
    'misano': ['misano', 'san marino'],
    'motegi': ['motegi', 'giappone'],
    'mandalika': ['mandalika', 'indonesia'],
    'phillipisland': ['phillipisland', 'australia'],
    'sepang': ['sepang', 'malesia'],
    'portimao': ['portimao', 'portogallo']
  };

  const testoMinuscolo = testoNotizia.toLowerCase();
  console.log("Cercando match per:", testoMinuscolo.substring(0, 100));
  
  for (const [gpKey, nomi] of Object.entries(mappaturaNomi)) {
    const trovato = nomi.some(nome => testoMinuscolo.includes(nome.toLowerCase()));
    if (trovato) {
      console.log(`Match trovato: ${gpKey} con nomi: ${nomi.join(', ')}`);
      return trackData[gpKey];
    }
  }
  
  console.log("Nessun match trovato");
  return null;
}
