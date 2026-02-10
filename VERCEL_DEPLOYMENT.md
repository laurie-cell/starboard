# Deploying to Vercel

This guide will walk you through deploying your Starboard diary app to Vercel.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Vercel account (sign up at https://vercel.com)
3. Your Supabase project URL and anon key

## Step 1: Prepare Your Code

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: Visit https://vercel.com and sign in
2. **Import Project**: Click "Add New..." → "Project"
3. **Import Git Repository**: Select your GitHub repository
4. **Configure Project**:
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Set Environment Variables**:
   Click "Environment Variables" and add:

   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon/public key
   - `NEXT_PUBLIC_TEST_MODE` = `false` (or leave empty for production)

   **Important**: Make sure to add these for all environments (Production, Preview, Development)

6. **Deploy**: Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_TEST_MODE
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase

### 3.1 Update Supabase Auth Settings

1. Go to your Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**` (for all routes)

### 3.2 Verify RLS Policies

Make sure all your Row Level Security (RLS) policies are set up correctly in Supabase. Check:
- `entries` table policies
- `user_profiles` table policies
- `anonymization_mappings` table policies
- `profile-pictures` storage bucket policies

## Step 4: Post-Deployment Checklist

- [ ] Test authentication (sign up, sign in, sign out)
- [ ] Test creating entries
- [ ] Test viewing public feed
- [ ] Test viewing "My Entries"
- [ ] Test anonymization features
- [ ] Test profile picture upload
- [ ] Verify all environment variables are set
- [ ] Check that Supabase redirect URLs are configured

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally: `npm run build`

### Environment Variables Not Working

1. Make sure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check that variables are added to all environments (Production, Preview, Development)

### Authentication Issues

1. Verify Supabase redirect URLs include your Vercel domain
2. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
3. Ensure email confirmation is configured correctly in Supabase

### Storage Bucket Issues

If profile picture uploads fail:
1. Verify the `profile-pictures` bucket exists in Supabase Storage
2. Check that storage policies are set up correctly
3. Ensure the bucket is set to public

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
