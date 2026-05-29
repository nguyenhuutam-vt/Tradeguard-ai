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

# Tradeguard-ai

## Environment Variables

Create `.env.local` for local development:

```bash
cp .env.example .env.local
```

Then fill in the values from your Supabase and OpenAI projects.

Required Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`NEXT_PUBLIC_SUPABASE_URL` is available in Supabase under Project Settings > API > Project URL.
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is available under Project Settings > API > Project API keys > anon public.

## Deploy Notes

If the deployed app shows "Thiếu cấu hình Supabase", add these same variables in your hosting provider's environment variable settings for the deployed project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For Vercel, add them under Project Settings > Environment Variables. Select the environments you deploy to, usually Production, Preview, and Development.

After adding or changing any `NEXT_PUBLIC_*` variable, trigger a new deployment. Next.js bakes public environment variables into the client bundle during build, so an existing deployment will keep showing the old missing-value error until it is rebuilt.
