# Render Deployment Checklist

## ✅ Pre-Deployment (Complete these first)

- [ ] Push all code to GitHub
- [ ] MongoDB Atlas database is set up and accessible
- [ ] Have SMTP credentials ready (or use Mailtrap for testing)

---

## 🚀 Deployment Steps

### **Backend Deployment (5-10 minutes)**

1. [ ] Go to https://dashboard.render.com
2. [ ] Click **New + → Web Service**
3. [ ] Connect your GitHub repository
4. [ ] Configure service:
   - Name: `auth-system-api`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

5. [ ] Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=generate_strong_secret_here
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

6. [ ] Click **Create Web Service**
7. [ ] Wait for deployment (check logs)
8. [ ] Copy your backend URL: `https://______.onrender.com`

---

### **Frontend Deployment (5-10 minutes)**

1. [ ] Click **New + → Static Site**
2. [ ] Select same repository
3. [ ] Configure:
   - Name: `auth-system-frontend`
   - Root Directory: `frontend/vite-project`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. [ ] Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. [ ] Click **Create Static Site**
6. [ ] Wait for deployment
7. [ ] Copy your frontend URL: `https://______.onrender.com`

---

### **Post-Deployment Configuration**

1. [ ] Update backend `FRONTEND_URL` with your actual frontend URL
2. [ ] Save changes (auto-redeploys backend)
3. [ ] Test the application:
   - [ ] Sign up new user
   - [ ] Check email for OTP
   - [ ] Verify email
   - [ ] Login
   - [ ] Test password reset

---

## 📝 Important Notes

### MongoDB Atlas Whitelist:
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allow all) for Render free tier
- Or whitelist Render's IPs specifically

### Free Tier Info:
- Spins down after 15 min inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month per service

---

## 🐛 Common Issues

**Build fails?**
- Check Node version compatibility
- Verify all dependencies are in package.json

**CORS errors?**
- Ensure FRONTEND_URL matches exactly (no trailing slash)
- Check credentials setting

**Can't connect to MongoDB?**
- Verify connection string
- Check MongoDB Atlas IP whitelist
- Ensure user has correct permissions

**502 Bad Gateway?**
- Service is probably spinning up (wait 30s)
- Check logs for errors

---

## 🎉 Success!

Your app should now be live at:
- **Frontend**: https://your-app.onrender.com
- **Backend**: https://your-api.onrender.com

Share it on your portfolio! 🚀
