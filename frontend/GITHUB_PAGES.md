## GitHub Pages Deploy

GitHub Pages can host only the frontend. Your Node.js + MongoDB backend must be deployed separately.

### 1. Set frontend env

Create `frontend/.env.production` with values like:

```env
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_USE_HASH_ROUTER=true
```

Example:

```env
VITE_BASE_PATH=/Task-Management-System-2-main/
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_USE_HASH_ROUTER=true
```

### 2. Install dependencies

```powershell
cd frontend
npm install
```

### 3. Deploy

```powershell
npm run deploy
```

### 4. GitHub repo settings

In GitHub:
- Open `Settings`
- Open `Pages`
- Set source to `Deploy from a branch`
- Select branch `gh-pages`
- Save

### Notes

- `VITE_USE_HASH_ROUTER=true` avoids refresh/404 issues on GitHub Pages.
- `VITE_API_BASE_URL` must point to your deployed backend.
- If your backend uses cookies, make sure its CORS and cookie settings allow your GitHub Pages domain.
