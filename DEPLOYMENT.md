# Render Deployment Guide for Authentication System

## 🚀 Deploying to Render (Free Tier)

### Option 1: Deploy Backend Only (Recommended for separate frontend deployment)

### Option 2: Deploy Full Stack Together (What we'll do)

---

## 📋 **Prerequisites**

1. ✅ GitHub repository with your code pushed
2. ✅ Render account (sign up at https://render.com - free)
3. ✅ MongoDB Atlas database (you already have this)

---

## 🔧 **Step-by-Step Deployment**

### **Step 1: Prepare Frontend for Production**

You need to update the frontend API URL for production. We'll do this after deploying the backend.

### **Step 2: Deploy Backend on Render**

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect GitHub Repository**
   - Click **"Connect account"** if not connected
   - Select your **AuthenticationSystem** repository
   - Click **"Connect"**

3. **Configure Web Service**
   Fill in these details:

   | Field | Value |
   |-------|-------|
   | **Name** | `auth-system-api` (or any name) |
   | **Region** | Oregon (US West) - Free tier |
   | **Branch** | `main` (or `master`) |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free |

4. **Add Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = generate_a_strong_random_secret_key
   SMTP_HOST = smtp.mailtrap.io
   SMTP_PORT = 2525
   SMTP_USER = your_smtp_user
   SMTP_PASS = your_smtp_password
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```

   **Important Notes:**
   - For `JWT_SECRET`, generate a strong secret: https://www.uuidgenerator.net/
   - For production email, replace Mailtrap with a real SMTP service (Gmail, SendGrid, etc.)
   - `FRONTEND_URL` will be updated after frontend deployment

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment
   - Your backend URL will be: `https://auth-system-api.onrender.com`

---

### **Step 3: Deploy Frontend on Render**

1. **Create Static Site**
   - Click **"New +"** → **"Static Site"**
   - Select the same repository
   
2. **Configure Static Site**

   | Field | Value |
   |-------|-------|
   | **Name** | `auth-system-frontend` |
   | **Branch** | `main` |
   | **Root Directory** | `frontend/vite-project` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

3. **Add Environment Variable**
   
   ```
   VITE_API_URL = https://auth-system-api.onrender.com
   ```

4. **Deploy**
   - Click **"Create Static Site"**
   - Wait for deployment
   - Your frontend URL will be: `https://auth-system-frontend.onrender.com`

---

### **Step 4: Update Backend CORS Settings**

After frontend is deployed:

1. Go to backend service on Render
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your deployed frontend URL:
   ```
   FRONTEND_URL = https://auth-system-frontend.onrender.com
   ```
4. Click **"Save Changes"** (will auto-redeploy)

---

## ⚡ **Alternative: Deploy Both on Render as One Service**

If you want to deploy both as a single service (backend serves frontend):

1. Follow backend deployment steps
2. Update build command to:
   ```bash
   cd frontend/vite-project && npm install && npm run build && cd ../../backend && npm install
   ```
3. In your backend `index.js`, add code to serve static files from frontend build

---

## 🔍 **Important Notes**

### Free Tier Limitations:
- ✅ 750 hours/month (enough for one service)
- ⚠️ Spins down after 15 min of inactivity (first request takes ~30s)
- ✅ 512MB RAM
- ✅ Custom domains supported

### After Deployment:
1. Test all endpoints
2. Verify email sending works
3. Check CORS settings
4. Monitor logs in Render dashboard

---

## 🐛 **Troubleshooting**

**Build Failed?**
- Check logs in Render dashboard
- Verify `package.json` has correct dependencies
- Ensure Node version compatibility

**CORS Errors?**
- Double-check `FRONTEND_URL` matches exactly
- Ensure credentials are enabled in CORS config

**500 Errors?**
- Check MongoDB connection string
- Verify all environment variables are set
- Check logs for error details

---

## 📊 **Next Steps After Deployment**

1. ✅ Update MongoDB Atlas whitelist to allow Render IPs (or use 0.0.0.0/0 for all IPs)
2. ✅ Set up production email service (replace Mailtrap)
3. ✅ Add custom domain (optional)
4. ✅ Set up monitoring/alerts

---

**Need help?** Render has great documentation: https://render.com/docs
