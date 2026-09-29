# Villa Senyap

Tur villa berpandu di peramban — empat pemberhentian: **eksterior → ruang tamu → kamar → dek**.

## Stack

- Next.js (App Router) + TypeScript
- React Three Fiber + Drei + three.js
- Satu file glTF asli (`public/models/villa.glb`, satuan meter) dengan objek bernama: `eksterior`, `ruang tamu`, `kamar`, `dek`
- Overlay HTML untuk hotspot dan rel langkah (bukan objek di dalam glTF)
- Fallback foto diam jika WebGL tidak tersedia

## Menjalankan

```bash
npm install
npm run generate   # membuat villa.glb + stills
npm run dev
npm run build
```

## Kontrol

- Hotspot maju di setiap stop (kecuali dek)
- Rel empat langkah di bawah layar untuk lompat ke stop mana pun
- Kamera bergerak di sepanjang jalur beranimasi — tanpa orbit bebas, WASD, atau drag-to-look

## Hak cipta

Model villa dibuat khusus untuk proyek ini. Tidak menyalin branding, copy, atau aset dari referensi eksternal.
