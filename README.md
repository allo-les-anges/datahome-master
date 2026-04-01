This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
habihub-light-template
├─ app
│  ├─ api
│  │  ├─ admin
│  │  │  └─ create-client
│  │  │     └─ route.ts
│  │  ├─ agency
│  │  │  └─ route.ts
│  │  ├─ config
│  │  │  └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ properties
│  │  │  └─ route.ts
│  │  ├─ property
│  │  │  └─ [id]
│  │  │     └─ route.ts
│  │  ├─ regions
│  │  │  └─ counts
│  │  │     └─ route.ts
│  │  └─ sync-properties
│  │     └─ route.ts
│  ├─ bien
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ developpement
│  │  └─ [devId]
│  │     └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ lib
│  │  └─ supabase.ts
│  ├─ page.tsx
│  ├─ property
│  │  └─ [id]
│  │     └─ page.tsx
│  └─ solution
│     └─ page.tsx
├─ eslint.config.mjs
├─ Immo-Cashback-Revolutionizing-Real-Estate-Transactions.pdf
├─ IMMO-GLOBAL-ECOSYSTEM.pdf
├─ Master Template.pdf
├─ messages
├─ middleware.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ 1.jpg
│  ├─ 2.jpg
│  ├─ 3.1.jpg
│  ├─ 3.2.jpg
│  ├─ 3.3.jpg
│  ├─ 3.4.jpg
│  ├─ 358cd1f0-6323-4675-b604-268ba53a5d88.jpg
│  ├─ 4.jpg
│  ├─ 5 COLORS - DARK MODE.pdf
│  ├─ Abdou.jpeg
│  ├─ data_home_logo.png
│  ├─ Deborah.jpeg
│  ├─ Developpers Emirates_READY FOR EXCEL_INFO (1).pdf
│  ├─ Developpers Emirates_READY FOR EXCEL_INFO.pdf
│  ├─ era-logo.png
│  ├─ favicon-32x32.png
│  ├─ file.svg
│  ├─ Gaëtan.jpeg
│  ├─ Gillian.jpeg
│  ├─ globe.svg
│  ├─ hero-video-1.mp4
│  ├─ hero-video.mp4
│  ├─ hero_datahome.mp4
│  ├─ hero_network.jpg
│  ├─ images
│  │  ├─ african-american-lady-safety-helmet-with-papers-near-building-construction.jpg
│  │  ├─ real-estate-agents-checking-construction-works.jpg
│  │  ├─ regions
│  │  │  ├─ 1.jpg
│  │  │  ├─ 2.jpg
│  │  │  ├─ 3.jpg
│  │  │  └─ 4.jpg
│  │  └─ view-modern-construction-site.jpg
│  ├─ Joanna Pawelek.pdf.pdf
│  ├─ Joanna.jpeg
│  ├─ logo.jpeg
│  ├─ logo.jpg
│  ├─ logo_1.jpg
│  ├─ logo_1.png
│  ├─ next.svg
│  ├─ Rapport_27 février 2026.pdf
│  ├─ Rapport_Expertise_ref_123.pdf
│  ├─ Rapport_ref_123.pdf
│  ├─ Rapport_ref_123_27 février 2026 (1).pdf
│  ├─ Rapport_ref_123_27 février 2026.pdf
│  ├─ Rapport_ref_123_27_février_2026 (1).pdf
│  ├─ Rapport_ref_123_27_février_2026 (2).pdf
│  ├─ Rapport_ref_123_27_février_2026.pdf
│  ├─ Rapport_Technique_ref_123_27 février 2026.pdf
│  ├─ vercel.svg
│  ├─ window.svg
│  ├─ zone1.png
│  ├─ zone2.png
│  ├─ zone3-1.png
│  ├─ zone3-2.png
│  ├─ zone3-3.png
│  ├─ zone3-4.png
│  └─ zone4.png
├─ README.md
├─ repomix-output-light.xml
├─ repomix-output.xml
├─ src
│  ├─ app
│  │  ├─ admin
│  │  │  ├─ agencies
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]
│  │  │  └─ page.tsx
│  │  └─ api
│  │     └─ admin
│  │        └─ agencies
│  │           ├─ route.ts
│  │           └─ [id]
│  │              └─ route.ts
│  ├─ components
│  │  ├─ admin
│  │  │  └─ AgencyDashboard.tsx
│  │  ├─ AdvancedSearch.tsx
│  │  ├─ ContactForm.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Hero.tsx
│  │  ├─ LanguageSelector.tsx
│  │  ├─ Logo.tsx
│  │  ├─ Navbar.tsx
│  │  ├─ PropertyCard.tsx
│  │  ├─ PropertyDetailClient.tsx
│  │  ├─ PropertyGrid.tsx
│  │  └─ RegionGrid.tsx
│  ├─ config
│  │  └─ site-config.ts
│  ├─ contexts
│  │  └─ I18nContext.tsx
│  ├─ dictionaries
│  │  ├─ ar.json
│  │  ├─ en.json
│  │  ├─ es.json
│  │  ├─ fr.json
│  │  ├─ nl.json
│  │  └─ pl.json
│  ├─ lib
│  │  └─ supabase.ts
│  ├─ services
│  │  └─ agencyService.ts
│  └─ SuiviClient.js
├─ tables chema.txt
├─ tailwind.config.js
├─ The-Trust-Protocol.pdf
└─ tsconfig.json

```