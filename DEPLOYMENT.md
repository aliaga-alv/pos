# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database (Prisma Postgres or Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Getting Your Environment Variables

### Option 1: Supabase (Recommended)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Project Settings > Database
   - Copy the **Connection Pooling** URL as `DATABASE_URL`
   - Copy the **Direct Connection** URL as `DIRECT_URL`
3. Navigate to Project Settings > API
   - Copy the **Project URL** as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon public** key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option 2: Prisma Postgres

1. Install Prisma CLI: `npm install -g prisma`
2. Run `npx prisma init --datasource-provider postgresql`
3. Follow the prompts to set up your database
4. Copy the connection strings from the Prisma console

## Vercel Deployment Setup

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and import your repository
2. Configure environment variables in the Vercel dashboard:
   - Add all variables from your `.env.local` file
   - Make sure to mark sensitive variables as "Sensitive"
3. Deploy!

### 3. Run Database Migrations

After deploying, run migrations in production:

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migrations
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Database Seeding (Optional)

To seed your production database with initial data:

```bash
# Seed ingredients
npx tsx prisma/seed.ts

# Or run SQL directly
psql $DATABASE_URL < prisma/seed-ingredients.sql
```

## Post-Deployment Setup

1. **Create Admin User**: After deployment, sign up through `/login` and manually update the user role in the database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

2. **Create Categories**: Navigate to `/admin/categories` and create your product categories

3. **Add Products**: Navigate to `/admin/products` and add your menu items

4. **Set Up Tables**: Navigate to `/admin/tables` and create your restaurant tables

5. **Generate QR Codes**: Run the QR code generation script:
   ```bash
   npm run generate-qr-codes
   ```
   Upload the generated QR codes from `public/qr/` to your hosting

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database connection strings are not committed to Git
- [ ] `.env.local` is in `.gitignore`
- [ ] Row Level Security (RLS) is enabled on Supabase tables
- [ ] Admin user role is properly set
- [ ] CORS is configured correctly for your domain

## Troubleshooting

### Build Errors

- **Prisma generate fails**: Make sure `DATABASE_URL` is set in Vercel environment variables
- **Next.js build fails**: Check that all TypeScript errors are resolved locally first

### Runtime Errors

- **Auth not working**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Database connection fails**: Check that `DATABASE_URL` and `DIRECT_URL` are correct
- **RLS errors**: Make sure RLS policies are set up correctly in Supabase

## Performance Optimization

1. **Database Indexing**: Make sure indexes are created on frequently queried columns
2. **Image Optimization**: Use Next.js Image component for product images
3. **Caching**: Enable ISR for product catalog pages
4. **Edge Functions**: Deploy frequently accessed APIs to edge

## Monitoring

- **Vercel Analytics**: Enable analytics in your Vercel dashboard
- **Error Tracking**: Consider adding Sentry for error monitoring
- **Database Monitoring**: Use Supabase dashboard for query performance

## Support

For issues or questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Visit [Supabase Documentation](https://supabase.com/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
