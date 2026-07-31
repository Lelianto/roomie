# Tailwind-First Refactor + Perbaikan Kualitas Kode

Hasil audit: proyek ini secara fungsional sehat, tapi ada **6 bug nyata**, **logika bisnis tercampur di komponen**, **page.tsx 952 baris**, dan **test yang meng-assert source code pakai regex**. Sesuai pilihan Anda, style akan digeser ke Tailwind dan CSS custom diminimalkan.

## Peringatan cakupan (baca ini dulu)

Migrasi CSS ke Tailwind di proyek ini **bukan pekerjaan kecil**: 2341 baris, 106 class, 257 blok selector, 5 media query. Ini bukan `globals.css` boilerplate — ini design system yang ditulis tangan (typography `clamp()`, padding `vw`, `backdrop-filter`, `mask-mode: luminance`, state `:popover-open`).

Konsekuensi yang perlu Anda terima:
- **Risiko regresi visual nyata.** Mitigasinya: migrasi per komponen, dan setiap komponen diverifikasi screenshot di 4 breakpoint (1180 / 900 / 480 / 360) sebelum blok CSS-nya dihapus.
- **Sebagian markup akan lebih ramai.** `text-[clamp(48px,5.5vw,80px)]` kalah baca dibanding `font-size: clamp(...)`. Karena itu **task 4 (pecah komponen) wajib dulu** — menempel 30 utility ke file 952 baris akan jadi tidak terbaca.
- **~30 baris tidak akan dipaksa ke utility.** Layer scene, mask, dan keyframes tetap authored CSS. Memaksanya jadi arbitrary value hanya menambah kerumitan tanpa manfaat.
- **Tahap 5, 6, 7 bisa dihentikan di mana saja** tanpa meninggalkan proyek dalam keadaan rusak. Tiap tahap berakhir dengan build hijau.

---

## Task 1 — Perbaiki 6 bug nyata

Semua ini independen dari styling, jadi dikerjakan lebih dulu.

| # | Lokasi | Masalah | Perbaikan |
|---|--------|---------|-----------|
| 1 | `app/ui.tsx:309-315` | `node.showPopover()` dipanggil lagi saat alert kedua masuk (dep effect `alerts.length` berubah 1→2) padahal popover sudah terbuka. Per spec ini melempar `InvalidStateError`. | Guard `if (!node.matches(":popover-open"))` sebelum `showPopover()`, simetris dengan guard hide yang sudah ada. |
| 2 | `app/ui.tsx:288-295` | `notify` menjadwalkan `setTimeout` tanpa pernah dibersihkan. Timer tetap hidup setelah unmount dan memanggil `setState`. | Simpan id timer di `useRef`, `clearTimeout` semuanya di cleanup effect. |
| 3 | `app/page.tsx:91-98` | `Availability` hardcode `"{stock} available in Bali"`, padahal `location` bisa dipilih Jakarta/Surabaya. Header di baris 496 menampilkan `Demo inventory · Jakarta` sementara tiap kartu bilang "available in Bali". Inkonsistensi yang terlihat user. | Terima `location` sebagai prop dan pakai nilai terpilih. |
| 4 | `lib/catalog.ts:340-343` | `initialSetup` memakai `bundles[1]` — magic index yang senyap salah kalau urutan array berubah. | Cari lewat id: `bundles.find((b) => b.id === "creator")`, gagal keras bila tidak ada. |
| 5 | `app/page.tsx:70-89, 718, 823` | `<img sizes="160px">` tanpa `srcSet` sama sekali tidak berefek — atribut mati yang menyiratkan optimasi responsif yang tidak ada. | Hapus `sizes`, ganti `width`/`height` intrinsik agar browser bisa reserve ruang dan CLS turun. |
| 6 | `app/ui.tsx:113-130` | `role="listbox"` berisi `<li>` biasa, `role="option"` ada di `<button>` di dalamnya. Ownership listbox→option putus, jadi screen reader tidak mengumumkan "1 dari 3". Navigasi keyboard juga tidak memindahkan fokus DOM tanpa `aria-activedescendant`. | Pindahkan `role="option"` + `id` ke elemen anak langsung listbox, tambahkan `aria-activedescendant` di trigger combobox. |

## Task 2 — Fondasi Tailwind

`app/globals.css` sudah `@import "tailwindcss"` tapi **nol utility class dipakai** — saat ini Tailwind hanya menyumbang preflight. Aktifkan betulan:

```css
@import "tailwindcss";

@theme {
  --color-ink: #1f2524;
  --color-paper: #f6f4ed;
  --color-accent: #c54220;
  --color-lime: #d8eaa3;
  /* ...16 token dari :root yang ada */

  --font-mona: "Mona Sans", "Helvetica Neue", sans-serif;

  /* Breakpoint dicocokkan ke media query yang sudah ada supaya port-nya mekanis */
  --breakpoint-wide: 1180px;
  --breakpoint-lap: 900px;
  --breakpoint-mob: 480px;
  --breakpoint-tiny: 360px;
}
```

Kenapa breakpoint didaftarkan: CSS ini **desktop-first** (`max-width`), Tailwind **mobile-first**. Dengan token di atas, tiap aturan `@media (max-width: 900px)` jadi `max-lap:` — pemetaan 1:1, tanpa perlu membalik logika responsif dan tanpa perlu menebak ulang niat desain.

Sekalian: `.sr-only` custom di baris 67-77 dihapus, Tailwind sudah menyediakan `sr-only`.

## Task 3 — Ekstrak logika ke modul murni

Saat ini `subtotal`, `discount`, `deliveryFee`, `orderTotal` dihitung di dalam body komponen (`page.tsx:310-317`) sehingga tidak bisa diuji tanpa merender React.

- **`lib/pricing.ts`** — pindahkan `productPrice`, `setupPrice` dari catalog, tambah `subtotalOf(products, cycle)`, `deliveryFeeFor(type)`, `orderTotalOf(...)`. Konstanta bernama menggantikan angka gelap: `PRIORITY_DELIVERY_FEE = 5`, `MONTHLY_WEEKS = 4`, `MONTHLY_DISCOUNT = 0.25`.
- **`lib/format.ts`** — `formatMoney`, `cycleLabel`.
- **`lib/date.ts`** — `toKey`, `fromKey`, `todayKey` keluar dari `ui.tsx` (helper tanggal bukan urusan komponen UI).
- **`lib/constants.ts`** — `STORAGE_KEY = "roomie-workspace-v2"` (sekarang literal yang diulang 3×), `LOCATIONS`, `ALERT_TIMEOUT_MS`.
- **`lib/catalog.ts`** — export ambang layer chair mask. `page.tsx:123-124` memfilter `placement.zIndex < 3` dengan angka 3 yang harus cocok dengan `depthLayer` di catalog; kopling tersembunyi antar file. Ganti jadi helper `splitByChairMask(placements)`.

## Task 4 — Pecah komponen

`page.tsx` 952 baris memuat 4 komponen, 13 `useState`, 2 dialog, dan seluruh markup. Pecah menjadi:

```
app/
  page.tsx                    ~230 baris: state + komposisi saja
  hooks/usePersistentSetup.ts restore/persist localStorage + guard isWorkspaceSetup
  components/
    WorkspaceScene.tsx        layer scene + overlay accessory
    ProductCard.tsx           kartu katalog + badge harga
    ProductPhoto.tsx
    Availability.tsx
    BundleCard.tsx
    StepNav.tsx
    ProductDetailsDialog.tsx
    ReviewDialog.tsx          form checkout + ringkasan order
    ui/SelectField.tsx
    ui/DateField.tsx
    ui/AlertStack.tsx
```

Ini prasyarat task 5-7: utility Tailwind hanya terbaca kalau tiap komponen sepanjang puluhan baris, bukan ratusan.

## Task 5 — Migrasi style: bagian statis

Urut dari yang paling rendah risiko. Per komponen: tempel utility → screenshot 4 breakpoint → bandingkan dengan sebelum → hapus blok CSS-nya.

1. `footer` (4 selector)
2. `.trust-section`, `.trust-heading`, `.trust-grid` (11 selector — termasuk perubahan mobile yang baru saja kita commit)
3. `.intro`, `.intro-side`, `.cycle-switch`, `.eyebrow` (13 selector)
4. `.app-header`, `.brand`, `.rental-context`, `.header-review` (12 selector, ada `backdrop-filter` → `backdrop-blur-[18px]`)
5. `.bundle-section`, `.bundle-card`, `.bundle-row` (14 selector)

## Task 6 — Migrasi style: katalog, dialog, form

Bagian terbesar, paling banyak state varian (`.selected`, `.active`, `aria-expanded`, `:disabled`).

1. `.real-product-card` + `.photo-wrap` + `.card-*` + badge (28 selector)
2. `.step-nav`, `.catalog-*`, `.product-grid` (16 selector)
3. `.sheet-dialog`, `.dialog-*`, `.detail-*` (24 selector)
4. `.review-*`, `.checkout-*`, `.order-summary`, `.delivery-options` (26 selector)
5. `.field*`, `.select-*`, `.date-*`, `.app-alert`, `.alert-stack` (30 selector — state pakai varian `aria-expanded:` dan `[&:popover-open]:`)
6. `.mobile-rent-bar`, `.mobile-scene-panel`, `.preview-*` (14 selector)

## Task 7 — Sisakan yang memang bespoke

Yang **tetap** authored CSS, dengan alasan eksplisit di komentar:

- `@font-face` Mona Sans — bukan wilayah utility.
- Stack `.scene-room` / `.scene-composite` / `.scene-chair-mask` / `.scene-stage-*` — `mask-mode: luminance` plus z-index berlapis yang dihitung runtime; sebagai arbitrary value hasilnya lebih buruk, bukan lebih baik.
- `@keyframes` + reset `::-webkit-scrollbar`.
- Blok `prefers-reduced-motion`.

Target: **globals.css dari 2341 → di bawah 300 baris.** Kalau angka akhirnya jauh di atas itu, saya laporkan bagian mana yang menolak dimigrasikan dan alasannya, bukan dipaksakan.

## Task 8 — Test, quality gate, CI

Test sekarang mem-`grep` source code — `assert.match(page, /bundleId: resolveBundleId\(next\)/)` akan pecah begitu file dipecah, dan sebenarnya tidak membuktikan perilaku apa pun.

Pilihan Anda: **unit test asli + pertahankan smoke HTML.**

- **Baru** `tests/pricing.test.mjs` — harga weekly vs monthly, diskon bundle, biaya priority, total order. Import langsung dari `lib/pricing.ts` (Node 22 sudah strip types tanpa flag).
- **Baru** `tests/bundle.test.mjs` — `resolveBundleId`: cocok persis, lepas saat add-on dibuang, lepas saat desk ditukar, kembali saat dipasang ulang. Ini yang menjaga bug revenue leak kemarin tidak balik.
- **Baru** `tests/scene.test.mjs` — `resolveScenePlacements`: urutan z-index, baseline per desk, accessory tanpa slot diabaikan.
- **Baru** `tests/date.test.mjs` — `fromKey` tidak bergeser karena UTC, batas backdate.
- **Dipertahankan** `tests/rendered-html.test.mjs` — assertion terhadap HTML prerender (judul, konten kunci, aset scene). Assertion regex terhadap source dibuang.
- **Script**: tambah `typecheck: tsc --noEmit`, pisah `test:unit` (cepat, tanpa build) dari `test` (typecheck + lint + unit + build + smoke).
- **CI** `.github/workflows/ci.yml` — Node 22, jalankan typecheck + lint + test tiap push/PR.

---

## Verifikasi

Setiap task berakhir dengan: `npm run typecheck` bersih, `npm run lint` bersih, `npm test` hijau. Task 5-7 tambahan: screenshot 1180 / 900 / 480 / 360 dibandingkan dengan kondisi sebelum migrasi. Commit dipisah per task supaya mudah di-revert kalau ada satu tahap yang meleset.

## Yang sengaja TIDAK dikerjakan

- **Migrasi ke `next/image`** — art scene sudah pre-baked dan diposisikan persen; `next/image` tidak menambah nilai untuk overlay yang absolut, dan `<img>` di sini keputusan sadar (sudah didokumentasikan di README).
- **Persist cycle/date/address/deliveryType** — Anda sudah menolak ini sebelumnya, tidak saya bawa lagi.
- **Backend/pembayaran nyata** — di luar cakupan demo.
