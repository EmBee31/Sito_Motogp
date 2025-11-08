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

    paragrafi.forEach((p, index) => {
      const bolla = document.createElement("div");
      bolla.className = "notizia-bolla";
      
      // Opzionale: aggiungi una data fittizia
      const data = new Date();
      data.setDate(data.getDate() - index);
      const dataFormattata = data.toLocaleDateString('it-IT');
      
      bolla.innerHTML = `
        <div class="notizia-data">${dataFormattata}</div>
        <div class="notizia-contenuto">${p.replace(/\n/g, "<br>")}</div>
      `;
      
      container.appendChild(bolla);
    });
  })
  .catch(error => {
    console.error("Errore:", error);
    document.getElementById("contenuto-testo").textContent =
      "Impossibile caricare le notizie di mercato.";
  });