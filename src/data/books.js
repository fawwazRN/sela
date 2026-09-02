export const ACC = {
  Pelajaran: "#2F5D50",
  Fiksi: "#B3402A",
  Sejarah: "#8A5A2B",
  Puisi: "#5B4B8A",
  Anak: "#C2571F",
  Umum: "#6E675B",
};

export const MODE = {
  fokus: {
    n: "Mode Fokus",
    d: "Kuis, diagram interaktif, ringkasan — buku pelajaran yang bicara bahasa manusia.",
  },
  imersi: {
    n: "Mode Imersi",
    d: "Tipografi novel, antarmuka menghilang. Hanya kamu dan ceritanya.",
  },
  linimasa: {
    n: "Mode Linimasa",
    d: "Garis waktu menyala mengikuti tahun yang sedang kamu baca.",
  },
  lambat: {
    n: "Mode Lambat",
    d: "Satu bait per layar. Puisi tidak dibaca cepat.",
  },
  ceria: {
    n: "Mode Ceria",
    d: "Huruf besar, kata sulit bisa diketuk, dan tombol bacakan.",
  },
};
export const G2M = {
  Pelajaran: "fokus",
  Fiksi: "imersi",
  Sejarah: "linimasa",
  Puisi: "lambat",
  Anak: "ceria",
  Umum: "imersi",
};

export const DIK = {
  rembulan: "satelit alami Bumi yang memantulkan cahaya matahari",
  hujan: "turunnya air dari awan ke bumi dalam butiran",
  sunyi: "tidak ada suara sama sekali; sepi",
  fotosintesis: "proses tumbuhan membuat makanan dari cahaya matahari",
  kudeta: "penggantian kekuasaan dengan cara melanggar aturan",
};

export const BOOKS = [
  {
    id: "ipa-5",
    slug: "ipa-kelas-5",
    judul: "IPA Ceria: Kelas 5",
    penulis: "Tim Sela",
    genre: "Pelajaran",
    durasi: 210,
    desc: "Sains yang diajak ngobrol: fotosintesis, ekosistem, dan tata surya — dengan kuis di tiap akhir bab.",
    bab: [
      {
        judul: "Fotosintesis: Dapur Sang Daun",
        isi: [
          {
            t: "p",
            v: "Setiap pagi, daun membuka jutaan mulut kecil bernama stomata. Udara masuk, cahaya jatuh, dan dapur mulai bekerja. Prosesnya disebut <b>fotosintesis</b> — tumbuhan membuat makanannya sendiri dari cahaya, air, dan karbon dioksida.",
          },
          {
            t: "diagram",
            v: {
              label: "Bahan → Hasil fotosintesis",
              items: ["Cahaya matahari", "Air (H₂O)", "Karbon dioksida (CO₂)"],
              out: ["Glukosa (makanan)", "Oksigen (O₂)"],
            },
          },
          {
            t: "p",
            v: "Tanpa proses ini, tidak ada oksigen untuk kita bernapas. Jadi setiap tarikan napas adalah hadiah dari daun.",
          },
        ],
        ringkasan:
          "Fotosintesis = cahaya + air + CO₂ → glukosa + oksigen, terjadi di kloroplas daun.",
        kuis: {
          q: "Apa saja hasil dari fotosintesis?",
          o: ["Glukosa & oksigen", "Karbon & nitrogen", "Air & garam"],
          a: 0,
        },
      },
      {
        judul: "Ekosistem: Siapa Makan Siapa",
        isi: [
          {
            t: "p",
            v: "Di sawah ada padi, belalang, katak, ular, dan elang. Rangkaian 'siapa makan siapa' ini disebut <b>jaring-jaring makanan</b> — cara energi berpindah dari matahari ke makhluk hidup.",
          },
          {
            t: "p",
            v: "Kalau satu hilang, semua goyah. Katak habis? Belalang meledak, padi pun rusak.",
          },
        ],
        ringkasan:
          "Energi mengalir: matahari → produsen → konsumen. Satu hilang, rantai goyah.",
        kuis: {
          q: "Ujung dari rantai makanan dimulai dari…",
          o: ["Matahari", "Elang", "Ular"],
          a: 0,
        },
      },
    ],
  },
  {
    id: "kancil",
    slug: "kancil-dan-rembulan",
    judul: "Kancil dan Rembulan",
    penulis: "Adaptasi Cerita Rakyat",
    genre: "Anak",
    durasi: 15,
    desc: "Cerita rakyat klasik untuk pembaca muda — kata sulit bisa diketuk, dan bisa dibacakan.",
    bab: [
      {
        judul: "Malam yang Sunyi",
        isi: [
          {
            t: "p",
            v: "Pada suatu malam yang sangat sunyi, si {Kancil} berjalan di tepi hutan. Langit cerah, rembulan purnama bersinar terang.",
          },
          {
            t: "p",
            v: "Tiba-tiba hujan rintik-rintik turun. Kancil berlari mencari tempat berteduh — dan menemukan lubang besar di tanah.",
          },
        ],
        ringkasan: null,
        kuis: null,
      },
    ],
  },
  {
    id: "merdeka",
    slug: "menuju-merdeka",
    judul: "Menuju Merdeka 1945–1950",
    penulis: "Dra. Ratna W.",
    genre: "Sejarah",
    durasi: 180,
    desc: "Perjalanan bangsa dari proklamasi hingga pengakuan kedaulatan, dalam linimasa hidup.",
    bab: [
      {
        judul: "17 Agustus 1945",
        isi: [
          {
            t: "tl",
            y: "1945",
            v: "Proklamasi dibacakan di Jalan Pegangsaan Timur 56. Radio menularkan kabar itu ke seluruh Nusantara.",
          },
          {
            t: "tl",
            y: "1946",
            v: "Ibu kota pindah ke Yogyakarta. Perundingan dimulai — dan berulang kali buntu.",
          },
          {
            t: "tl",
            y: "1948",
            v: "Agresi Militer Belanda II. Dunia mulai memperhatikan.",
          },
          {
            t: "tl",
            y: "1949",
            v: "KMB di Den Haag: kedaulatan diakui. 27 Desember, bendera merah-putih berkibar penuh.",
          },
        ],
        ringkasan: "Proklamasi 1945 → diplomasi & perlawanan → KMB 1949.",
        kuis: null,
      },
    ],
  },
  {
    id: "hujan",
    slug: "hujan-di-balkon",
    judul: "Hujan di Balkon",
    penulis: "Sastrawan Senja",
    genre: "Puisi",
    durasi: 10,
    desc: "Kumpulan puisi pendek tentang kota, hujan, dan orang yang menunggu.",
    bab: [
      {
        judul: "Tiga Bait",
        isi: [
          {
            t: "verse",
            v: ["Kota ini tak pernah kering,", "hanya berpura-pura hangat"],
          },
          {
            t: "verse",
            v: [
              "Aku menunggu di balkon lantai tiga,",
              "menghitung tetes yang tak sampai ke tanah",
            ],
          },
          { t: "verse", v: ["Dan hujan —", "hujan selalu tahu jalan pulang."] },
        ],
        ringkasan: null,
        kuis: null,
      },
    ],
  },
  {
    id: "kudeta",
    slug: "malam-kudeta",
    judul: "Malam Kudeta",
    penulis: "B. Hartanto",
    genre: "Fiksi",
    durasi: 320,
    desc: "Thriller politik: seorang jurnalis muda menemukan dokumen yang tidak seharusnya ada.",
    bab: [
      {
        judul: "Telepon Pukul Tiga",
        isi: [
          {
            t: "p",
            v: "Telepon berdering pukul tiga pagi. {Reza} tahu, panggilan jam segini tidak pernah membawa kabar baik.",
          },
          {
            t: "p",
            v: '"Kamu mau tahu soal kudeta tahun lalu?" suara itu pelan, nyaris berbisik. "Datang sendiri. Jangan pakai telepon lagi."',
          },
          {
            t: "p",
            v: "Sunyi kembali mengisi apartemen. Di luar, kota terus berpura-pura tertidur.",
          },
        ],
        ringkasan: null,
        kuis: null,
      },
    ],
  },
];

export const KURASI = [
  {
    slug: "bikin-paham",
    judul: "Bikin Paham",
    desc: "Buku pelajaran yang benar-benar menjelaskan.",
    ids: ["ipa-5"],
  },
  {
    slug: "15-menit",
    judul: "Cerita 15 Menit",
    desc: "Selesai baca sebelum teh dingin.",
    ids: ["kancil", "hujan"],
  },
  {
    slug: "malam-berat",
    judul: "Untuk Malam yang Berat",
    desc: "Cerita yang menemani, bukan menghakimi.",
    ids: ["kudeta", "merdeka"],
  },
];

export const GENRES_LIST = [
  "Umum",
  "Pelajaran",
  "Fiksi",
  "Sejarah",
  "Puisi",
  "Anak",
];
