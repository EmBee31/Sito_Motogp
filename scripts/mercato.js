// ../scripts/mercato.js

fetch("../docs/mercato.txt")
  .then(response => {
    if (!response.ok) {
      throw new Error("Errore nel caricamento del file: " + response.status);
    }
    return response.text();
  })
  .then(testo => {
    const container = document.getElementById("contenuto-testo");
    container.innerHTML = "";

    // 🔹 Divide il testo in paragrafi (una notizia per paragrafo)
    const paragrafi = testo
      .split(/\n\s*\n/) // separa per una o più righe vuote
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // 🔹 Crea una bolla per ogni paragrafo
    paragrafi.forEach(p => {
      const bolla = document.createElement("div");
      bolla.className = "notizia-bolla";
      bolla.innerHTML = p.replace(/\n/g, "<br>"); // mantiene eventuali a capo interni
      container.appendChild(bolla);
    });
  })
  .catch(error => {
    console.error("Errore:", error);
    document.getElementById("contenuto-testo").textContent =
      "Impossibile caricare le notizie di mercato.";
  });
