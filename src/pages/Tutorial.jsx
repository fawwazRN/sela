import { useEffect, useState } from "react";
import { Link } from "react-router";

const TEMPLATE = `# Bab Satu: Awal Mula

Di hutan yang lebat, hiduplah {Kancil} yang terkenal cerdik. Ia percaya **kesabaran** mengalahkan kecepatan.

> Harta sejati adalah ilmu yang dibagi.

Sahabat-sahabatnya di hutan:
- {Kura-kura} yang pelan tapi teliti
- {Elang} yang selalu terburu-buru

## Perjalanan Kancil

@tl 1901 | Kancil lahir di tepi sungai yang jernih.
@tl 1910 | Pertama kali menaklukkan buaya yang sombong.
@tl 1920 | Persahabatan dengan {Kura-kura} dimulai.

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

const SECTIONS = [
  ["mulai", "Dua cara memulai"],
  ["struktur", "Bab & struktur"],
  ["format", "Format teks"],
  ["daftar", "Daftar, kutipan, callout"],
  ["kode", "Blok kode & tabel"],
  ["tokoh", "Tokoh & glosarium"],
  ["genre", "Genre & mode"],
  ["batasan", "Yang belum didukung"],
  ["template", "Template siap pakai"],
];

function Kode({ children, salin = true }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="group relative">
      <pre className="bg-card p-3 pr-14 border border-line rounded-lg overflow-x-auto font-mono text-[13px] whitespace-pre">
        {children}
      </pre>
      {salin && (
        <button
          onClick={() =>
            navigator.clipboard.writeText(children).then(() => {
              setOk(true);
              setTimeout(() => setOk(false), 1500);
            })
          }
          className="top-2 right-2 absolute opacity-0 group-hover:opacity-100 !px-2 !py-0.5 text-[10px] transition-opacity chip">
          {ok ? "✓" : "⧉"}
        </button>
      )}
    </div>
  );
}

function Tabel({ rows, head = ["Kamu tulis", "Jadi", "Catatan"] }) {
  return (
    <div className="border border-line rounded-xl overflow-hidden">
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
            <tr
              key={i}
              className="hover:bg-line/15 border-line border-t align-top transition-colors">
              <td className="px-4 py-3 font-mono text-[13px] text-ink whitespace-nowrap">
                {r[0]}
              </td>
              <td className="px-4 py-3">{r[1]}</td>
              <td className="px-4 py-3 text-ink2">{r[2] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bagian({ id, no, judul, children }) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
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
  const [aktif, setAktif] = useState("mulai");

  /* tandai bagian yang sedang dibaca */
  useEffect(() => {
    const ob = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setAktif(e.target.id);
        }),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) ob.observe(el);
    });
    return () => ob.disconnect();
  }, []);

  const salin = () => {
    navigator.clipboard.writeText(TEMPLATE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-6xl fadein">
      {/* ===== HERO ===== */}
      <div
        className="relative mb-10 p-8 md:p-10 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5B4B8A, #1A1815)" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-[11px] text-white/60 uppercase tracking-[0.3em]">
            Panduan penulis
          </p>
          <h1 className="mt-2 font-display font-bold text-white text-3xl md:text-5xl leading-tight">
            Cara membuat buku
            <br />
            di Sela
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-white/70 leading-relaxed">
            Semua buku ditulis dengan{" "}
            <b className="text-white">Markdown sederhana</b> — tanda khusus yang
            mengubah teks biasa menjadi bab, kuis, kutipan, hingga tokoh
            interaktif. Tanpa install apa pun: tulis di{" "}
            <Link
              to="/studio"
              className="text-white underline underline-offset-4">
              Studio
            </Link>
            , atau impor{" "}
            <code className="bg-white/15 px-1.5 py-0.5 rounded text-white">
              .md
            </code>{" "}
            di{" "}
            <Link
              to="/impor"
              className="text-white underline underline-offset-4">
              halaman Impor
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {["9 bab panduan", "Template siap salin", "±5 menit selesai"].map(
              (t) => (
                <span
                  key={t}
                  className="bg-white/10 px-2.5 py-1 rounded-full text-[11px] text-white/80">
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-10">
        {/* ===== SIDEBAR TOC ===== */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="top-20 sticky">
            <p className="mb-3 lbl">Daftar isi</p>
            <div className="flex flex-col gap-0.5">
              {SECTIONS.map(([id, judul], i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[13px] transition-colors ${aktif === id ? "bg-accent/10 text-accent font-medium" : "text-ink2 hover:text-ink hover:bg-line/30"}`}>
                  <span
                    className={`text-[10px] tabular-nums ${aktif === id ? "text-accent" : "text-ink2/60"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {judul}
                </a>
              ))}
            </div>
            <div className="mt-6 p-3.5 card">
              <p className="mb-1 font-medium text-xs">Mau langsung?</p>
              <p className="text-[11px] text-ink2 leading-relaxed">
                Salin template di bagian 9, tempel di Studio, publish. Selesai.
              </p>
              <Link
                to="/studio"
                className="mt-2 !px-3 !py-1.5 w-full text-[11px] btn btn-p">
                Buka Studio
              </Link>
            </div>
          </div>
        </aside>

        {/* ===== KONTEN ===== */}
        <div className="flex-1 min-w-0">
          <Bagian id="mulai" no="1" judul="Dua cara memulai">
            <div className="gap-4 grid md:grid-cols-2">
              <Link
                to="/studio"
                className="relative p-5 hover:border-ink overflow-hidden transition-colors card">
                <span className="top-0 right-0 left-0 absolute bg-accent h-0.5" />
                <p className="font-display font-semibold text-lg">
                  Studio — tulis di web
                </p>
                <p className="mt-1.5 text-ink2 text-sm leading-relaxed">
                  Login → Studio → Tulis baru. Panel kiri menulis, kanan
                  pratinjau hasil aslinya live. Toolbar sisip siapkan kuis &
                  timeline. Publish saat selesai.
                </p>
                <p className="mt-3 text-[11px] text-accent">
                  Cocok untuk mulai dari nol →
                </p>
              </Link>
              <Link
                to="/impor"
                className="relative p-5 hover:border-ink overflow-hidden transition-colors card">
                <span className="top-0 right-0 left-0 absolute bg-line h-0.5" />
                <p className="font-display font-semibold text-lg">
                  Impor — file .md jadi
                </p>
                <p className="mt-1.5 text-ink2 text-sm leading-relaxed">
                  Naskah sudah ada di Word/Notion/Obsidian? Rapikan jadi
                  Markdown, simpan .md, unggah. Bab terdeteksi otomatis.
                </p>
                <p className="mt-3 text-[11px] text-accent">
                  Cocok untuk naskah yang sudah ada →
                </p>
              </Link>
            </div>
          </Bagian>

          <Bagian id="struktur" no="2" judul="Bab & struktur">
            <p className="mb-3 text-ink2 text-sm">
              Aturan paling penting:{" "}
              <b>
                satu <code className="bg-line/50 px-1 rounded">#</code> = satu
                bab.
              </b>
            </p>
            <Tabel
              rows={[
                ["# Judul Bab", "BAB BARU", "Wajib ada spasi setelah #"],
                [
                  "## Sub-judul",
                  "Heading besar dalam bab",
                  "Untuk bagian penting",
                ],
                ["### Sub-sub", "Heading kecil", "Untuk rincian"],
                ["%% kalimat", "Ringkasan bab", "Tampil otomatis di akhir bab"],
                [
                  "@?? Soal? | A | B* | C",
                  "Kuis pilihan ganda",
                  "Tanda * = jawaban benar",
                ],
                [
                  "@tl Tahun | Peristiwa",
                  "LINIMASA",
                  "Berurutan jadi garis waktu; tahun menyala mengikuti scroll",
                ],
              ]}
            />
            <div className="gap-4 grid sm:grid-cols-2 mt-4">
              <div>
                <p className="mb-2 font-medium text-xs">Kamu tulis</p>
                <Kode>{`@tl 1945 | Proklamasi dibacakan.
@tl 1946 | Perundingan buntu.
@tl 1949 | KMB: kedaulatan diakui.`}</Kode>
              </div>
              <div>
                <p className="mb-2 font-medium text-xs">Pembaca lihat</p>
                <div className="space-y-2.5 p-3 border border-line rounded-lg">
                  {[
                    ["1945", "Proklamasi dibacakan."],
                    ["1946", "Perundingan buntu."],
                    ["1949", "KMB: kedaulatan diakui."],
                  ].map(([y, v]) => (
                    <div key={y} className="flex gap-3">
                      <span className="w-10 font-display font-bold text-accent text-sm shrink-0">
                        {y}
                      </span>
                      <span className="pl-3 border-line border-l text-[13px] text-ink2">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-ink2 text-xs">
              Paling maksimal di genre <b>Sejarah</b> (Mode Linimasa).
            </p>
          </Bagian>

          <Bagian id="format" no="3" judul="Memformat teks">
            <Tabel
              rows={[
                ["**teks**", <b key="b">Tebal</b>, ""],
                [
                  "*teks*",
                  <i key="i">Miring</i>,
                  "Tanpa spasi di dalam bintang",
                ],
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

          <Bagian id="daftar" no="4" judul="Daftar, kutipan & callout">
            <Tabel
              rows={[
                ["- item", "• Daftar bullet", "* item juga bisa"],
                ["1. item", "1. Daftar bernomor", ""],
                ["> kalimat", "Kutipan miring + garis aksen", ""],
                [
                  "> * item",
                  "Kotak aksen berbullet (callout)",
                  "Untuk poin penegasan",
                ],
              ]}
            />
          </Bagian>

          <Bagian id="kode" no="5" judul="Blok kode & tabel">
            <p className="mb-3 text-ink2 text-sm">
              Bungkus kode dengan tiga backtick —{" "}
              <b>semua simbol di dalamnya dijamin aman</b> (
              <code className="bg-line/50 px-1 rounded">{"{ }"}</code>,{" "}
              <code className="bg-line/50 px-1 rounded">*</code>, dll):
            </p>
            <Kode>{"```\nconst x = { nilai: 1 };\n```"}</Kode>
            <p className="mt-5 mb-3 text-ink2 text-sm">
              Tabel: baris pertama = header, baris kedua = pemisah:
            </p>
            <div className="gap-4 grid sm:grid-cols-2">
              <Kode>
                {
                  "| Hewan | Ciri |\n| --- | --- |\n| Kancil | Cerdik |\n| Kura-kura | Sabar |"
                }
              </Kode>
              <div className="self-start border border-line rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-line/30">
                      <th className="px-3 py-2 font-display text-[13px] text-left">
                        Hewan
                      </th>
                      <th className="px-3 py-2 font-display text-[13px] text-left">
                        Ciri
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Kancil", "Cerdik"],
                      ["Kura-kura", "Sabar"],
                    ].map(([a, b]) => (
                      <tr key={a} className="border-line border-t">
                        <td className="px-3 py-2">{a}</td>
                        <td className="px-3 py-2 text-ink2">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Bagian>

          <Bagian id="tokoh" no="6" judul="Tokoh — fitur khas Sela">
            <p className="mb-3 text-ink2 text-sm">
              Bungkus nama dengan kurung kurawal → pembaca bisa{" "}
              <b>mengetuk namanya</b> untuk melihat statistik kemunculannya di
              bab itu.
            </p>
            <Tabel
              rows={[
                ["{Kancil}", "Kartu tokoh ✓", "Kapital di awal, 1–3 kata"],
                ["{Prof McClintock}", "Kartu tokoh multi-kata ✓", ""],
                ["{kancil}", "Tampil literal", "Huruf kecil = bukan tokoh"],
                ["{ x = 1 }", "Tampil literal", "Ada simbol = bukan tokoh"],
              ]}
            />
            <div className="gap-4 grid sm:grid-cols-2 mt-4">
              <div className="p-4 card">
                <p className="mb-2 font-medium text-xs">Kamu tulis</p>
                <Kode>{"Di hutan, hiduplah {Kancil} yang cerdik."}</Kode>
              </div>
              <div>
                <p className="mb-2 font-medium text-xs">
                  Pembaca lihat (ketuk namanya)
                </p>
                <div className="p-4 border border-line rounded-lg text-[15px]">
                  Di hutan, hiduplah{" "}
                  <span className="decoration-accent decoration-dotted underline underline-offset-4">
                    Kancil
                  </span>{" "}
                  yang cerdik.
                  <div className="inline-block bg-line/30 mt-2 px-2 py-1.5 rounded-md text-[11px] text-ink2">
                    Tokoh — disebut <b className="text-ink">3×</b> di bab ini.
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 text-sm card">
              <p className="mb-1 font-display font-semibold">
                Kata glosarium — tanpa markap!
              </p>
              <p className="text-ink2 leading-relaxed">
                Ingin kata punya arti saat diketuk (<i>fotosintesis</i>,{" "}
                <i>kudeta</i>)? Tambahkan di{" "}
                <Link
                  to="/glosarium"
                  className="text-accent underline underline-offset-4">
                  Glosarium
                </Link>
                . Tulis katanya normal di naskah — semua kemunculan otomatis
                bisa diketuk.
              </p>
            </div>
          </Bagian>

          <Bagian id="genre" no="7" judul="Genre — mode baca mengikuti">
            <Tabel
              head={["Genre", "Mode baca", "Cocok untuk"]}
              rows={[
                ["Pelajaran", "Fokus", "Kuis + ringkasan aktif"],
                [
                  "Fiksi (semua varian)",
                  "Imersi",
                  "Novel — antarmuka menghilang",
                ],
                ["Sejarah", "Linimasa", "Garis waktu menyala"],
                ["Puisi", "Lambat", "Satu bait per layar"],
                ["Anak", "Ceria", "Huruf besar + bacakan"],
                ["Umum", "Imersi", "Standar"],
              ]}
            />
          </Bagian>

          <Bagian id="batasan" no="8" judul="Yang belum didukung">
            <Tabel
              head={["Tulisan", "Status", ""]}
              rows={[
                ["![gambar](url)", "Belum ada", "Reader fokus pada teks"],
                ["[link](url)", "Belum didukung", ""],
                ["--- garis horizontal", "Diabaikan", "Tidak error"],
                ["HTML <b> <i>", "Dihapus otomatis", "Demi keamanan"],
              ]}
            />
          </Bagian>

          <Bagian id="template" no="9" judul="Template siap pakai">
            <p className="mb-3 text-ink2 text-sm">
              Salin → buka{" "}
              <Link
                to="/studio"
                className="text-accent underline underline-offset-4">
                Studio
              </Link>{" "}
              → tempel → cek pratinjau → Publish. Buku interaktif pertamamu
              tayang.
            </p>
            <div className="relative">
              <pre className="bg-card p-5 border border-line rounded-xl overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                {TEMPLATE}
              </pre>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={salin} className="btn btn-p">
                {copied ? "✓ Tersalin ke clipboard!" : "Salin template"}
              </button>
              <Link to="/studio" className="btn btn-o">
                Buka Studio →
              </Link>
            </div>
          </Bagian>

          {/* RINGKASAN */}
          <section className="relative mt-16 p-6 md:p-8 overflow-hidden card">
            <span className="top-0 right-0 left-0 absolute bg-accent h-0.5" />
            <p className="mb-5 lbl">Ringkasan 4 langkah</p>
            <div className="gap-5 grid sm:grid-cols-4 text-sm text-center">
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

          <p className="mt-12 text-ink2 text-sm text-center">
            Siap menulis?{" "}
            <Link
              to="/studio"
              className="text-accent underline underline-offset-4">
              Mulai di Studio
            </Link>{" "}
            — atau{" "}
            <Link
              to="/impor"
              className="text-accent underline underline-offset-4">
              impor naskahmu
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
