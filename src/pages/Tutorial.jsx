import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";

/* ============================================================
   PANDUAN SELA — dua zaman, sebelas edisi.
   Portal: dua kartu berantakan → pilih 1910 atau 2300.
   1910: koran tua, mengikuti tema setting (Terang/Sepia/Gelap).
   2300: SELA BROADCAST NETWORK — media berita masa depan,
         amber-emas di atas cokelat gelap, ticker & waveform.
   Navigasi: rail terpisah yang berubah wajah per zaman.
   ============================================================ */

/* ---------- kuis interaktif ---------- */
function Kuis({ soal }) {
  const [pilih, setPilih] = useState(null);
  return (
    <div className="tut-kuis">
      <p className="tut-kuis-cap">Ujian Sipir — jawab dengan teliti</p>
      <p className="tut-kuis-q">{soal.q}</p>
      <div className="tut-kuis-op">
        {soal.o.map((o, i) => {
          const benar = i === soal.a;
          let st = "";
          if (pilih !== null && benar) st = " benar";
          else if (pilih === i) st = " salah";
          else if (pilih !== null) st = " redup";
          return (
            <button
              key={i}
              disabled={pilih !== null}
              onClick={() => setPilih(i)}
              className={`tut-kuis-btn${st}`}>
              <span className="tut-kuis-hrf">
                {String.fromCharCode(65 + i)}
              </span>
              {o}
              {pilih !== null && benar && <i className="tut-corek">✓</i>}
              {pilih === i && !benar && <i className="tut-corek">✗</i>}
            </button>
          );
        })}
      </div>
      {pilih !== null && (
        <p className="tut-kuis-hsl">
          {pilih === soal.a
            ? "Lulus dengan pujian. " + (soal.jel || "")
            : "Kurang teliti — jawaban yang benar dicoret. " + (soal.jel || "")}
        </p>
      )}
    </div>
  );
}

/* ---------- latihan menulis ---------- */
function Latihan({ soal, contoh }) {
  const [isi, setIsi] = useState("");
  return (
    <div className="tut-latihan">
      <p className="tut-lat-cap">Latihan meja redaksi</p>
      <p className="tut-lat-q">{soal}</p>
      <textarea
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        placeholder="Tulis latihanmu di sini… (kertas ini tidak disimpan — salin ke Studio bila pantas)"
        className="tut-lat-ta"
        rows={4}
      />
      {contoh && (
        <details className="tut-lat-details">
          <summary>Lihat tulisan contoh redaksi</summary>
          <pre className="tut-lat-contoh">{contoh}</pre>
        </details>
      )}
    </div>
  );
}

/* ---------- komponen kecil ---------- */
function Kode({ children }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="tut-kode-wrap">
      <pre className="tut-kode">{children}</pre>
      <button
        onClick={() =>
          navigator.clipboard.writeText(children).then(() => {
            setOk(true);
            setTimeout(() => setOk(false), 1500);
          })
        }
        className="tut-salin">
        {ok ? "tersalin" : "salin"}
      </button>
    </div>
  );
}

function Tabel({ rows, head = ["Kamu tulis", "Jadi", "Catatan"] }) {
  return (
    <div className="tut-tabel-wrap">
      <table className="tut-tabel">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="tut-mono">{r[0]}</td>
              <td>{r[1]}</td>
              <td className="tut-redup">{r[2] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Anotasi({ children }) {
  return (
    <div className="tut-anotasi">
      <span className="tut-orn">✦</span> {children}
    </div>
  );
}

/* ================= EDISI I ================= */
function EdisiBuku() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Saudara pembaca yang mulai menulis — selamat datang di meja redaksi.
        Sebelum tinta pertama jatuh, izinkan kami menjelaskan cara kerja
        percetakan ini. Seluruh buku di Sela disusun dari{" "}
        <b>Markdown sederhana</b>: seperangkat tanda kecil yang mengubah tulisan
        biasa menjadi bab yang berdiri sendiri, kuis yang menguji, kutipan yang
        berdiri maju, hingga tokoh yang dapat diketuk oleh pembaca. Tulis di{" "}
        <Link to="/studio" className="tut-link">
          Studio
        </Link>{" "}
        — panel kiri menulis, panel kanan memperlihatkan hasil persis seperti
        yang akan dibaca pembaca — atau bawa naskah{" "}
        <span className="tut-mono">.md</span> ke{" "}
        <Link to="/impor" className="tut-link">
          halaman Impor
        </Link>
        , dan biarkan mesin memilah bab demi bab untukmu.
      </p>
      <h3 className="tut-h3">I. Aturan pertama: satu pagar, satu bab</h3>
      <p className="tut-par">
        Satu tanda pagar <span className="tut-mono">#</span> di awal baris
        berarti satu bab baru. Dua pagar menjadi sub-judul; tiga pagar judul
        kecil. Wajib ada satu spasi setelah pagar — tanpa spasi, tanda itu
        diperlakukan sebagai tulisan biasa. Kesalahan paling tua dalam sejarah
        percetakan ini adalah lupa spasi itu.
      </p>
      <Tabel
        rows={[
          ["# Judul Bab", "BAB BARU", "Wajib ada spasi setelah #"],
          ["## Sub-judul", "Judul besar dalam bab", "Untuk bagian penting"],
          ["### Sub-sub", "Judul kecil", "Untuk rincian halus"],
          ["%% kalimat", "Ringkasan bab", "Tampil otomatis di akhir bab"],
          [
            "@?? Soal? | A | B* | C",
            "Kuis pilihan ganda",
            "Bintang * = jawaban benar",
          ],
          [
            "@tl Tahun | Peristiwa",
            "LINIMASA",
            "Tahun menyala mengikuti gulir",
          ],
        ]}
      />
      <h3 className="tut-h3">II. Menghias tulisan</h3>
      <Tabel
        rows={[
          ["**teks**", <b key="b">Tebal</b>, "Dua bintang mengapit"],
          ["*teks*", <i key="i">Miring</i>, "Tanpa spasi di dalam"],
          [
            "`teks`",
            <code key="c" className="tut-inline">
              Kode
            </code>,
            "Backtick, bukan apostrof",
          ],
          ["\\*teks\\*", "*teks*", "Backslash menampilkan tanda apa adanya"],
        ]}
      />
      <h3 className="tut-h3">III. Daftar, kutipan, dan kotak penegasan</h3>
      <p className="tut-par">
        Daftar dengan tanda pisah; kutipan dengan tanda lebih-besar — tampil
        miring bergaris aksen. Bila kutipan diawali bintang, ia menjadi
        <b> callout</b>: kotak berbutir untuk poin yang tak boleh terlewat.
      </p>
      <div className="tut-dua">
        <div>
          <p className="tut-cap">Kamu tulis</p>
          <Kode>{`> Harta sejati adalah ilmu yang dibagi.

> * Poin pertama yang penting
> * Poin kedua yang tak kalah penting`}</Kode>
        </div>
        <div>
          <p className="tut-cap">Pembaca lihat</p>
          <blockquote className="tut-kutip">
            Harta sejati adalah ilmu yang dibagi.
          </blockquote>
          <div className="tut-callout-demo">
            <ul>
              <li>Poin pertama yang penting</li>
              <li>Poin kedua yang tak kalah penting</li>
            </ul>
          </div>
        </div>
      </div>
      <h3 className="tut-h3">IV. Kuis: lebih dari satu soal per bab</h3>
      <p className="tut-par">
        <span className="tut-mono">@??</span> membuat soal pilihan ganda; boleh
        lebih dari satu per bab — semuanya terkumpul dan tampil berurutan di
        akhir bab. Inilah yang membuat bab pelajaran terasa seperti guru yang
        mengetuk-ngetuk meja.
      </p>
      <Kode>{`@?? Apa prinsip Kancil? | Kecepatan | Kesabaran* | Kekuatan

@?? Siapa sahabat Kancil yang paling teliti? |
Elang | Kura-kura* | Buaya`}</Kode>
      <h3 className="tut-h3">V. Linimasa: waktu yang menyala</h3>
      <p className="tut-par">
        <span className="tut-mono">@tl</span> menyusun peristiwa menjadi garis
        waktu; di genre Sejarah ia <b>menyala mengikuti guliran</b> — tahun yang
        sedang dibaca berpendar seperti lilin.
      </p>
      <h3 className="tut-h3">VI. Tokoh dan glosarium</h3>
      <p className="tut-par">
        Kurung kurawal pada nama — pembaca mengetuknya dan melihat statistik
        kemunculan. Kata biasa yang ingin diberi arti: daftarkan di{" "}
        <Link to="/glosarium" className="tut-link">
          Glosarium
        </Link>{" "}
        — rinciannya di Edisi Kesembilan.
      </p>
      <h3 className="tut-h3">VII. Genre menentukan mode baca</h3>
      <Tabel
        head={["Genre", "Mode baca", "Cocok untuk"]}
        rows={[
          ["Pelajaran", "Fokus", "Kuis + ringkasan aktif"],
          ["Fiksi", "Imersi", "Novel — antarmuka menghilang"],
          ["Sejarah", "Linimasa", "Garis waktu menyala"],
          ["Puisi", "Lambat", "Satu bait per layar"],
          ["Anak", "Ceria", "Huruf besar + dibacakan"],
          ["Umum", "Imersi", "Standar"],
        ]}
      />
      <h3 className="tut-h3">VIII. Lembar contoh siap pakai</h3>
      <Kode>{`# Bab Satu: Awal Mula

Di hutan yang lebat, hiduplah {Kancil} yang terkenal cerdik.
Ia percaya **kesabaran** mengalahkan kecepatan.

> Harta sejati adalah ilmu yang dibagi.

@tl 1901 | Kancil lahir di tepi sungai yang jernih.

%% Sabar lebih tajam dari cakar.

@?? Apa prinsip Kancil? | Kecepatan | Kesabaran* | Kekuatan`}</Kode>
      <Kuis
        soal={{
          q: "Tanda apa yang membuat BAB baru di naskah Sela?",
          o: [
            "Tanda bintang ganda **",
            "Satu pagar # dengan spasi setelahnya",
            "Tiga garis miring ///",
          ],
          a: 1,
          jel: "Satu pagar = satu bab. Dua pagar = sub-judul di dalam bab.",
        }}
      />
      <Latihan
        soal="Tulis kerangka bab pertamamu: satu judul bab, satu sub-judul, satu tokoh berkurung kurawal, dan satu kuis."
        contoh={`# Bab Satu: Pintu yang Berdebu

## Ruang tunggu

{Nona Wilhelmina} duduk paling ujung.

@?? Siapa yang duduk paling ujung? | Nona Wilhelmina* | Penjaga | Tamu`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Buka Studio
        </Link>
        <Link to="/impor" className="tut-btn">
          Impor berkas .md
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI II ================= */
function EdisiUnduh() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Edisi kedua membahas dua kunci: <b>Eksklusif</b> — mengunci bab demi bab
        untuk anggota — dan <b>Boleh diunduh</b> — mengizinkan pembaca langganan
        membawa buku Saudara pulang sebagai PDF bergaya. Keduanya hanya berada
        di tangan penulis pemegang{" "}
        <Link to="/premium" className="tut-link">
          Sela Plus
        </Link>{" "}
        atau Sela Ekstra; itulah bentuk hormat kami kepada mereka yang menopang
        percetakan ini.
      </p>
      <h3 className="tut-h3">I. Menandai buku sebagai Eksklusif</h3>
      <p className="tut-par">
        Buka draft di Studio → centang <b>Eksklusif</b> → Publish. Akibatnya:
        <b> Bab 1 tetap terbuka bagi semua orang</b> sebagai percobaan rasa;
        <b> Bab 2 dan seterusnya terkunci</b> bagi non-anggota. Pembaca yang
        menghampiri pintu itu disambut gerbang yang menoleh ke{" "}
        <Link to="/premium" className="tut-link">
          halaman langganan
        </Link>{" "}
        — bukan dipermalukan, hanya diundang.
      </p>
      <Anotasi>
        Bab pertama yang terbuka adalah undangan; bab kedua yang terkunci adalah
        pintu.
      </Anotasi>
      <h3 className="tut-h3">II. Mengizinkan buku diunduh</h3>
      <p className="tut-par">
        Di tempat yang sama, centang <b>Boleh diunduh</b> → Publish. Halaman
        buku menampilkan tanda <i>“Bisa diunduh (Pro)”</i>, dan tombol{" "}
        <b>Unduh PDF</b> hanya tampak bagi pemegang <b>Sela Pro / Ekstra</b>.
        Izin ini <i>per buku</i>, diputuskan penulisnya. Buku lama tetap
        terkunci unduhannya sampai draftnya dicentang dan Publish kembali — buku
        yang sama diperbarui, bukan digandakan.
      </p>
      <Tabel
        head={["Siapa", "Membaca Bab 2+", "Mengunduh PDF"]}
        rows={[
          ["Tamu", "Bab 1 saja", "Tidak"],
          ["Akun gratis — buku biasa", "Bisa", "Tidak"],
          ["Akun gratis — buku eksklusif", "Bab 1 saja", "Tidak"],
          ["Sela Pro — buku tanpa izin", "Bisa", "Tidak"],
          ["Sela Pro — buku diizinkan", "Bisa", "Bisa"],
          ["Penulis Plus/Ekstra (bukunya sendiri)", "Bisa", "Bisa"],
          ["Admin", "Semua", "Semua"],
        ]}
      />
      <h3 className="tut-h3">III. Pengalaman pembaca yang mengunduh</h3>
      <ol className="tut-langkah">
        <li>
          Buka halaman buku → tombol <b>Unduh PDF</b>.
        </li>
        <li>Tab baru menampilkan buku utuh — periksa sejenak apakah pantas.</li>
        <li>
          Di dialog cetak: Tujuan → <b>Simpan sebagai PDF</b> → Simpan.
        </li>
      </ol>
      <h3 className="tut-h3">IV. Kapan eksklusif, kapan terbuka?</h3>
      <p className="tut-par">
        Buku <i>pertama</i> sebaiknya terbuka penuh — kartu nama yang dibagikan
        ke mana-mana. Eksklusif adalah pakaian buku kedua dan seterusnya. Izin
        unduh paling berharga untuk buku pelajaran, panduan, dan kumpulan —
        benda yang pembaca ingin miliki, bukan sekadar dibaca sekali.
      </p>
      <Kuis
        soal={{
          q: "Pembaca Sela Pro menemui bukumu yang TIDAK dicentang “Boleh diunduh”. Apa yang ia lihat?",
          o: [
            "Tombol Unduh PDF, tapi berkasnya kosong",
            "Tidak ada tombol Unduh PDF sama sekali",
            "Tombol yang beralih ke halaman langganan",
          ],
          a: 1,
          jel: "Tanpa izin penulis, tombol tidak pernah tampil — izin adalah hak penulis.",
        }}
      />
      <Kuis
        soal={{
          q: "Bab mana yang tetap terbuka pada buku Eksklusif?",
          o: ["Tidak ada", "Bab terakhir", "Bab pertama"],
          a: 2,
          jel: "Bab 1 adalah percobaan rasa; pintu terkunci mulai bab 2.",
        }}
      />
      <Latihan
        soal="Rancang strategi bukumu: mana yang terbuka, eksklusif, boleh diunduh — dan alasannya dalam tiga kalimat."
        contoh={`Buku 1 (terbuka penuh): kartu nama.
Buku 2 (eksklusif): bab 1 gratis, sisanya anggota.
Buku 3 (pelajaran + boleh diunduh): pembaca Pro membawanya pulang.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Atur di Studio
        </Link>
        <Link to="/premium" className="tut-btn">
          Lihat Sela Plus
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI III ================= */
function EdisiCerita() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Tanda tangan sudah Saudara kuasai; kini bagian yang tak tertulis di
        kamus mana pun — <b>melihat pembaca enggan berhenti membaca</b>. Kami
        menyaring kebiasaan para penulis yang karyanya paling lama disimak
        menjadi tujuh kebiasaan yang dapat dipelajari. Bukan bakat: kebiasaan.
        Itu kabar baik — kebiasaan dapat dilatih, malam demi malam, halaman demi
        halaman.
      </p>
      <h3 className="tut-h3">I. Kalimat pertama adalah penjaga gerbang</h3>
      <p className="tut-par">
        Pembaca memberimu sepuluh detik. Kalimat pembuka harus: mengajukan
        pertanyaan yang mengganjal, memperkenalkan suara yang khas, atau
        menempatkan pembaca di tengah peristiwa. Hindari: hujan yang baru turun,
        tokoh yang baru bangun, sejarah keluarga tiga paragraf.
      </p>
      <h3 className="tut-h3">II. Buat pembaca mengenal siapa saja</h3>
      <p className="tut-par">
        Tokoh adalah tangan yang dipegang pembaca di dalam gelap. Kurung kurawal
        pada nama, jaga kemunculannya. Aturan praktis: bab pertama,
        <b> maksimal tiga tokoh bernama</b> — saat pembaca harus mencatat nama,
        cerita sudah kalah.
      </p>
      <h3 className="tut-h3">III. Satu bab, satu perubahan</h3>
      <p className="tut-par">
        Bab yang baik adalah mesin kecil: masuk keadaan A, keluar keadaan B —
        informasi terungkap, keputusan diambil, hubungan retak, harapan padam.
        Bila tidak ada yang berubah, bab itu bukan bab; ia jeda. Jeda boleh,
        tetapi tidak tiga bab berturut — pembaca yang menemukan jeda berturut
        akan menutup buku dan tidak kembali.
      </p>
      <Anotasi>
        Ujian sederhana: tutup naskah, jawab — “apa yang pembaca ketahui
        SEKARANG yang belum ia ketahui di awal bab?” Bila “tidak ada”, revisi.
      </Anotasi>
      <h3 className="tut-h3">IV. Pintu setengah terbuka</h3>
      <p className="tut-par">
        Akhiri bab dengan satu pertanyaan yang belum terjawab — telepon pukul
        tiga pagi, nama yang ditulis dengan darah, surat dari orang yang sudah
        meninggal tujuh tahun. Yang penting bukan besarnya kejadian, tetapi
        <b> janji bahwa bab berikutnya menjawabnya</b> — dan janji harus
        ditepati.
      </p>
      <h3 className="tut-h3">
        V–VII. Kuis cermin, linimasa, pendek yang pantas
      </h3>
      <p className="tut-par">
        Kuis <span className="tut-mono">@??</span> menegaskan perasaan pembaca:{" "}
        <i>“Saya benar-benar paham.”</i> Linimasa{" "}
        <span className="tut-mono">@tl</span> memetakan waktu panjang. Bab enam
        sampai dua belas menit, ditutup ringkasan{" "}
        <span className="tut-mono">%%</span>, memberi titik rehat yang
        memuaskan. Dua puluh bab pendek selalu mengalahkan lima bab gembong
        dalam hal yang paling penting: <b>diselesaikan</b>.
      </p>
      <Kuis
        soal={{
          q: "Selesai menulis sebuah bab, penulis harus dapat menjawab pertanyaan apa?",
          o: [
            "Berapa kata yang telah ditulis",
            "Apa yang berubah bagi pembaca di bab itu",
            "Genre apa yang paling laris",
          ],
          a: 1,
          jel: "Satu bab = satu perubahan. Bila tak ada yang berubah, bab itu jeda — dan jeda tak boleh berturut.",
        }}
      />
      <Latihan
        soal="Tulis kalimat pembuka bukumu: pertanyaan mengganjal, suara khas, atau di tengah peristiwa. Hindari hujan, bangun tidur, sejarah keluarga."
        contoh={`“Kau pernah mencium sesuatu yang belum terjadi?” tanya penjual
karcis itu, tanpa mengangkat wajah dari mesin tiknya.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Mulai menulis
        </Link>
        <Link to="/jelajah" className="tut-btn">
          Pelajari buku pembaca lain
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI IV ================= */
const PAKET = [
  {
    nama: "Sela Plus",
    siapa: "Bagi Penulis",
    harga: "Rp15.000 / bulan",
    isi: [
      "Buku tanpa batas (gratis: 3 buku)",
      "Tanda penulis terverifikasi",
      "Boleh mengizinkan buku diunduh",
      "Cerita eksklusif Plus",
      "Utamakan tampil di Jelajah",
    ],
  },
  {
    nama: "Sela Pro",
    siapa: "Bagi Pembaca",
    harga: "Rp10.000 / bulan",
    isi: [
      "Tema eksklusif Midnight & Forest",
      "Mengunduh buku yang diizinkan",
      "Ekspor catatan ke PDF",
      "Statistik bacaan lanjutan",
      "Cerita eksklusif Plus",
    ],
  },
  {
    nama: "Sela Ekstra",
    siapa: "Plus + Pro",
    harga: "Rp20.000 / bulan",
    isi: [
      "Seluruh hak Sela Plus",
      "Seluruh hak Sela Pro",
      "Lebih murah daripada beli keduanya",
    ],
  },
];
function EdisiLangganan() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Sela tetaplah gratis untuk membaca — janji itu tidak pernah berubah.
        Namun bagi penulis yang serius dan pembaca yang haus, kami menyediakan
        tiga langganan: <b>Plus</b>, <b>Pro</b>, dan <b>Ekstra</b> — yang
        terakhir lebih murah daripada membeli keduanya terpisah. Diaktifkan oleh
        tangan manusia, bukan mesin; tidak ada kartu kredit yang disimpan, tidak
        ada langganan yang menyelinap memperpanjang dirinya di tengah malam.
      </p>
      <div className="tut-kartu-row">
        {PAKET.map((p) => (
          <div key={p.nama} className="tut-kartu">
            <p className="tut-kartu-nama">{p.nama}</p>
            <p className="tut-kartu-siapa">{p.siapa}</p>
            <p className="tut-kartu-harga">{p.harga}</p>
            <ul className="tut-daftar">
              {p.isi.map((x) => (
                <li key={x}>— {x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h3 className="tut-h3">Tata cara, empat pintu</h3>
      <ol className="tut-langkah">
        <li>
          Kunjungi{" "}
          <Link to="/premium" className="tut-link">
            halaman Anggota Sela
          </Link>{" "}
          — tekan tombol berlangganan.
        </li>
        <li>Transfer sesuai paket, bulanan atau tahunan.</li>
        <li>
          Kirim bukti transfer + <b>email akun Sela</b> — hak melekat pada akun,
          bukan perangkat.
        </li>
        <li>
          Admin mengaktifkan, selambatnya sehari. Muat ulang → seluruh hak
          terbuka.
        </li>
      </ol>
      <Anotasi>
        Langganan berhenti sendiri saat jangka waktu habis — tanpa tagihan
        kejut. Memperpanjang sama mudahnya dengan memberi kabar.
      </Anotasi>
      <Kuis
        soal={{
          q: "Penulis ingin membukunya bisa diunduh pembaca Pro. Paket minimum?",
          o: ["Sela Pro", "Sela Plus", "Tidak perlu langganan"],
          a: 1,
          jel: "Izin unduh adalah hak penulis — ada di Sela Plus atau Ekstra.",
        }}
      />
      <div className="tut-aksi">
        <Link to="/premium" className="tut-btn tut-btn-utama">
          Halaman Anggota Sela
        </Link>
        <Link to="/studio" className="tut-btn">
          Coba Studio dulu
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI V ================= */
function EdisiFantasi() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Fantasi menuntut satu hal yang tak diminta genre lain:{" "}
        <b>dunia yang berdiri sendiri</b>. Pembaca memaafkan naskah yang kasar,
        tetapi tidak pernah memaafkan aturan dunia yang berubah-ubah. Edisi
        kelima ini lembar petunjuk membangun dunia yang punya hukum, luka, dan
        sejarah lebih tua daripada tokohnya.
      </p>
      <h3 className="tut-h3">I. Aturan dunia harus punya harga</h3>
      <p className="tut-par">
        Tentukan sekali apa yang <i>tidak bisa</i> dilakukan kekuatan itu:
        harganya, batasnya, penyebab kegagalannya. Justru batas membuat
        kemenangan terasa diperjuangkan. Pembaca fantasi adalah spesialis
        penghitung aturan — mereka memaafkan gaya yang kasar, tidak pernah
        memaafkan sihir yang tiba-tiba bisa melakukan hal yang dua bab lalu
        dinyatakan mustahil.
      </p>
      <Anotasi>
        Kalimat “karena begitulah aturannya” adalah tanda bahaya. Aturan yang
        tak bisa dijelaskan berarti belum selesai dirancang.
      </Anotasi>
      <h3 className="tut-h3">II. Istilah dunia → Glosarium</h3>
      <p className="tut-par">
        Nama kerajaan, ras, mata uang, gelar — daftarkan di{" "}
        <Link to="/glosarium" className="tut-link">
          Glosarium
        </Link>
        . Setiap kemunculan jadi bisa diketuk: naskah tetap mengalir, kamus
        menanggung beban penjelasan. Inilah cara fantasi kelas kakap
        memperkenalkan dunia — perlahan, lewat konteks, kamus di ujung jari.
      </p>
      <Kode>{`Di pasar Melati Abu, {Seraphine} menukar tiga koin perak
untuk seikat rumput bulan.

@?? Apa yang dibeli Seraphine? | Pedang | Rumput bulan* | Peta`}</Kode>
      <h3 className="tut-h3">III–V. Tokoh, sejarah dunia, mode Imersi</h3>
      <p className="tut-par">
        Kurung kurawal untuk semua nama penting; pilih satu ejaan dan patuhi
        sampai halaman terakhir. Sejarah dunia ditulis lewat{" "}
        <span className="tut-mono">@tl</span> di prolog — pembaca fantasi
        menikmati gulungan sejarah yang menyala. Dan pilih genre Fiksi agar
        pembaca menerima Imersi: antarmuka menepi, yang tersisa hanyalah duniamu
        dan pembacanya.
      </p>
      <Kuis
        soal={{
          q: "Apa kesalahan paling fatal dalam menulis fantasi?",
          o: [
            "Naskah yang kasar",
            "Aturan dunia yang berubah-ubah",
            "Terlalu banyak tokoh",
          ],
          a: 1,
          jel: "Pembaca memaafkan gaya, tidak memaafkan aturan yang dilanggar pembuatnya sendiri.",
        }}
      />
      <Latihan
        soal="Tulis TIGA aturan kekuatan duniamu — masing-masing dengan harganya."
        contoh={`1. Sihir memotong umur: satu jam per mantra kecil, satu hari per mantra besar.
2. Pintu antar-dunia hanya terbuka saat hujan.
3. Naga tidak bisa berbohong — karena itu mereka jarang bicara.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Bangun duniamu
        </Link>
        <Link to="/glosarium" className="tut-btn">
          Daftarkan istilah dunia
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI VI ================= */
function EdisiAksi() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Adegan aksi ditulis dengan kaki, bukan dengan mata: denyut napas,
        langkah tergesah, waktu yang menyusut. Edisi keenam ini tentang
        menggulirkan detik-detik paling cepat dalam cerita tanpa kehilangan
        pembaca di tengah jalan.
      </p>
      <h3 className="tut-h3">I. Kalimat pendek. Seperti pukulan.</h3>
      <p className="tut-par">
        Saat kejar-kejaran dimulai, pangkas kata — tubuh pembaca berdetak
        mengikuti panjang kalimat yang ia baca. Paragraf dua baris adalah teman
        terbaik duel; satu kata yang berdiri sendiri adalah pukulan terakhir.
      </p>
      <Kode>{`Pedang itu turun.

{Beeman} melompat. Terlambat. Kain lengannya robek —
dan garis merah muncul di bawahnya.

Tidak ada waktu untuk rasa sakit.`}</Kode>
      <h3 className="tut-h3">II. Lima indera, bukan lima penjelasan</h3>
      <p className="tut-par">
        Pembaca butuh <i>merasakan</i>, bukan <i>mengerti</i>: bau besi
        berkarat, dengung telinga, tanah dingin di punggung. Satu indera per
        paragraf — penjelasan panjang di tengah duel sama saja meminta dua
        petarung berhenti mendiskusikan mekanik pukulan.
      </p>
      <h3 className="tut-h3">III. Kuis SETELAH badai</h3>
      <p className="tut-par">
        <span className="tut-mono">@??</span> di tengah duel memutus napas.
        Letakkan di akhir — pertanyaan tentang detail yang baru terjadi membuat
        pembaca bangga dan menyimpan ketegangan lebih lama.
      </p>
      <h3 className="tut-h3">IV–V. Jeda napas & luka yang mahal</h3>
      <p className="tut-par">
        Aksi beruntun tanpa jeda membuat pembaca kebal — gong yang dibunyikan
        terus-menerus. Setelah badai, beri satu paragraf tenang. Dan biarkan ada
        yang hilang: pisau patah, teman yang tertidur selamanya. Tokoh yang
        selalu selamat tanpa cacat membuat pembaca berhenti cemas — dan cemas
        adalah bahan bakar utama genre ini.
      </p>
      <Anotasi>
        Satu adegan aksi idealnya terbaca dalam satu tarikan napas — bila
        pembaca sempat berhenti menggulir, tempo sudah patah.
      </Anotasi>
      <Kuis
        soal={{
          q: "Di mana kuis @?? ditempatkan dalam adegan aksi?",
          o: [
            "Tengah duel, agar pembaca waspada",
            "Sebelum duel dimulai",
            "Setelah badai reda",
          ],
          a: 2,
          jel: "Kuis di tengah aksi memutus napas; setelahnya ia hadiah perhatian.",
        }}
      />
      <Latihan
        soal="Tulis adegan kejar-kejaran 8 baris, kalimat maksimal 8 kata."
        contoh={`Lampu mati. Semua.

{Beeman} berhenti. Mendengarkan. Langkah kaki —
bukan miliknya. Dari arah tangga.

Ia menjatuhkan cangkir. Tidak mendengarnya pecah.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Tulis adegan pertama
        </Link>
        <Link to="/tutorial" className="tut-btn">
          Daftar edisi
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI VII ================= */
function EdisiMisteri() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Misteri adalah permainan antara penulis dan pembaca — dan ia hanya adil
        bila peraturannya jujur. Tidak ada penghormatan lebih tinggi daripada
        pembaca yang kalah tebak <i>secara adil</i>; tidak ada penghinaan lebih
        dalam daripada jawaban yang mustahil ditebak. Edisi ketujuh: menipu
        pembaca dengan terhormat.
      </p>
      <h3 className="tut-h3">I. Tulis dengan mundur</h3>
      <p className="tut-par">
        Tentukan <b>pelakunya lebih dahulu</b>, lengkap dengan motif dan
        caranya, lalu mundur dan selipkan jejaknya di depan — samar, di antara
        hal-hal lain, disebut sekali tanpa komentar. Pembaca teliti harus bisa
        merekonstruksi kebenaran; pembaca santai harus bisa terkejut. Keduanya
        menang — itulah misteri yang adil.
      </p>
      <Anotasi>
        Ujian penghormatan: saat kebenaran terungkap, pembaca harus bisa berkata
        “petunjuknya ada di Bab Dua!” — bukan “dari mana datangnya?”.
      </Anotasi>
      <h3 className="tut-h3">II. Kuis @?? adalah alat terbaik misteri</h3>
      <p className="tut-par">
        Setiap akhir bab, minta pembaca <b>menebak</b>: siapa pelakunya, mana
        alibi yang bohong. Dua pengecoh hampir masuk akal, satu jebakan yang
        lucu, satu jawaban tersembunyi rapi.
      </p>
      <Kode>{`@?? Siapa yang terakhir melihat Walsh hidup? |
The Fire | Bartender | Nona Ruiz*`}</Kode>
      <h3 className="tut-h3">III–V. Suspek, catatan detektif, tipu muslihat</h3>
      <p className="tut-par">
        Tiga sampai lima tersangka, muncul sebelum bab ketiga, masing-masing
        punya motif dan satu rahasia. <span className="tut-mono">%%</span> di
        akhir bab = buku catatan detektif — pembaca yang tertinggal bisa kembali
        berlaga. <i>Red herring</i> boleh, tetapi harus punya penjelasan di
        akhir: pintu yang tak pernah dibuka lagi bukan tipu muslihat, itu utang
        yang tak dibayar.
      </p>
      <Kuis
        soal={{
          q: "Kapan penulis misteri menentukan siapa pelakunya?",
          o: [
            "Sebelum menulis — lalu mundur dan menabur jejak",
            "Di bab terakhir",
            "Ketika pembaca mulai menebak",
          ],
          a: 0,
          jel: "Misteri ditulis mundur: pelaku dulu, jejak diselipkan di depan.",
        }}
      />
      <Latihan
        soal="Rancang satu kasus: kejadian, tiga tersangka (satu rahasia masing-masing), dan SATU petunjuk fisik yang hanya dimengerti di akhir."
        contoh={`Kejadian: jam kakek menghilang malam ulang tahun.
Tersangka: perawat, keponakan berutang, tukang jam tanpa undangan.
Petunjuk: bunga telang di atas rak — padahal tak ada bunga di rumah itu.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Susun teka-teki
        </Link>
        <Link to="/jelajah" className="tut-btn">
          Baca misteri orang lain
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI VIII ================= */
function EdisiRomansa() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Romansa bukan tentang ciuman — ia tentang <b>jarak</b>. Jarak yang
        menyusut sedikit demi sedikit, lalu melebar lagi saat pembaca baru
        melonggarkan bahunya; itulah mesin yang membuat mereka menahan guliran
        di pukul dua pagi. Edisi kedelapan: mengukur jarak itu dengan tangan
        yang tidak gemetar.
      </p>
      <h3 className="tut-h3">I. Keintiman bertingkat</h3>
      <p className="tut-par">
        Pandangan pertama → percakapan tak terduga → rahasia kecil → sentuhan
        tak sengaja → keraguan → pengakuan. Setiap anak tangga diperjuangkan;
        jangan turun dua anak sekaligus, dan jangan menuruni seluruh tangga
        dalam satu bab. Pembaca romansa menikmati anak tangga, bukan hanya
        tujuan.
      </p>
      <h3 className="tut-h3">II. Dialog adalah percikan api</h3>
      <p className="tut-par">
        Tulis percakapan yang dua tokohnya sama-sama pintar, sama-sama menahan
        diri, sama-sama tergelincir. Yang paling jujur justru yang terucap
        setengah napas — kutipan <span className="tut-mono">&gt;</span> persis
        untuk itu: kalimat yang diucapkan sambil memalingkan wajah.
      </p>
      <Kode>{`“Kau selalu begini?” tanyanya.

> Diam lebih lama dari jawaban yang ia berikan.

@?? Apa yang belum Nona Ruiz katakan? |
Ia takut | Ia marah | Ia bahagia*`}</Kode>
      <h3 className="tut-h3">III–IV. Kuis perasaan & penghalang yang pantas</h3>
      <p className="tut-par">
        Kuis romansa menanyakan <i>isi hat</i>: apa yang tak diucapkan, arti
        senyum di bab tiga. Penghalang cinta harus lahir dari karakter —
        ketakutan lama, kesetiaan pada yang sudah tiada. Pemisahan bab ketiga
        memang klise, tetapi tetap menangis bila alasannya lahir dari ketakutan
        tokoh — bukan salah paham murahan yang selesai dengan satu pesan
        singkat.
      </p>
      <Anotasi>
        Uji redaksi: bila satu bab dihapus dan kisah cintanya tetap berjalan,
        bab itu tidak dibutuhkan — cinta yang nyata butuh setiap pertemuan.
      </Anotasi>
      <Kuis
        soal={{
          q: "Apa yang membuat “pemisahan bab ketiga” tetap berhasil meski klise?",
          o: [
            "Ditulis makin panjang",
            "Alasannya lahir dari ketakutan tokoh",
            "Ditambah tokoh ketiga",
          ],
          a: 1,
          jel: "Pemisahan dari karakter menyakitkan dengan benar; salah paham murahan membuat pembaca marah.",
        }}
      />
      <Latihan
        soal="Dua tokoh saling menyukai tapi TIDAK boleh mengatakannya — murni dialog, tanpa narasi perasaan."
        contoh={`“Kopimu.” Ia menyodorkan cangkir, tanpa menoleh.
“Terima kasih.”
“Sudah kuberi gula. Dua sendok.”
“Aku tidak suka manis.”
“Ia tahu.”`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Mulai kisahmu
        </Link>
        <Link to="/jelajah" className="tut-btn">
          Cari kisah serupa
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI IX ================= */
function EdisiGlosarium() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Glosarium Sela adalah kamus yang ditulis bersama-sama — dan fiturnya
        paling licin:{" "}
        <b>kata yang terdaftar otomatis bisa diketuk di mana pun ia muncul</b>,
        di buku siapa pun, tanpa satu tanda pun di naskah. Penulis tidak
        menghias naskah; kamus yang menghias naskah itu sendiri.
      </p>
      <h3 className="tut-h3">I. Tiga langkah saja</h3>
      <ol className="tut-langkah">
        <li>
          Buka{" "}
          <Link to="/glosarium" className="tut-link">
            halaman Glosarium
          </Link>{" "}
          — masuk dulu agar kontribusi tercatat atas namamu.
        </li>
        <li>
          Isi <b>kata</b> dan <b>artinya</b>, tekan Tambah. Besar-kecil huruf
          tidak dipermasalahkan.
        </li>
        <li>Selesai — kata itu kini bisa diketuk di pembaca mana pun.</li>
      </ol>
      <h3 className="tut-h3">II. Kata yang layak didaftarkan</h3>
      <Tabel
        head={["Cocok", "Sebaiknya dilewati"]}
        rows={[
          [
            "Istilah fantasi (sihir, ras, mata uang)",
            "Kata sehari-hari yang sudah dipahami",
          ],
          [
            "Jargon sejarah (kudeta, KMB)",
            "Nama tokoh — gunakan {kurung kurawal}",
          ],
          [
            "Istilah pelajaran (fotosintesis)",
            "Kata yang sudah dijelaskan di naskah",
          ],
          [
            "Bahasa daerah / kuno dalam ceritamu",
            "Kata yang membocorkan teka-teki plot",
          ],
        ]}
      />
      <h3 className="tut-h3">III–IV. Detail kecil & pasangan fantasi</h3>
      <p className="tut-par">
        Akhiran umum otomatis: “kudetanya”, “kudetakah” tetap terdeteksi bila
        “kudeta” terdaftar. Admin dapat menjaga kualitas kamus. Dan bagi penulis
        fantasi, glosarium adalah perpustakaan dunia — Edisi Kelima telah
        menunggu pertemuan ini; kini keduanya resmi diperkenalkan.
      </p>
      <Kuis
        soal={{
          q: "Kata “kudeta” terdaftar. Mana yang TIDAK otomatis terdeteksi?",
          o: ["kudetanya", "kudetakah", "Kudeta (huruf kapital)"],
          a: 2,
          jel: "Besar-kecil diabaikan — justru ketiganya terdeteksi. Akhiran umum pun otomatis.",
        }}
      />
      <Latihan
        soal="Pilih 3 kata dari naskahmu yang layak masuk glosarium, tulis artinya satu kalimat."
        contoh={`Melati Abu — pasar malam para penyelundup di pelabuhan tua.
Rumput bulan — tumbuhan laut yang bercahaya saat ditekuk.
Koin perak — mata uang resmi Kerajaan Sela.`}
      />
      <div className="tut-aksi">
        <Link to="/glosarium" className="tut-btn tut-btn-utama">
          Tambah istilah pertama
        </Link>
        <Link to="/tutorial" className="tut-btn">
          Daftar edisi
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI X ================= */
function EdisiAlfabet() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Edisi penutup: kamus seluruh fitur Sela, menurut abjad — dari Anugerah
        hingga Zoom — lengkap dengan tempat menemukannya. Saat pembaca bertanya
        “Sela bisa apa saja?”, jawablah dengan halaman ini.
      </p>
      <Tabel
        head={["Huruf", "Fitur", "Temukan di"]}
        rows={[
          [
            "A",
            "Anugerah Pembaca — podium tiga buku terbaca",
            "Pembuka situs, tiap sesi",
          ],
          [
            "B",
            "Badge: penulis terverifikasi & pendukung Pro",
            "Avatar & halaman penulis",
          ],
          ["C", "Catatan: kanvas kotak, sticky, panah, pena", "Menu Catatan"],
          ["D", "Draft tersinkron — tulis di HP, lanjut di laptop", "Studio"],
          [
            "E",
            "Eksklusif: bab 2+ terkunci untuk anggota",
            "Studio → centang Eksklusif",
          ],
          [
            "F",
            "Fokus: mode pelajaran dengan kuis & ringkasan",
            "Genre Pelajaran",
          ],
          ["G", "Glosarium bersama — kata diketuk di naskah", "Menu Glosarium"],
          [
            "H",
            "Highlight paragraf → jadi flashcard",
            "Ketuk kata saat membaca",
          ],
          ["I", "Impor naskah .md, bab terdeteksi otomatis", "Menu Impor"],
          ["J", "Jelajah: filter genre, mode, urutan & cari", "Menu Jelajah"],
          ["K", "Kuis @?? — banyak soal per bab", "Studio"],
          ["L", "Linimasa @tl menyala mengikuti gulir", "Genre Sejarah"],
          ["M", "Minimap: gulir cepat sepanjang bab", "Sisi kanan reader"],
          ["N", "Navigasi cepat buku-bab-halaman", "Tekan ⌘K / Ctrl+K"],
          ["O", "Otomatis tersimpan: draft, catatan, progres", "Semua halaman"],
          [
            "P",
            "Progres baca, Prioritas katalog, Podium",
            "Reader, Jelajah, Beranda",
          ],
          ["R", "Rak saya: sedang dibaca, selesai, disimpan", "Menu Rak saya"],
          ["S", "Studio: menulis dengan pratinjau langsung", "Menu Studio"],
          [
            "T",
            "Tema: Terang, Sepia, Gelap, Midnight, Forest",
            "Aa saat membaca / Pengaturan",
          ],
          [
            "U",
            "Unduh PDF — buku yang diizinkan penulis",
            "Halaman buku (Pro)",
          ],
          ["V", "Voting: bintang & ulasan pembaca", "Halaman buku"],
          [
            "W",
            "Waktu baca: harian, per buku, per jam",
            "Statistik (lanjutan: Pro)",
          ],
          ["Z", "Zoom kanvas catatan 15%–400%", "Kanan bawah Catatan"],
        ]}
      />
      <Anotasi>
        Huruf Q, X, dan Y masih menunggu penghuninya. Bila Saudara punya gagasan
        yang pantas menduduki tiga huruf itu — meja redaksi kami terbuka setiap
        hari.
      </Anotasi>
      <Kuis
        soal={{
          q: "Penulis ingin bukunya hanya bisa diunduh pembaca Pro. Ia perlu…",
          o: [
            "Sela Plus/Ekstra + centang “Boleh diunduh”",
            "Mempublikasikan di genre Pelajaran",
            "Meminta pembaca menyalin manual",
          ],
          a: 0,
          jel: "Izin unduh milik penulis premium; tombol unduh milik pembaca Pro.",
        }}
      />
      <div className="tut-aksi">
        <Link to="/jelajah" className="tut-btn tut-btn-utama">
          Mulai menjelajah
        </Link>
        <Link to="/premium" className="tut-btn">
          Buka semua fitur
        </Link>
      </div>
    </>
  );
}

/* ================= EDISI XI — FANTASI LENGKAP ================= */
function EdisiFantasiLengkap() {
  return (
    <>
      <p className="tut-lead tut-dropcap">
        Edisi khusus ini — paling tebal yang pernah kami terbitkan — memuat
        <b> jalan penuh dari nol hingga mahir</b> menulis cerita fantasi:
        delapan bagian, dari memahami genre, membangun dunia, menghidupkan
        tokoh, merangkai plot, mengasah craft, hingga revisi dan peta jalan
        delapan bulan. Kertasnya panjang; bacalah bertahap, satu bagian per
        duduk.
      </p>

      <h3 className="tut-h3">BAGIAN 1 — Memahami genre (fondasi)</h3>
      <p className="tut-par">
        Fantasi adalah genre yang memuat elemen mustahil secara sadar — sihir,
        makhluk mitos, dunia lain — dan menjadikannya nyata dalam logika cerita.
        Kuncinya: fantasi bukan <i>bebas asal-asalan</i>, melainkan
        <b> mustahil yang konsisten</b>. Pilih arena-mu sebelum menulis:
      </p>
      <Tabel
        head={["Sub-Genre", "Ciri", "Contoh"]}
        rows={[
          ["High Fantasy", "Dunia lain sepenuhnya", "Lord of the Rings"],
          ["Low Fantasy", "Sihir masuk ke dunia nyata", "Harry Potter"],
          ["Urban Fantasy", "Fantasi di kota modern", "Percy Jackson"],
          ["Dark Fantasy", "Fantasi gelap, kejam", "Berserk, The Witcher"],
          ["Portal Fantasy", "Karakter masuk ke dunia lain", "Narnia"],
          [
            "Fantasi Lokal",
            "Berakar mitologi Nusantara",
            "Wayang, kuntilanak, kanjeng kyai",
          ],
        ]}
      />
      <Anotasi>
        Tips khas Indonesia: cerita fantasi berakar mitologi lokal — Jawa,
        Sunda, Minang, Dayak — punya pasar dan keunikan tersendiri. Ini bisa
        jadi pembeda kamu dari penulis lain.
      </Anotasi>

      <h3 className="tut-h3">BAGIAN 2 — Worldbuilding: membangun dunia</h3>
      <p className="tut-par">
        Ini fondasi terbesar fantasi; dunia yang kuat membuat pembaca percaya.
      </p>
      <p className="tut-par">
        <b>2.1 Sistem sihir.</b> Tanya: apa sumber kekuatannya (mana, doa,
        kontrak, darah, alam)? Siapa yang bisa menggunakannya? Apa batasnya —
        <b> paling penting</b>? Apa harganya (energi, umur, ingatan, nyawa)?
        Bisakah rusak atau dikorupsi? Dua pendekatan klasik: <b>Sihir Keras</b>{" "}
        — aturan jelas, pembaca paham mekanismenya, cocok untuk cerita yang
        mengandalkan kecerdikan (Fullmetal Alchemist: equivalent exchange); dan{" "}
        <b>Sihir Lunak</b> — misterius, tak dijelaskan penuh, cocok untuk nuansa
        takjub (sihir Gandalf).
      </p>
      <Anotasi>
        Aturan emas: sihir tanpa batas = konflik mati. Kalau penyihir bisa apa
        saja, mengapa tidak selesaikan semua masalah dengan sihir? Batasan
        melahirkan kreativitas.
      </Anotasi>
      <p className="tut-par">
        <b>2.2 Geografi.</b> Bentang alam, iklim (memengaruhi pakaian, makanan,
        arsitektur), dan peta sketsa sederhana untuk konsistensi.
        <b> 2.3 Sejarah & mitologi.</b> Perang besar apa yang pernah terjadi?
        Kepercayaan apa yang dianut? Legenda apa yang orang percayai? Rahasia:
        adakah sejarah yang tersembunyi atau salah diketahui orang? Itu bahan
        konflik terbaik. <b>2.4 Masyarakat & politik.</b> Siapa berkuasa? Kasta?
        Hubungan antar ras? Ekonomi: dari mana uang, apa komoditas utamanya?{" "}
        <b>2.5 Bahasa & penamaan.</b> Buat pola konsisten per wilayah/ras
        (kerajaan timur selalu berakhir -an, barat diawali “Ka-”); jangan
        berlebihan membuat bahasa fiktif; hindari nama bertanda baca berlebihan
        (X'aerth'yion) yang menyulitkan pembaca.
      </p>
      <Anotasi>
        <b>Prinsip gunung es:</b> rancang dunia 100%, tampilkan hanya 10–20%.
        Pembaca merasakan kedalaman tanpa dicermahi.
      </Anotasi>

      <h3 className="tut-h3">BAGIAN 3 — Membangun karakter</h3>
      <p className="tut-par">
        Dunia hebat tanpa karakter yang hidup = cerita membosankan. Pembaca
        mengikuti orang, bukan peta.
      </p>
      <p className="tut-par">
        <b>3.1 Protagonis.</b> Isi lembar identitas: <b>Keinginan</b> (apa yang
        dikejar), <b>Kebutuhan</b> (apa yang sebenarnya dibutuhkan secara
        batin), <b>Kelemahan</b> (yang menghambat), <b>Ketakutan</b> (yang
        paling dihindari), dan <b>kebiasaan kecil</b> yang membuatnya manusiawi
        (gugup saat berbohong, menggosok cincin tua).
        <b> 3.2 Arc tokoh:</b> Keadaan awal → Pemicu → Perjuangan → Keterpurukan
        → Realisasi → Keadaan baru. Contoh: pemalas tak percaya diri → dipaksa
        memegang pedang pusaka → gagal berkali-kali → kehilangan mentor →
        menyadari keberanian bukan tanpa rasa takut → pemimpin yang bijak.{" "}
        <b>3.3 Antagonis:</b> yang terbaik percaya dirinya benar; beri motivasi
        yang bisa dipahami, bahkan dikasihani; ia harus menjadi cermin gelap
        protagonis. Bandingkan: <i>“Aku jahat karena aku jahat”</i> — dengan —{" "}
        <i>
          “Aku menyegel sihir semua rakyat karena sihir yang bebas telah
          membunuh putriku.”
        </i>{" "}
        <b>3.4 Pendukung:</b> beri masing-masing satu keinginan dan satu
        rahasia; fungsi kelompok klasik: pemikir, penimbang emosi, pelawak,
        penantang.
      </p>

      <h3 className="tut-h3">BAGIAN 4 — Plot & struktur</h3>
      <p className="tut-par">
        Paling cocok untuk fantasi: <b>Perjalanan Sang Pahlawan</b> — Dunia
        Biasa; Panggilan Petualangan; Penolakan; Bertemu Mentor; Melintasi
        Ambang; Ujian, Sekutu, Musuh; Pendekatan & Kesulitan Terbesar; Momen
        Kegagalan (Dark Night of the Soul); Kelahiran Kembali; Klimaks; Kembali
        dengan Elixir. Kamu boleh memutar urutannya — ini kerangka, bukan
        penjara. Setiap adegan harus punya pertanyaan dramatis:{" "}
        <i>akan berhasilkah dia…?</i> Tanpa pertanyaan, adegan itu filler. Atur
        irama: aksi = kalimat pendek; tenang = ruang untuk karakter;
        naik-turunkan ketegangan seperti gelombang; dan akhiri tiap bab dengan
        pengait — pertanyaan terbuka, ancaman, atau keputusan sulit.
      </p>

      <h3 className="tut-h3">BAGIAN 5 — Teknik penulisan (craft)</h3>
      <p className="tut-par">
        <b>Pembukaan:</b> jangan buka dengan sejarah seribu tahun; buka dengan
        adegan. Contoh:{" "}
        <i>
          “Airi tahu ada yang salah ketika sungai di depan rumahnya mengalir ke
          arah langit.”
        </i>{" "}
        <b>Info-dump</b> adalah kesalahan pemula nomor satu: sampaikan dunia
        lewat aksi dan persepsi; sebut istilah asing tanpa langsung menjelaskan.
        Bandingkan —
        <i>
          {" "}
          “Kerajaan Valdoria didirikan 300 tahun lalu setelah perang saudara…”
        </i>{" "}
        dengan —{" "}
        <i>
          “Rizky membungkuk di hadapan patung raja pertama, seperti semua warga
          Valdoria — kebiasaan yang dihukum mati jika dilupakan.”
        </i>{" "}
        <b>Deskripsi:</b> libatkan lima indra; saring lewat sudut pandang tokoh
        (yang takut melihat hutan berbeda dari pemburu); pilih detail spesifik.{" "}
        <b>Dialog:</b> tiap tokoh punya suara berbeda; setiap dialog punya
        tujuan; raja berbicara beda dengan petani. <b>Prosa:</b> dengarkan
        ritmemu dengan membaca nyaring; dan jangan meniru Tolkien mentah-mentah
        — temukan suaramu.
      </p>

      <h3 className="tut-h3">BAGIAN 6 — Tema & makna</h3>
      <p className="tut-par">
        Fantasi terbaik berbicara tentang pengalaman manusia nyata lewat kiasan:
        Cincin Tolkien → bahaya kekuasaan; Fullmetal Alchemist → harga
        keserakahan dan makna keluarga; fantasi lokal tentang dukun → konflik
        tradisi versus modernitas. Tanya dirimu: bila pembaca lupa plot,
        <b> perasaan atau pelajaran apa yang ingin tetap ia bawa pulang?</b>
      </p>

      <h3 className="tut-h3">
        BAGIAN 7 — Revisi: di sini cerita menjadi bagus
      </h3>
      <p className="tut-par">
        Tulis buruk dulu, revisi jadi hebat. Prosesnya: draf pertama tanpa
        menyunting (biarkan jelek, yang penting selesai); diamkan naskah 1–2
        minggu; revisi struktur (plot bolong? bab tak berfungsi? potong atau
        pindah); revisi karakter (motivasi konsisten? arc selesai?); revisi
        adegan (tiap adegan punya tujuan & konflik?); revisi prosa (kalimat,
        kata, ritme); minta beta reader — dengarkan di mana mereka bosan atau
        bingung; ulangi 3–5 kali bila perlu.
      </p>

      <h3 className="tut-h3">BAGIAN 8 — Jalur menuju mahir</h3>
      <p className="tut-par">
        <b>Latihan rutin:</b> tulis setiap hari (300–500 kata pun cukup —
        konsistensi mengalahkan volume); baca analitis — saat membaca fantasi
        bagus, bedah bagaimana penulis memperkenalkan sihir dan mengatur
        ketegangan; latihan pendek: deskripsikan pasar sihir hanya lewat
        pancaindra tanpa kata “sihir”, tulis adegan dari sudut pandang
        antagonis, buat sistem sihir aneh dalam 200 kata; dan selesaikan cerita
        pendek sebelum novel. <b>Sumber belajar:</b> On Writing (Stephen King);
        esai & video Brandon Sanderson (worldbuilding & sistem sihir terbaik);
        naskah cerpen fantasi dari berbagai budaya.
      </p>
      <p className="tut-par">
        <b>Kesalahan fatal:</b> dunia terlalu mirip Tolkien (elf + kurcaci +
        raja jahat tanpa inovasi); tokoh utama sempurna tanpa kelemahan; sihir{" "}
        <i>deus ex machina</i> tanpa foreshadowing; nama & istilah berlebihan di
        tiga bab pertama; plot “ramalan” yang membuat protagonis pasif; dan —
        yang paling umum — <b>tak pernah selesai</b>: dunia terus dibangun,
        cerita tak pernah ditulis.
      </p>
      <Tabel
        head={["Bulan", "Fokus"]}
        rows={[
          [
            "1",
            "Baca 3–5 karya fantasi, pelajari sub-genre, tentukan ceritamu",
          ],
          ["2", "Worldbuilding: sihir, sejarah, budaya (dokumen referensi)"],
          ["3", "Karakter & outline plot"],
          ["4–6", "Tulis draf pertama tanpa menyunting"],
          ["7", "Revisi bertahap + beta reader"],
          [
            "8+",
            "Ulangi siklus dengan cerita berikutnya, naikkan kompleksitas",
          ],
        ]}
      />
      <Anotasi>
        Prinsip penutup: mahir bukan soal bakat, tapi jumlah putaran latihan
        yang selesai. Cerita pertamamu akan biasa saja. Yang kesepuluh akan
        bagus. Yang kedua puluh akan luar biasa. Mulailah hari ini — satu
        halaman pun cukup.
      </Anotasi>
      <Kuis
        soal={{
          q: "Menurut edisi ini, apa fondasi yang membuat kemenangan tokoh fantasi terasa diperjuangkan?",
          o: [
            "Kekuatan yang semakin besar",
            "Batas dan harga dari kekuatan itu",
            "Ramalan yang tak terelakkan",
          ],
          a: 1,
          jel: "Sihir tanpa batas = konflik mati. Batasan melahirkan kreativitas.",
        }}
      />
      <Latihan
        soal="Buat satu aturan sihir + harganya dalam dua kalimat, lalu satu paragraf yang menampakkan aturan itu lewat AKSI — tanpa menjelaskannya."
        contoh={`Aturan: setiap mantra membutuhkan ingatan sebagai bayaran.

Adegan: Warga menemukan {Sari} duduk di tepi sumur, tak
mengenali nama sendiri. Di tangannya, mayat api masih
berasap — dan desa itu sudah selamat dari banjir.`}
      />
      <div className="tut-aksi">
        <Link to="/studio" className="tut-btn tut-btn-utama">
          Mulai menulis fantasi
        </Link>
        <Link to="/glosarium" className="tut-btn">
          Daftarkan istilah duniamu
        </Link>
      </div>
    </>
  );
}

/* ================= DAFTAR EDISI ================= */
const EDISI = [
  {
    romawi: "I",
    judul: "Cara Membuat Buku",
    kicker: "Panduan teknis bagi penulis muda",
    isi: <EdisiBuku />,
  },
  {
    romawi: "II",
    judul: "Unduh & Eksklusif",
    kicker: "Mengunci bab, membuka unduhan",
    isi: <EdisiUnduh />,
  },
  {
    romawi: "III",
    judul: "Menulis Cerita yang Seru",
    kicker: "Tujuh kebiasaan penulis pembaca setia",
    isi: <EdisiCerita />,
  },
  {
    romawi: "IV",
    judul: "Berlangganan Sela",
    kicker: "Plus, Pro, dan Ekstra — tata cara",
    isi: <EdisiLangganan />,
  },
  {
    romawi: "V",
    judul: "Menulis Cerita Fantasi",
    kicker: "Dunia yang berdiri sendiri",
    isi: <EdisiFantasi />,
  },
  {
    romawi: "VI",
    judul: "Menulis Cerita Aksi",
    kicker: "Kecepatan yang terasa di denyut",
    isi: <EdisiAksi />,
  },
  {
    romawi: "VII",
    judul: "Menulis Misteri",
    kicker: "Menipu pembaca dengan terhormat",
    isi: <EdisiMisteri />,
  },
  {
    romawi: "VIII",
    judul: "Menulis Romansa",
    kicker: "Seni mengukur jarak dua hati",
    isi: <EdisiRomansa />,
  },
  {
    romawi: "IX",
    judul: "Menambah Glosarium",
    kicker: "Kamus bersama yang bisa diketuk",
    isi: <EdisiGlosarium />,
  },
  {
    romawi: "X",
    judul: "Semua Fitur, A–Z",
    kicker: "Kamus harta karun Sela",
    isi: <EdisiAlfabet />,
  },
  {
    romawi: "XI",
    judul: "Fantasi: Nol hingga Mahir",
    kicker: "Delapan bagian, dari genre hingga roadmap 8 bulan",
    isi: <EdisiFantasiLengkap />,
    istimewa: true,
  },
];

/* ================= PORTAL PEMILIH ZAMAN ================= */
function EraPortal({ pilih }) {
  return (
    <>
      <style>{`
        .tut-portal{min-height:100vh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;padding:40px 16px;
          background:radial-gradient(ellipse at 50% 120%,#15120D 0%,#08070A 65%);
          font-family:var(--font-body,Literata,Georgia,serif);overflow:hidden;position:relative;}
        .tut-portal-head{text-align:center;margin-bottom:8px;position:relative;z-index:2;}
        .tut-portal-head .atas{font-variant:small-caps;letter-spacing:.4em;font-size:11px;color:#9C8F72;}
        .tut-portal-head h1{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(30px,6vw,54px);color:#F1E9D8;margin:6px 0 4px;}
        .tut-portal-head h1 .titik{color:#E7C468;}
        .tut-portal-head .bawah{font-style:italic;font-size:14px;color:#8a7f66;}
        .tut-kartu-row-portal{display:flex;justify-content:center;align-items:center;
          gap:0;margin:26px 0 10px;position:relative;z-index:2;}
        .tut-kartu-era{position:relative;width:min(300px,78vw);min-height:350px;
          border:none;cursor:pointer;text-align:center;padding:26px 20px 22px;
          font-family:inherit;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s;}
        .tut-kartu-era:hover{transform:rotate(0deg) translateY(-6px) scale(1.03)!important;z-index:5;}
        .tut-kartu-era.era1910{background:linear-gradient(165deg,#F6F0E1,#EFE5C9);
          color:#26221B;border:1px solid #26221B;
          box-shadow:0 0 0 4px #F6F0E1,0 0 0 5px #26221B,0 22px 44px rgba(0,0,0,.5);
          transform:rotate(-5deg) translateY(-8px);z-index:3;}
        .era1910 .pe-mast{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:26px;color:#26221B;}
        .era1910 .pe-mast span{color:#7C2430;}
        .era1910 .pe-sub{font-variant:small-caps;font-size:10px;letter-spacing:.3em;
          color:#8a7f66;margin:6px 0 12px;}
        .era1910 .pe-garis{height:1px;background:#26221B;opacity:.6;margin:0 auto 14px;max-width:180px;}
        .era1910 .pe-bar{height:5px;background:#26221B;opacity:.22;margin:8px auto;border-radius:2px;}
        .era1910 .pe-tape{position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(-3deg);
          width:92px;height:26px;background:rgba(231,196,104,.55);box-shadow:0 2px 6px rgba(0,0,0,.2);}
        .tut-kartu-era.era2300{background:linear-gradient(170deg,#1A140A,#0C0906 70%);
          color:#F0E6D2;border:1px solid rgba(231,196,104,.45);
          box-shadow:0 0 0 1px rgba(231,196,104,.15),0 0 34px rgba(231,196,104,.12),0 22px 44px rgba(0,0,0,.6);
          transform:rotate(4deg) translateY(14px);z-index:2;overflow:hidden;}
        .era2300 .pe-live{display:inline-flex;align-items:center;gap:7px;
          font-family:var(--font-display,Fraunces,Georgia);font-size:10px;font-weight:700;
          letter-spacing:.28em;color:#F0E6D2;background:rgba(224,83,47,.18);
          border:1px solid rgba(224,83,47,.55);padding:5px 12px;border-radius:2px;}
        .era2300 .pe-live i{width:7px;height:7px;border-radius:50%;background:#E0532F;
          animation:pe-blink 1.4s ease-in-out infinite;}
        @keyframes pe-blink{0%,100%{opacity:1}50%{opacity:.25}}
        .era2300 .pe-title{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:24px;letter-spacing:.14em;color:#F5EDDA;margin:14px 0 2px;
          text-shadow:0 0 22px rgba(231,196,104,.35);}
        .era2300 .pe-title span{color:#E7C468;}
        .era2300 .pe-net{font-size:10px;letter-spacing:.3em;color:#A89678;margin-bottom:12px;}
        .era2300 .pe-wave{display:flex;align-items:flex-end;justify-content:center;
          gap:3px;height:30px;margin:12px 0;}
        .era2300 .pe-wave i{width:4px;background:#E7C468;border-radius:1px;
          animation:pe-wave 1.1s ease-in-out infinite;}
        .era2300 .pe-wave i:nth-child(2n){animation-delay:.15s}
        .era2300 .pe-wave i:nth-child(3n){animation-delay:.3s}
        .era2300 .pe-wave i:nth-child(4n){animation-delay:.45s}
        .era2300 .pe-wave i:nth-child(5n){animation-delay:.6s}
        @keyframes pe-wave{0%,100%{height:22%}50%{height:100%}}
        .era2300 .pe-ticker{position:absolute;left:0;right:0;bottom:0;
          border-top:1px solid rgba(231,196,104,.3);background:rgba(0,0,0,.35);
          overflow:hidden;padding:7px 0;}
        .era2300 .pe-ticker span{display:inline-block;white-space:nowrap;
          font-size:9.5px;letter-spacing:.14em;color:#E7C468;
          animation:pe-tick 18s linear infinite;}
        @keyframes pe-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .pe-cta{display:inline-block;margin-top:18px;padding:10px 22px;font-size:13px;
          font-weight:600;letter-spacing:.04em;}
        .era1910 .pe-cta{background:#7C2430;color:#F6F0E1;border:1px solid #26221B;}
        .era2300 .pe-cta{background:#E7C468;color:#1A140A;border:1px solid #E7C468;
          margin-bottom:26px;}
        .tut-kartu-era:hover .pe-cta{filter:brightness(1.12);}
        .tut-portal-note{margin-top:16px;font-size:12px;font-style:italic;
          color:#8a7f66;position:relative;z-index:2;}
        @media(max-width:760px){
          .tut-kartu-row-portal{flex-direction:column;gap:34px;}
          .tut-kartu-era.era1910{transform:rotate(-3deg);}
          .tut-kartu-era.era2300{transform:rotate(2.5deg);}
        }
      `}</style>
      <div className="tut-portal">
        <div className="tut-portal-head">
          <p className="atas">Panduan Sela — dua zaman</p>
          <h1>
            Pilih waktumu<span className="titik">.</span>
          </h1>
          <p className="bawah">
            Sebelas edisi yang sama, dibacarkan dengan dua cara yang berbeda
            sama sekali.
          </p>
        </div>
        <div className="tut-kartu-row-portal">
          <button
            className="tut-kartu-era era1910"
            onClick={() => pilih("1910")}>
            <span className="pe-tape" />
            <div className="pe-mast">
              Panduan Sela<span>.</span>
            </div>
            <p className="pe-sub">Terbitan Penulis &amp; Pembaca</p>
            <div className="pe-garis" />
            <div className="pe-bar" style={{ width: "84%" }} />
            <div className="pe-bar" style={{ width: "68%" }} />
            <div className="pe-bar" style={{ width: "76%" }} />
            <p
              style={{
                fontStyle: "italic",
                fontSize: 12.5,
                color: "#6E675B",
                marginTop: 14,
              }}>
              Mesin ketik, tinta, dan kertas gading —
              <br />
              sebelas edisi tercetak dengan tenang.
            </p>
            <span className="pe-cta">Masuki Edisi 1910 →</span>
          </button>

          <button
            className="tut-kartu-era era2300"
            onClick={() => pilih("2300")}>
            <span className="pe-live">
              <i /> SIARAN LANGSUNG
            </span>
            <div className="pe-title">
              SELA<span> BROADCAST</span>
            </div>
            <p className="pe-net">JARINGAN BERITA NUSANTARA · TAHUN 2300</p>
            <div className="pe-wave">
              {Array.from({ length: 26 }, (_, i) => (
                <i key={i} style={{ height: "40%" }} />
              ))}
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: "#A89678",
                fontStyle: "italic",
                lineHeight: 1.7,
              }}>
              Sebelas segmen panduan,
              <br />
              disiarkan langsung dari masa depan.
            </p>
            <span className="pe-cta">Saksikan Siaran 2300 →</span>
            <div className="pe-ticker">
              <span>
                SELAMAT DATANG DI SALURAN PANDUAN ▪ SEBELAS SEGMEN TERSEDIA ▪
                KERTAS KINI BARANG MUSEUM ▪ SIARAN DIJAMIN TANPA IKLAN ▪ SELAMAT
                DATANG DI SALURAN PANDUAN ▪ SEBELAS SEGMEN TERSEDIA ▪ KERTAS
                KINI BARANG MUSEUM ▪ SIARAN DIJAMIN TANPA IKLAN ▪
              </span>
            </div>
          </button>
        </div>
        <p className="tut-portal-note">
          Kamu dapat berganti zaman kapan pun dari dalam panduan.
        </p>
      </div>
    </>
  );
}

/* ================= HALAMAN UTAMA ================= */
export default function Tutorial() {
  const { theme } = useApp();
  const [era, setEra] = useState(() => localStorage.getItem("sela.tutEra"));
  const [idx, setIdx] = useState(0);
  const ed = EDISI[idx];

  useEffect(() => {
    const f = (e) => {
      if (!era) return;
      if (e.key === "ArrowRight")
        setIdx((v) => Math.min(EDISI.length - 1, v + 1));
      if (e.key === "ArrowLeft") setIdx((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [era]);

  const pilihEra = (e) => {
    localStorage.setItem("sela.tutEra", e);
    setEra(e);
    setIdx(0);
    window.scrollTo({ top: 0 });
  };
  const gantiEra = () => {
    localStorage.removeItem("sela.tutEra");
    setEra(null);
    window.scrollTo({ top: 0 });
  };
  const ganti = (n) => {
    setIdx(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!era) return <EraPortal pilih={pilihEra} />;

  const isFuture = era === "2300";

  return (
    <>
      <style>{`
        /* ============ DASAR — 1910 mengikuti tema setting ============ */
        .tut-page{
          --tp-bg:#FAF6EC; --tp-paper:#FFFDF5; --tp-ink:#1A1815;
          --tp-redup:#57524a; --tp-pucat:#8a8378; --tp-garis:#D8CDB2;
          --tp-aksen:#7C2430; --tp-emas:#8B6914; --tp-emas-terang:#E7C468;
          background:var(--tp-bg);color:var(--tp-ink);
          font-family:var(--font-body,Literata,Georgia,serif);
          margin:0 calc(-50vw + 50%);
          padding:clamp(20px,4vw,48px) clamp(14px,4vw,48px);
          min-height:100vh;
        }
        .tut-page[data-tema="sepia"]{
          --tp-bg:#E8D9A8; --tp-paper:#F0E3BC; --tp-ink:#2E2612;
          --tp-redup:#6E6144; --tp-pucat:#98875F; --tp-garis:#cbb87e;
          --tp-aksen:#8a5a14; --tp-emas:#7a5c0e; --tp-emas-terang:#D9B85C;
          background:radial-gradient(ellipse at 50% 0%,rgba(255,244,200,.5),transparent 60%),var(--tp-bg);
        }
        .tut-page[data-tema="gelap"]{
          --tp-bg:#12100D; --tp-paper:#1A1713; --tp-ink:#E8E0CE;
          --tp-redup:#9A9180; --tp-pucat:#6E675B; --tp-garis:#33302A;
          --tp-aksen:#D9705A; --tp-emas:#C9A227; --tp-emas-terang:#E7C468;
          background:radial-gradient(ellipse at 50% 0%,rgba(231,196,104,.05),transparent 60%),var(--tp-bg);
        }
        .tut-page[data-tema="gelap"] .tut-kode{background:#0D0B09;border:1px solid var(--tp-garis);}
        .tut-page[data-tema="gelap"] .tut-lat-contoh,
        .tut-page[data-tema="gelap"] .tut-mono,
        .tut-page[data-tema="gelap"] .tut-inline{background:#242019;border-color:#3a352c;}
        .tut-page[data-tema="gelap"] .tut-anotasi,
        .tut-page[data-tema="gelap"] .tut-callout-demo{background:#242019;}
        .tut-page[data-tema="gelap"] .tut-langkah li::before,
        .tut-page[data-tema="gelap"] .tut-pembatas::after{background:var(--tp-paper);}
        .tut-page[data-tema="gelap"] .tut-btn{background:var(--tp-paper);}
        .tut-page[data-tema="gelap"] .tut-btn:hover{background:var(--tp-aksen);color:#fff;border-color:var(--tp-aksen);}

        .tut-kertas{max-width:860px;margin:0 auto;background:var(--tp-paper);
          border:1px solid var(--tp-ink);
          box-shadow:0 0 0 4px var(--tp-paper),0 0 0 5px var(--tp-ink),0 18px 44px rgba(26,24,21,.18);
          padding:clamp(22px,4vw,52px) clamp(16px,4vw,56px);}
        .tut-masthead{text-align:center;border-bottom:3px double var(--tp-ink);padding-bottom:14px;}
        .tut-masthead .atas{font-variant:small-caps;letter-spacing:.35em;font-size:11px;color:var(--tp-pucat);}
        .tut-masthead h1{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(30px,6vw,52px);letter-spacing:.02em;margin:6px 0 4px;color:var(--tp-ink);}
        .tut-masthead h1 .titik{color:var(--tp-aksen);}
        .tut-masthead .bawah{font-style:italic;font-size:13px;color:var(--tp-redup);}
        .tut-ganti-era{margin-top:10px;background:none;border:1px solid var(--tp-pucat);
          color:var(--tp-pucat);font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;
          padding:4px 14px;cursor:pointer;font-family:inherit;}
        .tut-ganti-era:hover{border-color:var(--tp-aksen);color:var(--tp-aksen);}
        .tut-tab-row{display:flex;flex-wrap:wrap;justify-content:center;gap:0;
          border-bottom:1px solid var(--tp-ink);margin-top:16px;}
        .tut-tab{font-variant:small-caps;letter-spacing:.06em;font-size:13px;
          padding:9px 14px 7px;border:none;background:none;cursor:pointer;
          color:var(--tp-pucat);border-bottom:3px solid transparent;margin-bottom:-2px;font-family:inherit;}
        .tut-tab.on{color:var(--tp-aksen);border-bottom-color:var(--tp-aksen);font-weight:600;}
        .tut-tab:hover{color:var(--tp-ink);}
        .tut-edisi-head{text-align:center;margin:30px 0 6px;}
        .tut-edisi-romawi{font-variant:small-caps;letter-spacing:.4em;font-size:12px;color:var(--tp-emas);}
        .tut-edisi-head h2{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(24px,4.5vw,36px);margin:4px 0 2px;color:var(--tp-ink);}
        .tut-edisi-kicker{font-style:italic;font-size:14px;color:var(--tp-redup);}
        .tut-pembatas{width:120px;height:1px;background:var(--tp-ink);opacity:.5;
          margin:16px auto 0;position:relative;}
        .tut-pembatas::after{content:"✦";position:absolute;top:-9px;left:50%;
          transform:translateX(-50%);background:var(--tp-paper);padding:0 10px;
          color:var(--tp-emas);font-size:12px;}
        .tut-lead{font-size:17px;line-height:1.95;margin:26px 0 0;}
        .tut-dropcap::first-letter{float:left;font-family:var(--font-display,Fraunces,Georgia);
          font-weight:700;font-size:3.4em;line-height:.82;padding:4px 10px 0 0;color:var(--tp-aksen);}
        .tut-par{line-height:1.95;font-size:15.5px;margin:16px 0;}
        .tut-h3{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;font-size:19px;
          margin:36px 0 10px;color:var(--tp-ink);}
        .tut-h3::before{content:"— ";color:var(--tp-emas);}
        .tut-link{color:var(--tp-aksen);text-decoration:underline;text-underline-offset:3px;}
        .tut-mono{font-family:Menlo,monospace;font-size:.85em;background:var(--tp-bg);
          padding:1px 6px;border:1px solid var(--tp-garis);border-radius:2px;white-space:nowrap;}
        .tut-inline{font-family:Menlo,monospace;font-size:.9em;background:var(--tp-bg);padding:1px 5px;border-radius:2px;}
        .tut-redup{color:var(--tp-redup);}
        .tut-tabel-wrap{margin:16px 0;overflow-x:auto;}
        .tut-tabel{width:100%;border-collapse:collapse;font-size:13.5px;background:var(--tp-paper);}
        .tut-tabel th{font-family:var(--font-display,Fraunces,Georgia);text-align:left;
          font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--tp-redup);
          border-top:2px solid var(--tp-ink);border-bottom:1px solid var(--tp-ink);padding:8px 10px;}
        .tut-tabel td{border-bottom:1px solid var(--tp-garis);padding:9px 10px;vertical-align:top;}
        .tut-tabel tr:last-child td{border-bottom:2px solid var(--tp-ink);}
        .tut-kode-wrap{position:relative;margin:14px 0;}
        .tut-kode{background:var(--tp-ink);color:var(--tp-paper);padding:14px 16px;
          border-radius:2px;overflow-x:auto;font-family:Menlo,monospace;font-size:12.5px;
          line-height:1.7;white-space:pre;margin:0;}
        .tut-salin{position:absolute;top:8px;right:8px;background:none;
          border:1px solid var(--tp-emas);color:var(--tp-emas-terang);font-size:10px;
          letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;cursor:pointer;font-family:inherit;}
        .tut-anotasi{border:1px solid var(--tp-ink);border-left:4px solid var(--tp-aksen);
          padding:12px 16px;margin:22px 0;font-style:italic;font-size:14px;
          background:var(--tp-bg);line-height:1.8;}
        .tut-orn{color:var(--tp-emas);font-style:normal;}
        .tut-kutip{border-left:3px solid var(--tp-aksen);margin:12px 0;
          padding:4px 0 4px 16px;font-style:italic;color:var(--tp-redup);}
        .tut-callout-demo{border:1px solid var(--tp-garis);border-left:4px solid var(--tp-aksen);
          border-radius:2px;padding:10px 14px;margin:10px 0;}
        .tut-callout-demo ul{margin:0;padding-left:18px;line-height:1.9;font-size:14px;}
        .tut-dua{display:grid;gap:18px;grid-template-columns:1fr;margin:16px 0;}
        @media(min-width:640px){.tut-dua{grid-template-columns:1fr 1fr;}}
        .tut-cap{font-variant:small-caps;font-size:12px;letter-spacing:.1em;color:var(--tp-redup);margin:0 0 6px;}
        .tut-langkah{margin:14px 0 0 0;padding:0;list-style:none;counter-reset:tut;}
        .tut-langkah li{counter-increment:tut;position:relative;padding:0 0 12px 42px;line-height:1.85;font-size:15px;}
        .tut-langkah li::before{content:counter(tut);position:absolute;left:0;top:1px;
          width:26px;height:26px;border:1px solid var(--tp-ink);border-radius:50%;
          display:grid;place-items:center;font-family:var(--font-display,Fraunces,Georgia);
          font-size:13px;font-weight:600;color:var(--tp-aksen);background:var(--tp-paper);}
        .tut-kuis{border:2px solid var(--tp-ink);margin:28px 0;background:var(--tp-paper);}
        .tut-kuis-cap{font-variant:small-caps;font-size:11px;letter-spacing:.25em;
          color:var(--tp-emas);margin:0;padding:8px 14px;border-bottom:1px solid var(--tp-garis);}
        .tut-kuis-q{font-family:var(--font-display,Fraunces,Georgia);font-weight:600;
          font-size:16px;margin:0;padding:14px 16px 6px;}
        .tut-kuis-op{display:grid;gap:6px;padding:10px 14px 14px;}
        .tut-kuis-btn{display:flex;align-items:center;gap:10px;text-align:left;
          border:1px solid var(--tp-garis);background:var(--tp-paper);cursor:pointer;
          padding:9px 12px;font-family:inherit;font-size:14px;color:var(--tp-ink);transition:border-color .15s;}
        .tut-kuis-btn:hover:not(:disabled){border-color:var(--tp-ink);}
        .tut-kuis-btn:disabled{cursor:default;}
        .tut-kuis-hrf{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:12px;width:22px;height:22px;border:1px solid var(--tp-ink);
          border-radius:50%;display:grid;place-items:center;flex:none;}
        .tut-kuis-btn.benar{border-color:#2F5D50;background:rgba(47,93,80,.1);}
        .tut-kuis-btn.benar .tut-kuis-hrf{background:#2F5D50;color:#F6F0E1;border-color:#2F5D50;}
        .tut-kuis-btn.salah{border-color:var(--tp-aksen);background:rgba(124,36,48,.08);}
        .tut-kuis-btn.salah .tut-kuis-hrf{background:var(--tp-aksen);color:#F6F0E1;border-color:var(--tp-aksen);}
        .tut-kuis-btn.redup{opacity:.45;}
        .tut-corek{margin-left:auto;font-style:normal;font-weight:700;}
        .tut-kuis-hsl{margin:0;padding:0 16px 14px;font-size:13.5px;font-style:italic;
          color:var(--tp-redup);line-height:1.7;}
        .tut-latihan{border:1px dashed var(--tp-ink);margin:24px 0;padding:14px 16px;}
        .tut-lat-cap{font-variant:small-caps;font-size:11px;letter-spacing:.25em;
          color:var(--tp-emas);margin:0 0 4px;}
        .tut-lat-q{font-size:14.5px;line-height:1.8;margin:0 0 10px;}
        .tut-lat-ta{width:100%;box-sizing:border-box;background:transparent;
          border:1px solid var(--tp-garis);padding:10px 12px;font-family:inherit;
          font-size:14px;line-height:1.8;color:var(--tp-ink);resize:vertical;outline:none;}
        .tut-lat-ta:focus{border-color:var(--tp-aksen);}
        .tut-lat-details{margin-top:10px;font-size:13px;}
        .tut-lat-details summary{cursor:pointer;font-variant:small-caps;letter-spacing:.1em;color:var(--tp-emas);}
        .tut-lat-contoh{background:var(--tp-bg);border:1px solid var(--tp-garis);
          padding:12px;font-family:Menlo,monospace;font-size:12.5px;line-height:1.8;white-space:pre-wrap;margin:8px 0 0;}
        .tut-kartu-row{display:grid;gap:16px;grid-template-columns:1fr;margin:20px 0;}
        @media(min-width:760px){.tut-kartu-row{grid-template-columns:repeat(3,1fr);}}
        .tut-kartu{border:1px solid var(--tp-ink);padding:18px 16px;background:var(--tp-paper);position:relative;}
        .tut-kartu::before{content:"";position:absolute;inset:5px;border:1px solid var(--tp-garis);pointer-events:none;}
        .tut-kartu-nama{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;font-size:19px;margin:0;color:var(--tp-ink);}
        .tut-kartu-siapa{font-variant:small-caps;font-size:11px;letter-spacing:.2em;color:var(--tp-emas);margin:2px 0 8px;}
        .tut-kartu-harga{font-weight:600;font-size:14px;margin:0 0 10px;color:var(--tp-aksen);}
        .tut-daftar{margin:0;padding:0;list-style:none;font-size:12.5px;line-height:1.9;color:var(--tp-redup);}
        .tut-aksi{display:flex;flex-wrap:wrap;gap:12px;margin:30px 0 0;}
        .tut-btn{display:inline-block;text-decoration:none;color:var(--tp-ink);
          border:1px solid var(--tp-ink);background:var(--tp-paper);padding:11px 26px;
          font-family:var(--font-display,Fraunces,Georgia);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;}
        .tut-btn:hover{background:var(--tp-ink);color:var(--tp-paper);}
        .tut-btn-utama{background:var(--tp-aksen);border-color:var(--tp-aksen);color:#F6F0E1;}
        .tut-btn-utama:hover{background:var(--tp-ink);color:var(--tp-paper);}
        .tut-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;
          border-top:3px double var(--tp-ink);margin-top:24px;padding-top:20px;}
        .tut-panah{display:inline-flex;align-items:center;gap:10px;background:none;
          border:1px solid var(--tp-ink);padding:10px 18px;cursor:pointer;font-family:inherit;
          color:var(--tp-ink);font-size:13.5px;transition:all .2s;}
        .tut-panah:hover:not(:disabled){background:var(--tp-ink);color:var(--tp-paper);}
        .tut-panah:disabled{opacity:.25;cursor:default;}
        .tut-panah .panah-besar{font-size:18px;line-height:1;}
        .tut-posisi{text-align:center;font-variant:small-caps;font-size:12px;letter-spacing:.25em;color:var(--tp-pucat);}
        .tut-posisi b{color:var(--tp-aksen);}

        /* ===== RAIL NAVIGASI TERPISAH ===== */
        .tut-rail{margin-top:34px;border-top:1px solid var(--tp-garis);padding-top:18px;}
        .tut-rail-cap{font-variant:small-caps;letter-spacing:.28em;font-size:11px;
          color:var(--tp-pucat);margin:0 0 12px;text-align:center;}
        .tut-rail-list{display:grid;gap:8px;
          grid-template-columns:repeat(auto-fill,minmax(190px,1fr));}
        .tut-rail-item{display:flex;align-items:center;gap:10px;
          border:1px solid var(--tp-garis);background:var(--tp-paper);
          padding:10px 12px;cursor:pointer;font-family:inherit;color:var(--tp-ink);
          text-align:left;transition:all .2s;position:relative;}
        .tut-rail-item:hover{border-color:var(--tp-aksen);transform:translateY(-2px);}
        .tut-rail-item.on{border-color:var(--tp-aksen);
          box-shadow:inset 3px 0 0 var(--tp-aksen);}
        .tut-rail-no{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:13px;color:var(--tp-emas);width:30px;flex:none;}
        .tut-rail-judul{font-size:12px;line-height:1.35;flex:1;min-width:0;}
        .tut-rail-tag{position:absolute;top:-8px;right:-6px;font-size:8.5px;
          letter-spacing:.15em;text-transform:uppercase;padding:2px 8px;
          background:var(--tp-aksen);color:#F6F0E1;}

        /* rail versi 2300 — panel sinyal siaran */
        .tut-page[data-era="2300"] .tut-rail-cap{font-family:var(--font-display,Fraunces,Georgia);
          color:var(--tp-emas);letter-spacing:.3em;}
        .tut-page[data-era="2300"] .tut-rail-item{
          background:rgba(231,196,104,.03);border-color:var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-rail-item.on{
          border-color:var(--tp-aksen);background:rgba(231,196,104,.07);
          box-shadow:inset 3px 0 0 var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-rail-item.on::after{content:"●";
          margin-left:auto;color:#E0532F;font-size:9px;
          animation:tut-live 1.4s ease-in-out infinite;}
        .tut-page[data-era="2300"] .tut-rail-no{color:var(--tp-emas);}
        .tut-page[data-era="2300"] .tut-rail-item:hover{box-shadow:0 0 14px rgba(231,196,104,.15);}
        .tut-page[data-era="2300"] .tut-rail-tag{background:var(--tp-emas);color:#14100B;}

        /* ============================================================
           KULIT 2300 — SELA BROADCAST NETWORK
           ============================================================ */
        .tut-page[data-era="2300"]{
          --tp-bg:#0C0A07; --tp-paper:#14100B; --tp-ink:#F0E6D2;
          --tp-redup:#A89678; --tp-pucat:#6E6250; --tp-garis:#2E2820;
          --tp-aksen:#E7C468; --tp-emas:#E08A3C; --tp-emas-terang:#FFE3A0;
          background:
            radial-gradient(ellipse at 50% 118%,#1E160A 0%,#0C0A07 62%),
            var(--tp-bg);
        }
        .tut-page[data-era="2300"] .tut-statusbar{
          display:flex;align-items:center;justify-content:space-between;gap:10px;
          border:1px solid var(--tp-garis);background:rgba(0,0,0,.3);
          padding:7px 12px;margin-bottom:18px;
          font-size:10px;letter-spacing:.2em;color:var(--tp-redup);
          text-transform:uppercase;}
        .tut-page[data-era="2300"] .tut-statusbar .st-live{
          display:inline-flex;align-items:center;gap:7px;color:#F0E6D2;
          font-weight:700;letter-spacing:.28em;}
        .tut-page[data-era="2300"] .tut-statusbar .st-live i{
          width:8px;height:8px;border-radius:50%;background:#E0532F;
          box-shadow:0 0 10px rgba(224,83,47,.8);
          animation:tut-live 1.4s ease-in-out infinite;}
        @keyframes tut-live{0%,100%{opacity:1}50%{opacity:.2}}
        .tut-page[data-era="2300"] .tut-masthead{border-bottom:1px solid var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-masthead .atas{font-family:var(--font-display,Fraunces,Georgia);
          font-variant:normal;letter-spacing:.32em;color:var(--tp-emas);
          text-transform:uppercase;font-size:10.5px;}
        .tut-page[data-era="2300"] .tut-masthead h1{
          letter-spacing:.1em;text-transform:uppercase;color:var(--tp-ink);
          text-shadow:0 0 30px rgba(231,196,104,.25);}
        .tut-page[data-era="2300"] .tut-masthead h1 .titik{color:var(--tp-emas);}
        .tut-page[data-era="2300"] .tut-masthead .bawah{font-size:12.5px;color:var(--tp-redup);}
        .tut-page[data-era="2300"] .tut-wave{display:flex;align-items:flex-end;
          justify-content:center;gap:3px;height:26px;margin:14px auto 4px;max-width:340px;}
        .tut-page[data-era="2300"] .tut-wave i{width:3px;background:var(--tp-aksen);
          border-radius:1px;opacity:.8;animation:tut-wave 1.2s ease-in-out infinite;}
        .tut-page[data-era="2300"] .tut-wave i:nth-child(2n){animation-delay:.12s}
        .tut-page[data-era="2300"] .tut-wave i:nth-child(3n){animation-delay:.24s}
        .tut-page[data-era="2300"] .tut-wave i:nth-child(4n){animation-delay:.36s}
        .tut-page[data-era="2300"] .tut-wave i:nth-child(5n){animation-delay:.48s}
        @keyframes tut-wave{0%,100%{height:20%}50%{height:100%}}
        .tut-page[data-era="2300"] .tut-ticker{
          border:1px solid var(--tp-garis);border-left:4px solid var(--tp-aksen);
          background:rgba(0,0,0,.35);overflow:hidden;padding:8px 0;margin:16px 0 4px;}
        .tut-page[data-era="2300"] .tut-ticker span{display:inline-block;
          white-space:nowrap;font-size:10.5px;letter-spacing:.18em;
          color:var(--tp-emas-terang);text-transform:uppercase;
          animation:tut-tick 26s linear infinite;}
        @keyframes tut-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .tut-page[data-era="2300"] .tut-ganti-era{border-color:var(--tp-pucat);
          color:var(--tp-redup);background:none;}
        .tut-page[data-era="2300"] .tut-ganti-era:hover{border-color:var(--tp-aksen);
          color:var(--tp-aksen);background:none;}
        .tut-page[data-era="2300"] .tut-tab{font-variant:normal;text-transform:uppercase;
          font-size:11px;letter-spacing:.12em;}
        .tut-page[data-era="2300"] .tut-tab.on{color:var(--tp-emas-terang);
          border-bottom-color:var(--tp-emas);text-shadow:0 0 14px rgba(231,196,104,.4);}
        .tut-page[data-era="2300"] .tut-tab-row{border-bottom-color:var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-edisi-romawi{color:var(--tp-emas);letter-spacing:.32em;}
        .tut-page[data-era="2300"] .tut-edisi-head h2{letter-spacing:.08em;
          text-transform:uppercase;color:var(--tp-ink);
          text-shadow:0 0 24px rgba(231,196,104,.2);}
        .tut-page[data-era="2300"] .tut-edisi-kicker{color:var(--tp-redup);}
        .tut-page[data-era="2300"] .tut-pembatas{background:var(--tp-aksen);opacity:.6;}
        .tut-page[data-era="2300"] .tut-pembatas::after{content:"◆";color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-lead{font-size:16px;line-height:2;}
        .tut-page[data-era="2300"] .tut-dropcap::first-letter{color:var(--tp-emas);
          text-shadow:0 0 18px rgba(224,138,60,.5);}
        .tut-page[data-era="2300"] .tut-par{font-size:14.5px;line-height:2;}
        .tut-page[data-era="2300"] .tut-h3{font-size:17px;letter-spacing:.06em;
          text-transform:uppercase;color:var(--tp-emas-terang);}
        .tut-page[data-era="2300"] .tut-h3::before{content:"▸ ";color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-link{color:var(--tp-emas-terang);
          text-decoration-color:var(--tp-emas);}
        .tut-page[data-era="2300"] .tut-mono,.tut-page[data-era="2300"] .tut-inline{
          background:rgba(231,196,104,.08);border-color:rgba(231,196,104,.3);
          color:var(--tp-emas-terang);}
        .tut-page[data-era="2300"] .tut-tabel th{color:var(--tp-emas-terang);
          border-top-color:var(--tp-aksen);border-bottom-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-tabel td{border-bottom-color:var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-tabel tr:last-child td{border-bottom-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-kode{background:#080604;color:var(--tp-emas-terang);
          border:1px solid var(--tp-garis);border-left:3px solid var(--tp-aksen);
          box-shadow:inset 0 0 30px rgba(0,0,0,.5);}
        .tut-page[data-era="2300"] .tut-kode::before{content:"ARSIP TRANSKRIP";
          display:block;font-size:9px;letter-spacing:.3em;color:var(--tp-emas);
          margin-bottom:8px;text-transform:uppercase;}
        .tut-page[data-era="2300"] .tut-salin{border-color:var(--tp-aksen);color:var(--tp-emas);}
        .tut-page[data-era="2300"] .tut-anotasi{border-color:var(--tp-aksen);
          border-left-width:4px;background:rgba(231,196,104,.05);}
        .tut-page[data-era="2300"] .tut-anotasi::before{content:"SOROTAN SIARAN";
          display:block;font-size:9px;letter-spacing:.3em;color:var(--tp-emas);
          margin-bottom:6px;font-style:normal;text-transform:uppercase;}
        .tut-page[data-era="2300"] .tut-kutip{border-left-color:var(--tp-aksen);
          color:var(--tp-redup);}
        .tut-page[data-era="2300"] .tut-callout-demo{border-color:var(--tp-garis);
          border-left-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-langkah li::before{border-radius:0;
          border-color:var(--tp-aksen);color:var(--tp-emas-terang);background:transparent;}
        .tut-page[data-era="2300"] .tut-kuis{border-color:var(--tp-aksen);
          box-shadow:0 0 26px rgba(231,196,104,.07);}
        .tut-page[data-era="2300"] .tut-kuis-cap{color:var(--tp-ink);
          text-transform:uppercase;letter-spacing:.3em;border-bottom-color:var(--tp-garis);
          display:flex;align-items:center;gap:8px;}
        .tut-page[data-era="2300"] .tut-kuis-cap::before{content:"";width:7px;height:7px;
          border-radius:50%;background:#E0532F;animation:tut-live 1.4s ease-in-out infinite;}
        .tut-page[data-era="2300"] .tut-kuis-q{color:var(--tp-ink);}
        .tut-page[data-era="2300"] .tut-kuis-btn{background:rgba(231,196,104,.04);
          border-color:var(--tp-garis);color:var(--tp-ink);}
        .tut-page[data-era="2300"] .tut-kuis-btn:hover:not(:disabled){border-color:var(--tp-aksen);
          box-shadow:0 0 14px rgba(231,196,104,.15);}
        .tut-page[data-era="2300"] .tut-kuis-hrf{border-radius:2px;
          border-color:var(--tp-aksen);color:var(--tp-emas-terang);}
        .tut-page[data-era="2300"] .tut-kuis-btn.benar{border-color:var(--tp-aksen);
          background:rgba(231,196,104,.12);}
        .tut-page[data-era="2300"] .tut-kuis-btn.benar .tut-kuis-hrf{
          background:var(--tp-aksen);color:#14100B;border-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-kuis-btn.salah{border-color:#E0532F;
          background:rgba(224,83,47,.1);}
        .tut-page[data-era="2300"] .tut-kuis-btn.salah .tut-kuis-hrf{
          background:#E0532F;color:#14100B;border-color:#E0532F;}
        .tut-page[data-era="2300"] .tut-latihan{border:1px dashed var(--tp-pucat);}
        .tut-page[data-era="2300"] .tut-lat-ta{color:var(--tp-ink);
          border-color:var(--tp-garis);background:rgba(0,0,0,.25);}
        .tut-page[data-era="2300"] .tut-lat-ta:focus{border-color:var(--tp-aksen);
          box-shadow:0 0 14px rgba(231,196,104,.12);}
        .tut-page[data-era="2300"] .tut-lat-contoh{background:#080604;
          border-color:var(--tp-garis);color:var(--tp-emas-terang);}
        .tut-page[data-era="2300"] .tut-kartu{border-color:var(--tp-garis);
          background:rgba(231,196,104,.03);}
        .tut-page[data-era="2300"] .tut-kartu::before{border-color:var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-kartu-harga{color:var(--tp-emas);}
        .tut-page[data-era="2300"] .tut-btn{color:var(--tp-ink);
          border-color:var(--tp-pucat);background:transparent;}
        .tut-page[data-era="2300"] .tut-btn:hover{background:var(--tp-aksen);
          color:#14100B;border-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-btn-utama{background:var(--tp-aksen);
          border-color:var(--tp-aksen);color:#14100B;}
        .tut-page[data-era="2300"] .tut-btn-utama:hover{background:var(--tp-emas-terang);
          border-color:var(--tp-emas-terang);color:#14100B;
          box-shadow:0 0 20px rgba(231,196,104,.3);}
        .tut-page[data-era="2300"] .tut-nav{border-top-color:var(--tp-garis);}
        .tut-page[data-era="2300"] .tut-panah{border-color:var(--tp-pucat);
          color:var(--tp-ink);background:transparent;}
        .tut-page[data-era="2300"] .tut-panah:hover:not(:disabled){
          background:var(--tp-aksen);color:#14100B;border-color:var(--tp-aksen);}
        .tut-page[data-era="2300"] .tut-posisi b{color:var(--tp-emas-terang);}
      `}</style>

      <div
        className="tut-page"
        data-era={era}
        data-tema={era === "1910" ? theme : undefined}>
        <div className="tut-kertas">
          {/* ===== bilah status siaran — hanya 2300 ===== */}
          {isFuture && (
            <div className="tut-statusbar">
              <span className="st-live">
                <i /> LIVE
              </span>
              <span>SELA BROADCAST NETWORK</span>
              <span>KANAL 2300 · SINYAL KUAT</span>
            </div>
          )}

          {/* ===== MASTHEAD ===== */}
          <div className="tut-masthead">
            {isFuture ? (
              <>
                <p className="atas">SELA BROADCAST NETWORK · RUANG PANDUAN</p>
                <h1>
                  PANDUAN<span className="titik"> NASIONAL</span>
                </h1>
                <p className="bawah">
                  Sebelas segmen panduan, disiarkan langsung dari tahun 2300 —
                  tanpa iklan, tanpa jeda, tanpa kertas.
                </p>
                <div className="tut-wave">
                  {Array.from({ length: 34 }, (_, i) => (
                    <i key={i} style={{ height: "35%" }} />
                  ))}
                </div>
                <div className="tut-ticker">
                  <span>
                    SELAMAT DATANG DI RUANG PANDUAN ▪ SEBELAS SEGMEN TERSEDIA ▪
                    KERTAS KINI BARANG MUSEUM ▪ TINTA DIGANTI CAHAYA ▪ SIARAN
                    DIJAMIN TANPA IKLAN SELAMANYA ▪ SELAMAT DATANG DI RUANG
                    PANDUAN ▪ SEBELAS SEGMEN TERSEDIA ▪ KERTAS KINI BARANG
                    MUSEUM ▪ TINTA DIGANTI CAHAYA ▪ SIARAN DIJAMIN TANPA IKLAN
                    SELAMANYA ▪
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="atas">
                  Terbitan Penulis &amp; Pembaca — sejak tahun pertama
                </p>
                <h1>
                  Panduan Sela<span className="titik">.</span>
                </h1>
                <p className="bawah">
                  Sebelas edisi panjang: membuat buku, mengunduh &amp;
                  menguncinya, merangkai cerita fantasi hingga romansa, kamus
                  bersama, dan menjadi anggota
                </p>
              </>
            )}
            <button className="tut-ganti-era" onClick={gantiEra}>
              ⟲ ganti zaman
            </button>
            <div className="tut-tab-row">
              {EDISI.map((e, i) => (
                <button
                  key={e.romawi}
                  onClick={() => ganti(i)}
                  className={`tut-tab ${idx === i ? "on" : ""}`}>
                  {e.romawi}. {e.judul}
                </button>
              ))}
            </div>
          </div>

          {/* ===== ISI EDISI ===== */}
          <div key={idx} className="fadein">
            <div className="tut-edisi-head">
              <p className="tut-edisi-romawi">
                {isFuture ? `SEGMEN ${ed.romawi}` : `Edisi ${ed.romawi}`}
              </p>
              <h2>{ed.judul}</h2>
              <p className="tut-edisi-kicker">{ed.kicker}</p>
              {ed.istimewa && (
                <span
                  className="tut-rail-tag"
                  style={{
                    position: "static",
                    display: "inline-block",
                    marginTop: 8,
                  }}>
                  {isFuture ? "MODUL LENGKAP" : "Edisi Istimewa"}
                </span>
              )}
              <div className="tut-pembatas" />
            </div>
            {ed.isi}
          </div>

          {/* ===== NAVIGASI PANAH ===== */}
          <div className="tut-nav">
            <button
              className="tut-panah"
              disabled={idx === 0}
              onClick={() => ganti(idx - 1)}>
              <span className="panah-besar">←</span>
              <span>
                <span className="lbl-kecil">Edisi sebelumnya</span>
                <span className="lbl-judul">
                  {idx > 0 ? EDISI[idx - 1].judul : "—"}
                </span>
              </span>
            </button>
            <span className="tut-posisi">
              {isFuture ? "SEGMEN" : "Edisi"} <b>{EDISI[idx].romawi}</b> dari{" "}
              {EDISI.length}
            </span>
            <button
              className="tut-panah kanan"
              disabled={idx === EDISI.length - 1}
              onClick={() => ganti(idx + 1)}>
              <span>
                <span className="lbl-kecil">Edisi berikutnya</span>
                <span className="lbl-judul">
                  {idx < EDISI.length - 1 ? EDISI[idx + 1].judul : "—"}
                </span>
              </span>
              <span className="panah-besar">→</span>
            </button>
          </div>

          {/* ===== RAIL NAVIGASI TERPISAH ===== */}
          <nav className="tut-rail" aria-label="Navigasi edisi">
            <p className="tut-rail-cap">
              {isFuture ? "// INDEKS SEGMEN SIARAN" : "Daftar Terbitan"}
            </p>
            <div className="tut-rail-list">
              {EDISI.map((e, i) => (
                <button
                  key={e.romawi}
                  onClick={() => ganti(i)}
                  className={`tut-rail-item ${idx === i ? "on" : ""}`}
                  title={e.judul}>
                  <span className="tut-rail-no">{e.romawi}</span>
                  <span className="tut-rail-judul">{e.judul}</span>
                  {e.istimewa && (
                    <span className="tut-rail-tag">
                      {isFuture ? "LENGKAP" : "ISTIMEWA"}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p
              className="tut-posisi"
              style={{ marginTop: 14, textAlign: "center" }}>
              {isFuture
                ? "// pilih segmen di atas — atau gulir panah di bawah"
                : "petik satu terbitan dari rak — atau gunakan panah"}
            </p>
          </nav>
        </div>
      </div>
    </>
  );
}
