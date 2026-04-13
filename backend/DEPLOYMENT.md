# Backend Deployment

This backend can run as a standalone Node app on Render/Railway, or be mounted inside the root Vercel project through `api/index.js`.

## Required environment variables

Set these in your hosting dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-long-random-secret
FRONTEND_URL=https://your-project-name.vercel.app
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

If the frontend is deployed on Vercel, `FRONTEND_URL` should be the exact production URL so cookies and email links work correctly.

## Vercel notes

- The API is exposed from the root `api/index.js` function.
- Cookie auth is configured for production cross-site use.
- The API exposes `/api/health` for quick uptime checks.
- Frontend API calls should stay relative (`/api/...`) unless you split frontend and backend into separate deployments.

## Standalone Node deployment

Recommended settings:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
