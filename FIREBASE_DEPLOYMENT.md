# Firebase Deployment Guide

Deploy Calendo to Firebase Hosting + Firestore Database in under 15 minutes.

## Prerequisites
- Node.js installed (v14+)
- Firebase project (free tier works great for getting started)
- Google account

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "calendo" (or your choice)
4. Accept all defaults
5. Click "Create project"

## Step 2: Install Firebase Tools

```bash
npm install -g firebase-tools
firebase login
```

## Step 3: Initialize Firebase in Your Project

```bash
cd "d:\Projects\Content Calender"
firebase init
```

When prompted:
```
? Which Firebase features do you want to set up for this directory?
  → Select: Firestore, Hosting, Authentication
  
? What file should be used for Firestore rules? 
  → firestore.rules (create new file)
  
? What file should be used for Firestore indexes?
  → firestore.indexes.json

? What do you want to use as your public directory?
  → . (current directory)

? Configure as a single-page app (rewrite all urls to index.html)?
  → Yes
```

## Step 4: Update Firestore Security Rules

Replace contents of `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Contents subcollection
      match /contents/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Clients subcollection
      match /clients/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Settings subcollection
      match /settings/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

## Step 5: Integrate Firebase SDK

Add to `index.html` before closing `</body>` tag:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js"></script>

<!-- Your app -->
<script src="firebase-config.js"></script>
<script src="app.js"></script>
</body>
</html>
```

## Step 6: Create firebase-config.js

Create file: `d:\Projects\Content Calender\firebase-config.js`

```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase references
window.db = firebase.firestore();
window.auth = firebase.auth();
```

**Get your config from Firebase Console:**
1. Go to Project Settings ⚙️
2. Copy the Web SDK snippet (firebaseConfig)
3. Paste into firebase-config.js

## Step 7: Update app.js for Firebase

Add to top of `app.js` after line 1:

```javascript
// Firebase Integration Flag
const USE_FIREBASE = typeof firebase !== 'undefined' && firebase.auth;
```

Replace localStorage calls with:

```javascript
// In AuthManager - replace saveUserToStorage():
async saveUserToStorage(user) {
    if (USE_FIREBASE) {
        try {
            await db.collection('users').doc(user.id).set({
                ...user,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Firebase error:', error);
            // Fallback to localStorage if Firebase fails
            const users = this.getAllUsers();
            users.push(user);
            localStorage.setItem('_calendo_users', JSON.stringify(users));
        }
    } else {
        // Fallback to localStorage
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('_calendo_users', JSON.stringify(users));
    }
}

// Similar for getAllUsers(), updateUserInStorage(), etc.
```

## Step 8: Enable Google OAuth

1. In Firebase Console → Authentication
2. Click "Sign-in method"
3. Enable "Google"
4. click "Save"

## Step 9: Configure Hosting Domain

1. Go to Hosting in Firebase Console
2. Click "Add custom domain"
3. Point your domain to Firebase (instructions provided)
4. Or use Firebase provided URL: `YOUR_PROJECT.web.app`

## Step 10: Deploy

```bash
cd "d:\Projects\Content Calender"
firebase deploy
```

Your app is now live at: `https://YOUR_PROJECT.web.app`

## Testing Production Deployment

1. Visit deployed URL
2. Create account with Google OAuth
3. Create clients and content
4. Verify data persists after refresh
5. Open in different browser to test multi-user isolation

## Troubleshooting

### "Firebase is not defined"
- Check Firebase SDK is loaded before app.js
- Check internet connection (CDN might be blocked)

### Firestore saves not working
- Check security rules in Firebase Console
- Verify user is authenticated: `console.log(auth.currentUser)`
- Check browser DevTools Network tab for errors

### Domain custom domain not working
- DNS changes take 24-48 hours to propagate
- Use Firebase provided URL in meantime

### App is blank after deployment
- Check browser console for JavaScript errors
- Verify index.html is in correct directory
- Check firebase.json has correct public directory

## Scaling Beyond Firebase

When you outgrow Firebase:

### Migrate to Heroku + PostgreSQL
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

### Migrate to AWS
```bash
# Use AWS Amplify
amplify init
amplify add api
amplify push
```

### Performance improvements
- Add Firebase Analytics
- Enable Firestore cache
- Use Cloud Functions for processing
- CDN for static assets

## Cost Estimates

**Firebase (Free Tier):**
- Read/write: 50k per day free
- Storage: 1GB free
- Hosting: 10GB/month free

**Estimated monthly costs at 1000 users:**
- Firestore: ~$5-15
- Hosting: Free
- Authentication: Free
- Storage: ~$2

## Next Steps

1. ✅ Deploy to Firebase
2. Set up custom domain
3. Enable email verification
4. Add Stripe for premium payments
5. Set up email notifications
6. Monitor with Firebase Analytics

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Hosting Docs: https://firebase.google.com/docs/hosting
- Troubleshooting: https://firebase.google.com/support

---

**Estimated Deployment Time:** 10-15 minutes  
**Complexity:** Beginner-friendly  
**Recommended:** Yes, great for MVP
