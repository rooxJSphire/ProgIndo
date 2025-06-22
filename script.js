function loadKata(url) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("kataContainer");
      container.innerHTML = "";

      const kata = data[Math.floor(Math.random() * data.length)];

      const div = document.createElement("div");
      div.className = "kataBox";
      div.innerHTML = `
        <p id="kataTeks">${kata}</p>
        <button onclick="copyText()">Salin Kata</button>
      `;
      container.appendChild(div);
    })
    .catch(err => {
      console.error("Gagal memuat kata:", err);
      document.getElementById("kataContainer").innerHTML = "<p>Gagal memuat data. Periksa koneksi Anda.</p>";
    });
}

function copyText() {
  const text = document.getElementById("kataTeks").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Kata berhasil disalin!");
  });
}