# 🚀 Free Deployment Guide - Smart Expense Tracker

## Recommended Free Stack

| Service | Provider | Free Tier |
|---------|----------|-----------|
| Frontend | **Vercel** | Unlimited deployments |
| Backend | **Render** | 750 hours/month |
| Database | **MongoDB Atlas** | 512 MB storage |

---

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New Repository**
3. Name it `smart-expense-tracker`
4. Make it **Public**
5. Click **Create Repository**

### 1.2 Push Code to GitHub

Open terminal in project root:

```powershell
cd "c:/Users/Microsoft/Desktop/Expense Tracker"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-expense-tracker.git
git push -u origin main
```

---

## Step 2: Setup MongoDB Atlas (Free Database)

### 2.1 Create Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up with Google or email
3. Choose **Shared Cluster** (FREE)

### 2.2 Create Cluster
1. Click **Build a Database**
2. Select **M0 Sandbox** (FREE forever)
3. Choose cloud provider: **AWS**
4. Choose region closest to you (e.g., `Mumbai (ap-south-1)`)
5. Click **Create Cluster**

### 2.3 Configure Access
1. In **Database Access**, click **Add New Database User**
2. Choose **Password** authentication
3. Set username: `expense_user`
4. Set a strong password (save it!)
5. Under **Built-in Role**, select **Read and Write to Any Database**
6. Click **Add User**

### 2.4 Allow Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (or add your IP)
3. Click **Confirm**

### 2.5 Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Drivers** → **Node.js**
3. Copy the connection string:
   ```
   mongodb+srv://expense_user:<password>@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

---

## Step 3: Deploy Backend to Render (Free)

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 3.2 Create Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repo `smart-expense-tracker`
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | `expense-tracker-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

4. Click **Advanced** and add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | *(your MongoDB Atlas connection string)* |
   | `JWT_SECRET` | *(generate a random string, e.g., `mysecretkey123456`)* |
   | `JWT_EXPIRE` | `30d` |

5. Click **Create Web Service**

6. Wait for deployment. Your API URL will be:
   ```
   https://expense-tracker-api.onrender.com
   ```

---

## Step 4: Deploy Frontend to Vercel (Free)

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 4.2 Import Project
1. Click **Add New Project**
2. Import `smart-expense-tracker` from GitHub
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | `Vite` |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. **IMPORTANT - Add Environment Variable BEFORE deploying:**
   
   Click **Environment Variables** and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://expense-tracker-api.onrender.com/api` |
   
   > Replace `expense-tracker-api` with your actual Render service name

5. Click **Deploy**

6. Your app will be live at:
   ```
   https://smart-expense-tracker.vercel.app
   ```

---

## Step 5: Enable CORS on Backend

### 5.1 Update Backend CORS

The `backend/server.js` already includes CORS setup. Make sure your Vercel URL is in the allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://your-vercel-app.vercel.app', // Your actual Vercel URL
];
```

> ⚠️ Must include `https://` protocol!

### 5.2 Commit and Push

```powershell
git add .
git commit -m "Update CORS for production"
git push
```

Render will auto-deploy the backend.

---

## Step 7: Verify Deployment

1. Open your Vercel URL: `https://smart-expense-tracker.vercel.app`
2. Sign up with a new account
3. Add a transaction
4. Check if data persists (confirms MongoDB connection)

---

## 🔄 Alternative: Deploy Everything on Render

If you prefer one platform:

### Frontend + Backend on Render
1. Deploy backend as Web Service (Step 3)
2. Deploy frontend as **Static Site** on Render:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
3. Update API URL in `frontend/src/api/axios.js` to your Render backend URL

---

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access allowed (0.0.0.0/0)
- [ ] Backend deployed on Render
- [ ] Environment variables set on Render
- [ ] Frontend API URL updated
- [ ] Frontend deployed on Vercel
- [ ] CORS configured for production
- [ ] App tested live

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| `POST ...vercel.app/auth/login 404` | **Missing `VITE_API_URL` on Vercel.** Add it in Project Settings → Environment Variables |
| `CORS error` | Add your exact Vercel URL (with `https://`) to `allowedOrigins` in `server.js` |
| MongoDB connection error | Check if IP is whitelisted in Atlas Network Access |
| Build fails on Vercel | Check if `vite.config.js` has correct base path |
| API not responding | Check Render logs for errors |
| JWT errors | Ensure `JWT_SECRET` is set in Render env vars |
| `User already exists` | Use a different email or clear the MongoDB collection |

---

## 💡 Pro Tips

1. **Custom Domain**: Both Vercel and Render support free custom domains
2. **Auto Deploy**: Every `git push` auto-deploys on both platforms
3. **Environment Variables**: Never commit `.env` files - always use platform env vars
4. **Monitoring**: Render has free logs; Vercel has analytics

---

## 📁 Files to Verify Before Deploy

```
backend/
  ├── .env (NOT committed - use platform env vars)
  ├── server.js (CORS updated)
  └── package.json (has "start" script)

frontend/
  ├── src/api/axios.js (API URL updated)
  ├── vite.config.js (base path set if needed)
  └── package.json (has "build" script)
```

---

**Total Cost: $0 forever** (within free tier limits)
