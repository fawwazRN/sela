import { useState } from "react";
import { Link } from "react-router";

const TEMPLATE = `# Bab Satu: Awal Mula

Di hutan yang lebat, hiduplah {Kancil} yang terkenal cerdik. Ia percaya **kesabaran** mengalahkan kecepatan.

> Harta sejati adalah ilmu yang dibagi.

Sahabat-sahabatnya di hutan:
- {Kura-kura} yang pelan tapi teliti
- {Elang} yang selalu terburu-buru

## Pelajaran Pertama

Pada suatu pagi, kancil berlatih berhitung dengan biji-bijian.

%% Kancil mulai perjalanannya dengan prinsip: sabar lebih tajam dari cakar.

@?? Apa prinsip Kancil? | Kecepatan | Kesabaran* | Kekuatan

# Bab Dua: Ujian Kecil

Hari itu hujan turun sejak subuh.

| Hewan | Cara menghadapi hujan |
| --- | --- |
| Kancil | Mencari daun besar |
| Kura-kura | Masuk ke cangkang |

> * Setiap cara punya kelebihannya
> * Yang penting adalah saling menolong

@?? Apa yang penting menurut kura-kura? | Saling menolong* | Menang sendiri | Cepat pulang

%% Dua sahabat belajar bahwa perbedaan cara bukan alasan untuk berselisih.`;

function Tabel({ rows, head = ["Kamu tulis", "Jadi", "Catatan"] }) {
  return (
    <div className="border border-line rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-line/30 text-left">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-display font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-line border-t align-top">
              <td className="px-4 py-2.5 font-mono text-[13px] whitespace-nowrap">
                {r[0]}
              </td>
              <td className="px-4 py-2.5">{r[1]}</td>
              <td className="px-4 py-2.5 text-ink2">{r[2] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bagian({ no, judul, children }) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-display font-bold text-accent text-lg">{no}</span>
        <h2 className="font-display font-bold text-xl md:text-2xl">{judul}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Tutorial() {
  const [copied, setCopied] = useState(false);
  const salin = () => {
    navigator.clipboard.writeText(TEMPLATE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-3xl fadein">
      <p className="lbl">Panduan penulis</p>
      <h1 className="mt-2 font-display font-bold text-3xl md:text-5xl leading-tight">
        Cara membuat buku di Sela
      </h1>
      <p className="mt-4 text-[15px] text-ink2 leading-relaxed">
        Semua buku di Sela ditulis dengan <b>Markdown sederhana</b> —
        tanda-tanda khusus yang mengubah teks biasa menjadi bab, kuis, kutipan,
        hingga tokoh interaktif. Tidak perlu install apa pun: tulis langsung di{" "}
        <Link to="/studio" className="text-accent underline underline-offset-4">
          Studio
        </Link>
        , atau siapkan file{" "}
        <code className="bg-line/50 px-1.5 py-0.5 rounded text-[13px]">
          .md
        </code>{" "}
        lalu impor di{" "}
        <Link to="/impor" className="text-accent underline underline-offset-4">
          halaman Impor
        </Link>
        .
      </p>

      {/* ===== 1. Mulai ===== */}
      <Bagian no="1" judul="Dua cara memulai">
        <div className="gap-4 grid md:grid-cols-2">
          <Link
            to="/studio"
            className="p-5 hover:border-ink transition-colors card">
            <p className="font-display font-semibold text-lg">
              ✍️ Studio — tulis di web
            </p>
            <p className="mt-1.5 text-ink2 text-sm leading-relaxed">
              Login → buka Studio → Tulis baru. Panel kiri untuk menulis, panel
              kanan pratinjau hasil aslinya secara langsung. Klik Publish saat
              selesai.
            </p>
          </Link>
          <Link
            to="/impor"
            className="p-5 hover:border-ink transition-colors card">
            <p className="font-display font-semibold text-lg">
              📄 Impor — file .md jadi
            </p>
            <p className="mt-1.5 text-ink2 text-sm leading-relaxed">
              Naskah sudah ada di Word/Notion/Obsidian? Rapikan jadi Markdown,
              simpan sebagai .md, lalu unggah. Bab terdeteksi otomatis.
            </p>
          </Link>
        </div>
      </Bagian>

      {/* ===== 2. Struktur bab ===== */}
      <Bagian no="2" judul="Membuat bab & struktur">
        <p className="mb-3 text-ink2 text-sm">
          Aturan paling penting:{" "}
          <b>
            satu <code className="bg-line/50 px-1 rounded">#</code> = satu bab.
          </b>
        </p>
        <Tabel
          rows={[
            ["# Judul Bab", "BAB BARU", "Wajib ada spasi setelah #"],
            ["## Sub-judul", "Heading besar dalam bab", "Untuk bagian penting"],
            ["### Sub-sub", "Heading kecil", "Untuk rincian"],
            ["%% kalimat", "Ringkasan bab", "Tampil otomatis di akhir bab"],
            [
              "@?? Soal? | A | B* | C",
              "Kuis pilihan ganda",
              "Tanda * = jawaban benar",
            ],
          ]}
        />
      </Bagian>

      {/* ===== 3. Format teks ===== */}
      <Bagian no="3" judul="Memformat teks">
        <Tabel
          rows={[
            ["**teks**", <b key="b">Tebal</b>, ""],
            ["*teks*", <i key="i">Miring</i>, "Tanpa spasi di dalam bintang"],
            [
              "`teks`",
              <code
                key="c"
                className="bg-line/50 px-1.5 py-0.5 rounded text-[13px]">
                Kode inline
              </code>,
              "Pakai backtick ` bukan apostrof",
            ],
            ["\\*teks\\*", "*teks*", "Backslash \\ = tampilkan apa adanya"],
          ]}
        />
      </Bagian>

      {/* ===== 4. Daftar & kutipan ===== */}
      <Bagian no="4" judul="Daftar, kutipan & kotak aksen">
        <Tabel
          rows={[
            ["- item", "• Daftar bullet", "* item juga bisa"],
            ["1. item", "1. Daftar bernomor", ""],
            ["> kalimat", "Kutipan miring + garis aksen", ""],
            [
              "> * item",
              "Kotak aksen berbullet (callout)",
              "Cocok untuk poin penegasan",
            ],
          ]}
        />
      </Bagian>

      {/* ===== 5. Kode & tabel ===== */}
      <Bagian no="5" judul="Blok kode & tabel">
        <p className="mb-3 text-ink2 text-sm">
          Bungkus kode dengan tiga backtick —{" "}
          <b>semua simbol di dalamnya dijamin aman</b> (
          <code className="bg-line/50 px-1 rounded">{"{ }"}</code>,{" "}
          <code className="bg-line/50 px-1 rounded">*</code>, dll):
        </p>
        <pre className="p-4 overflow-x-auto font-mono text-[13px] card">
          <code>{"```\nconst x = { nilai: 1 };\n```"}</code>
        </pre>
        <p className="mt-4 mb-3 text-ink2 text-sm">
          Tabel: baris pertama = judul kolom, baris kedua = pemisah:
        </p>
        <pre className="p-4 overflow-x-auto font-mono text-[13px] card">
          <code>
            {
              "| Hewan | Ciri |\n| --- | --- |\n| Kancil | Cerdik |\n| Kura-kura | Sabar |"
            }
          </code>
        </pre>
      </Bagian>

      {/* ===== 6. Tokoh ===== */}
      <Bagian no="6" judul="Tokoh — fitur khas Sela">
        <p className="mb-3 text-ink2 text-sm">
          Bungkus nama dengan kurung kurawal → pembaca bisa{" "}
          <b>mengetuk namanya</b> untuk melihat statistik kemunculannya di bab
          itu.
        </p>
        <Tabel
          rows={[
            ["{Kancil}", "Kartu tokoh ✓", "Kapital di awal, 1–3 kata"],
            ["{Prof McClintock}", "Kartu tokoh multi-kata ✓", ""],
            ["{kancil}", "Tampil literal", "Huruf kecil di awal = bukan tokoh"],
            [
              "{ x = 1 }",
              "Tampil literal",
              "Ada simbol = bukan tokoh (aman untuk kode)",
            ],
          ]}
        />
        <div className="mt-4 p-4 text-sm card">
          <p className="mb-1 font-display font-semibold">
            💡 Kata glosarium — tanpa markap!
          </p>
          <p className="text-ink2 leading-relaxed">
            Ingin kata tertentu punya arti saat diketuk pembaca (seperti{" "}
            <i>fotosintesis</i> atau <i>kudeta</i>)? Cukup tambahkan di halaman{" "}
            <Link
              to="/glosarium"
              className="text-accent underline underline-offset-4">
              Glosarium
            </Link>
            . Tulis kata itu normal di naskah — semua kemunculannya otomatis
            bisa diketuk.
          </p>
        </div>
      </Bagian>

      {/* ===== 7. Genre ===== */}
      <Bagian no="7" judul="Pilih genre — mode baca mengikuti">
        <Tabel
          head={["Genre", "Mode baca", "Cocok untuk"]}
          rows={[
            ["Pelajaran", "Fokus", "Kuis + ringkasan aktif di akhir bab"],
            ["Fiksi", "Imersi", "Novel — antarmuka menghilang"],
            ["Sejarah", "Linimasa", "Garis waktu menyala mengikuti bacaan"],
            ["Puisi", "Lambat", "Satu bait per layar"],
            ["Anak", "Ceria", "Huruf besar + tombol bacakan"],
            ["Umum", "Imersi", "Standar untuk semua"],
          ]}
        />
      </Bagian>

      {/* ===== 8. Yang tidak didukung ===== */}
      <Bagian no="8" judul="Yang belum didukung">
        <Tabel
          head={["Tulisan", "Status", ""]}
          rows={[
            ["![gambar](url)", "❌ Belum ada", "Reader fokus pada teks"],
            ["[link](url)", "❌ Belum didukung", ""],
            ["--- garis horizontal", "⚠️ Diabaikan", "Tidak error"],
            ["HTML <b> <i>", "❌ Dihapus otomatis", "Demi keamanan"],
          ]}
        />
      </Bagian>

      {/* ===== 9. Template ===== */}
      <Bagian no="9" judul="Template siap pakai">
        <p className="mb-3 text-ink2 text-sm">
          Salin template di bawah → buka{" "}
          <Link
            to="/studio"
            className="text-accent underline underline-offset-4">
            Studio
          </Link>{" "}
          → hapus isi editor → tempel → lihat pratinjaunya → Publish. Selesai:
          buku interaktif pertamamu tayang.
        </p>
        <pre className="p-5 overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap card">
          {TEMPLATE}
        </pre>
        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={salin} className="btn btn-p">
            {copied ? "✓ Tersalin ke clipboard!" : "⧉ Salin template"}
          </button>
          <Link to="/studio" className="btn btn-o">
            Buka Studio →
          </Link>
        </div>
      </Bagian>

      {/* ===== Alur singkat ===== */}
      <section className="mt-14 p-6 md:p-8 card">
        <p className="mb-4 lbl">Ringkasan 4 langkah</p>
        <div className="gap-4 grid sm:grid-cols-4 text-sm text-center">
          {[
            ["1", "Tulis / tempel naskah ber-markap"],
            ["2", "Pilih judul & genre"],
            ["3", "Cek pratinjau"],
            ["4", "Publish → tayang untuk semua"],
          ].map(([n, t]) => (
            <div key={n}>
              <span className="place-items-center grid bg-accent mx-auto rounded-full w-8 h-8 font-display font-bold text-white">
                {n}
              </span>
              <p className="mt-2 text-ink2 leading-snug">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-ink2 text-sm text-center">
        Siap menulis?{" "}
        <Link to="/studio" className="text-accent underline underline-offset-4">
          Mulai di Studio
        </Link>{" "}
        — atau{" "}
        <Link to="/impor" className="text-accent underline underline-offset-4">
          impor naskahmu
        </Link>
        .
      </p>
    </div>
  );
}
