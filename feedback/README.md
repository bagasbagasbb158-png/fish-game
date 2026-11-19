# Feedback inbox

Laporan bug/saran yang dikirim dari game diunduh browser sebagai `feedback-inbox.jsonl`.

Untuk memasukkannya ke project VSCode, pindahkan file unduhan ke folder ini. Setiap baris adalah satu laporan JSON (JSON Lines / JSONL). Jika ada file sebelumnya, backup dulu lalu gabungkan baris-barisnya agar laporan lama tidak tertimpa.

Catatan: browser tidak diizinkan menulis langsung ke folder project lokal. Karena itu, game menyimpan salinan di `localStorage` browser dan mengunduh file laporan saat tombol Kirim ditekan.
