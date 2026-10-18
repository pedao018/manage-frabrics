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

## Supabase

The Supabase client packages are included in the project dependencies. Local
configuration is stored in the Git-ignored `.env.local` file. For another
environment, set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then restart the development server.

The home page reads rows from the Supabase `public.todos` table and displays
each row's `name`. The table should include `id` and `name` columns, and the
connected role must be allowed to read it by your database grants and row-level
security policies. Query errors are shown on the page until the table and
permissions are configured. A root `proxy.ts` refreshes Supabase sessions.

## Demo feature configuration

Feature titles and URL slugs, along with the JSON Cache API cache name and
entry key, are centralized in `config/demo-features.ts`. The JSON upload uses
the configured `storageBucketName`, `storageObjectFolder`, and
`storageFileNamePrefix`. Each click uploads a uniquely named JSON file without
overwriting an existing object. The current app has no sign-in flow, so uploads
use the `anon` role. Create the bucket in Supabase Storage, then add this
narrowly scoped INSERT policy in the Supabase SQL editor:

```sql
create policy "Allow anonymous demo JSON uploads"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'JSON files'
  and name like 'demos/input-text-json-cache-%.json'
);

create policy "Allow anonymous demo JSON reads"
on storage.objects
for select
to anon
using (
  bucket_id = 'JSON files'
  and name like 'demos/input-text-json-cache-%.json'
);
```

Change the bucket ID or path pattern in the policy to match
`config/demo-features.ts`. This policy allows unauthenticated visitors to upload
and read files matching that path, so use authenticated policies instead if the
app is public. The “Read JSON from Server” button lists matching files and
displays the most recently created one's contents.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
