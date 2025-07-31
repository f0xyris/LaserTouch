# Vercel Environment Variables Setup

## Required Environment Variables

Add these variables to your Vercel project settings:

### 1. JWT_SECRET
- **Value**: Any random string (e.g., `your-super-secret-jwt-key-2024`)
- **Purpose**: Used to sign and verify JWT tokens
- **Example**: `my-super-secret-jwt-key-for-laser-touch-2024`

### 2. DATABASE_URL
- **Value**: Your Neon database connection string
- **Purpose**: Database connection
- **Format**: `postgresql://username:password@host:port/database?sslmode=require`

### 3. SESSION_SECRET
- **Value**: Any random string
- **Purpose**: Session security (if still using sessions)
- **Example**: `my-session-secret-key-2024`

### 4. GOOGLE_CLIENT_ID
- **Value**: Your Google OAuth Client ID
- **Purpose**: Google OAuth authentication

### 5. GOOGLE_CLIENT_SECRET
- **Value**: Your Google OAuth Client Secret
- **Purpose**: Google OAuth authentication

## How to Add Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable with the correct name and value
5. Deploy again

## Important Notes

- **JWT_SECRET**: Must be the same across all deployments
- **Never commit secrets to git**: These should only be in Vercel environment variables
- **Redeploy after adding variables**: Changes require a new deployment 