import SETTINGS from '../settings.js';

let user = {
  saldo: 0,
  status: false,
  amount: 0,
  transactionId: null,
  interval: null
};

window.buatPembayaran = async function () {
  const jumlahDeposit = parseInt(document.getElementById("jumlah").value);
  if (!jumlahDeposit || jumlahDeposit <= 0) return alert("Masukkan jumlah yang valid!");

  const { apikey, qrisCode } = SETTINGS.QRIS;
  const res = await fetch(`https://www.wannhosting.web.id/api/orkut/createpayment?apikey=${apikey}&amount=${jumlahDeposit}&codeqr=${qrisCode}`);
  const json = await res.json();

  if (!json?.result) return alert("❌ Gagal membuat QRIS.");

  const data = json.result;
  user.status = true;
  user.amount = jumlahDeposit;
  user.transactionId = data.transactionId;

  document.getElementById("inputArea").classList.add("hidden");
  document.getElementById("qrisArea").classList.remove("hidden");
  document.getElementById("batalBtn").classList.remove("hidden");
  document.getElementById("suksesArea").classList.add("hidden");

  document.getElementById("qrisImage").src = data.qrImageUrl;
  document.getElementById("paymentInfo").innerHTML = `
    💰 Jumlah: Rp ${jumlahDeposit.toLocaleString()}<br>
    🆔 Transaksi: ${data.transactionId}<br>
    ⏰ Expired: 5 menit
  `;

  if (user.interval) clearInterval(user.interval);
  user.interval = setInterval(cekStatusPembayaran, SETTINGS.CHECK_INTERVAL_MS);
};

window.batalkanPembayaran = function () {
  if (!user.status) return alert("Tidak ada transaksi aktif.");
  user.status = false;
  clearInterval(user.interval);
  user.transactionId = null;
  user.amount = 0;

  document.getElementById("qrisArea").classList.add("hidden");
  document.getElementById("batalBtn").classList.add("hidden");
  document.getElementById("suksesArea").classList.add("hidden");
  document.getElementById("inputArea").classList.remove("hidden");
};

async function cekStatusPembayaran() {
  if (!user.status) return clearInterval(user.interval);

  const { apikey, merchantId, keyorkut } = SETTINGS.QRIS;

  try {
    const res = await fetch(`https://www.wannhosting.web.id/api/orkut/cekstatus?apikey=${apikey}&merchant=${merchantId}&keyorkut=${keyorkut}`);
    const json = await res.json();

    // Jika data transaksi array
    if (!json?.data || !Array.isArray(json.data)) {
      console.log("❌ Data transaksi tidak valid.");
      return;
    }

    // Cari transaksi berdasarkan transactionId
    const transaksi = json.data.find(item => item.transactionId === user.transactionId);

    if (!transaksi) {
      console.log("⌛ Transaksi belum ditemukan.");
      return;
    }

    // Jika pembayaran berhasil
    if (transaksi.status === "PAID" || transaksi.amount == user.amount) {
      user.status = false;
      clearInterval(user.interval);
      user.saldo += user.amount;

      const trxId = "FR3-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

      document.getElementById("qrisArea").classList.add("hidden");
      document.getElementById("batalBtn").classList.add("hidden");
      document.getElementById("suksesArea").classList.remove("hidden");

      document.getElementById("suksesInfo").innerHTML = `
        <strong>Pembayaran Berhasil ✅</strong><br><br>
        💰 Jumlah: Rp ${user.amount.toLocaleString()}<br>
        🆔 ID Transaksi: ${trxId}<br>
        📈 Saldo Baru: Rp ${user.saldo.toLocaleString()}
      `;
    } else {
      console.log("⌛ Belum dibayar. Mengecek ulang...");
    }

  } catch (err) {
    console.error("❌ Gagal cek status:", err);
  }
}