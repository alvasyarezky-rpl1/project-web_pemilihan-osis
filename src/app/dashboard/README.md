# Dashboard Structure

Struktur dashboard telah diorganisir dengan rapi sesuai dengan menu sidebar.

## Struktur Folder

Setiap menu pada sidebar memiliki folder terpisah dengan file `page.tsx`:

```
src/app/dashboard/
├── page.tsx                    # Dashboard utama
├── kelola-pengguna/
│   └── page.tsx               # Halaman kelola pengguna (Admin only)
├── kelola-kandidat/
│   └── page.tsx               # Halaman kelola kandidat (Admin & Panitia)
├── pengaturan-pemilihan/
│   └── page.tsx               # Halaman pengaturan pemilihan (Admin & Panitia)
├── hasil-pemilihan/
│   └── page.tsx               # Halaman hasil pemilihan (Admin & Panitia)
├── pilih-kandidat/
│   └── page.tsx               # Halaman pilih kandidat (Member only)
├── profil-kandidat/
│   └── page.tsx               # Halaman profil kandidat (All roles)
└── bantuan/
    └── page.tsx               # Halaman bantuan (All roles)
```

## Komponen

Semua komponen utama dipindahkan ke folder `src/components/` dengan struktur yang sesuai:

```
src/components/
├── kelola-pengguna/
│   ├── index.ts
│   └── KelolaPengguna.tsx
├── kelola-kandidat/
│   ├── index.ts
│   └── KelolaKandidat.tsx
├── pengaturan-pemilihan/
│   ├── index.ts
│   └── PengaturanPemilihan.tsx
├── hasil-pemilihan/
│   ├── index.ts
│   └── HasilPemilihan.tsx
├── pilih-kandidat/
│   ├── index.ts
│   └── PilihKandidat.tsx
├── profil-kandidat/
│   ├── index.ts
│   └── ProfilKandidat.tsx
└── bantuan/
    ├── index.ts
    └── Bantuan.tsx
```

## Role-based Access

Setiap halaman memiliki RoleGuard yang membatasi akses berdasarkan role:

- **Admin**: Akses penuh ke semua menu
- **Panitia**: Akses ke kelola kandidat, pengaturan pemilihan, hasil pemilihan, profil kandidat, dan bantuan
- **Member**: Akses ke pilih kandidat, profil kandidat, dan bantuan

## Navigasi

Sidebar menggunakan Next.js Link untuk navigasi yang smooth dan SEO-friendly. Setiap menu item akan mengarahkan ke halaman yang sesuai dengan role pengguna.
