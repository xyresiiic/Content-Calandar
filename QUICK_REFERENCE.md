# Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### Open the App
```
File → Open: d:\Projects\Content Calender\index.html
```

### Test Login
1. Click "Sign Up"
2. Enter any name, email, password (6+ chars)
3. Check "Start with Premium Trial" (optional)
4. Click "Create Account"
5. You're logged in! 🎉

### Try the App
- Dashboard: See your stats
- Calendar: Add/view content
- Clients: Add up to 3 clients (Free) or unlimited (Premium)
- Analytics: View performance metrics
- Settings: See your profile, theme options, logout

## 📋 Quick Commands (Browser Console)

Open browser DevTools (F12) and paste these:

### Check Current User
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

### Check All Users
```javascript
JSON.parse(localStorage.getItem('_calendo_users'))
```

### Check Your Contents
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'));
const allContent = JSON.parse(localStorage.getItem('contents'));
console.log(allContent.filter(c => c.userId === user.id));
```

### Make User Premium (Dev Testing)
```javascript
let user = JSON.parse(localStorage.getItem('currentUser'));
user.tier = 'premium';
user.premiumExpiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
localStorage.setItem('currentUser', JSON.stringify(user));
location.reload();
```

### Make Premium Trial Expire Now
```javascript
let user = JSON.parse(localStorage.getItem('currentUser'));
user.premiumExpiry = new Date().toISOString();
localStorage.setItem('currentUser', JSON.stringify(user));
location.reload();
```

### Logout Manually
```javascript
localStorage.removeItem('currentUser');
location.reload();
```

### Clear All Data (WARNING: Deletes everything!)
```javascript
localStorage.clear();
location.reload();
```

## 🔐 Default Test Accounts

Pre-configured test data (after signup):

| Email | Password | Tier | Purpose |
|-------|----------|------|---------|
| test@example.com | 123456 | Free | Test free limits |
| premium@example.com | 123456 | Premium | Test premium features |
| demo@example.com | 123456 | Premium | Test with demo data |

## 🎯 Features by Tier

### Free Tier Features
- ✅ 3 clients max
- ✅ Timeline calendar
- ✅ Basic analytics
- ✅ Content library
- ✅ Video analyzer
- ✅ Export data
- ✅ Theme customization

### Premium Features  
- ✅ Everything in Free
- ✅ **Unlimited clients**
- ✅ Deep video analysis (with sentiment)
- ✅ Advanced analytics
- ✅ Custom date ranges
- ✅ Priority support
- ✅ Team collaboration (future)

## 🧪 Testing Scenarios

### Test Client Limit
```
1. Login as free user
2. Add Client 1, 2, 3 → ✅ Works
3. Try to add Client 4 → ❌ "You've reached free tier limit"
4. Click "Upgrade to Premium" button
5. See modal with features and $9.99/month
```

### Test Multi-User Isolation
```
Window 1: Open in Chrome
  - Login: alice@example.com / 123456
  - Add 5 content items
  - See 5 items on dashboard

Window 2: Open in Firefox (or incognito)
  - Login: bob@example.com / 123456
  - Dashboard empty (different user!)
  - Add 3 content items
  - See only 3 items

Window 1: Refresh
  - Still see your 5 items
  - Bob's 3 items not visible ✓
```

### Test Premium Trial Auto-Expiry
```
1. Signup with premium trial checked
2. Console: Check premiumExpiry date
3. Go to Settings
4. See "👑 Premium Member - 7 days left"
5. Travel to future (dev tools): Set premiumExpiry to now
6. Refresh page
7. Now shows "Free Member" in Settings
8. Try to add 4th client → Blocked
```

### Test Session Persistence  
```
1. Login: john@example.com
2. Add 5 content items
3. Refresh browser (F5)
4. Still logged in! ✓
5. Close browser completely
6. Reopen file
7. Still logged in! ✓
```

## 📱 Keyboard Shortcuts

| Keys | Action |
|------|--------|
| Ctrl+Shift+J | Open DevTools |
| F5 | Refresh page |
| Ctrl+1-6 | Switch between nav items |
| Ctrl+D | Add new content (if focused) |

## 🎨 UI Navigation

```
Main App
├── Dashboard (📊)
│   ├── Stats cards
│   ├── Upcoming content
│   ├── Performance charts
│   └── Recent activity
│
├── Calendar (📅)
│   ├── Month view
│   ├── Week view
│   ├── List view
│   └── Day details panel
│
├── Analytics (📈)
│   ├── Platform metrics
│   ├── Engagement rates
│   ├── Best posting times
│   └── Custom date range
│
├── Clients (👥)
│   ├── Client cards
│   ├── Add/edit client
│   ├── Platform tags
│   └── Client stats
│
├── Library (📚)
│   ├── Content search
│   ├── Filter by platform
│   ├── Filter by status
│   ├── Export options
│   └── Video analyzer
│
└── Settings (⚙️)
    ├── Theme selector
    ├── Accent colors
    ├── Calendar settings
    ├── Notifications
    ├── Data export/import
    ├── Account info
    └── Logout button
```

## 🚢 Deployment Checklist

### Before Going Live
- [ ] Test all authentication flows
- [ ] Verify multi-user isolation
- [ ] Test premium tier enforcement
- [ ] Check database limits
- [ ] Set up error tracking
- [ ] Configure email notifications
- [ ] Add password reset flow
- [ ] Set up SSL certificate
- [ ] Configure firewall rules
- [ ] Test on mobile devices
- [ ] Prepare support channel
- [ ] Create terms of service
- [ ] Set up analytics tracking

### Quick Deployment Steps
```
1. Deploy to Firebase
   → See FIREBASE_DEPLOYMENT.md
   
2. Enable Google OAuth
   → See README.md Authentication section
   
3. Set up Stripe (optional)
   → Configure payment processing
   
4. Add email service
   → SendGrid, Mailgun, etc.
   
5. Monitor & scale
   → Use Firebase Analytics
```

## 🐛 Troubleshooting

### Login Not Working
```
✓ Check password is 6+ characters
✓ Check email/phone format is valid
✓ Verify account exists (test login twice)
✓ Clear browser cache
✓ Check DevTools console for errors
```

### Data Not Saving
```
✓ Check localStorage quota isn't full
  → DevTools → Application → Storage
✓ Verify you're logged in
  → Console: JSON.parse(localStorage.getItem('currentUser'))
✓ Try exporting data (Settings)
✓ Clear old data if quota exceeded
```

### Premium Not Showing
```
✓ Check tier in console:
  → JSON.parse(localStorage.getItem('currentUser')).tier
✓ Verify premium wasn't checked on signup
✓ Check expiry date hasn't passed
✓ Try manual set (see console commands above)
```

### Multiple Tabs Issue
```
✓ Close all tabs except one
✓ Logout and login again
✓ Check currentUser matches
✓ If data lost, check backup
```

## 💾 Data Backup

### Manual Export
```javascript
// Settings → Export All Data
// Downloads JSON file with everything
```

### Restore from Backup
```javascript
// Settings → Import Data
// Select previously exported JSON file
```

### Browser Storage Stats
```javascript
// Check usage
navigator.storage.estimate().then(estimate => {
  console.log(`Using: ${estimate.usage} bytes`);
  console.log(`Available: ${estimate.quota} bytes`);
});
```

## 📊 Statistics Commands

### Content Stats
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'));
const contents = JSON.parse(localStorage.getItem('contents'));
const userContent = contents.filter(c => c.userId === user.id);
console.log(`Total: ${userContent.length}`);
console.log(`Scheduled: ${userContent.filter(c => c.status === 'scheduled').length}`);
console.log(`Published: ${userContent.filter(c => c.status === 'published').length}`);
console.log(`Drafts: ${userContent.filter(c => c.status === 'draft').length}`);
```

### Client Stats
```javascript
const clients = JSON.parse(localStorage.getItem('clients'));
const userClients = clients.filter(c => c.userId === user.id);
console.log(`Total clients: ${userClients.length}`);
console.log(`Clients: ${userClients.map(c => c.name).join(', ')}`);
```

## 🎓 Learning Resources

### Understanding the Code

**AuthManager** (~280 lines)
- Location: `app.js` lines 1-290
- Handles: Login, signup, sessions, tiers

**ContentManager** (~120 lines)
- Location: `app.js` lines ~370-490
- Handles: Content CRUD, filtering, searching

**ClientManager** (~80 lines)
- Location: `app.js` lines ~430-510  
- Handles: Client CRUD, tier limits

**UIManager** (~400 lines)
- Location: `app.js` lines ~1065-1465
- Handles: UI rendering, user interactions

### Code Style
- Classes for data management
- Event listeners for user actions
- Filters for multi-user isolation
- localStorage for data persistence
- CSS custom properties for theming

## 📞 Getting Help

### Check Documentation
1. **README.md** - Features & architecture
2. **FIREBASE_DEPLOYMENT.md** - Deploy guide
3. **AUTHENTICATION_UPDATE.md** - Changes made
4. **IMPLEMENTATION_SUMMARY.md** - This project summary

### Debug Mode
```javascript
// Enable detailed logging
window.DEBUG = true;

// Then check console for detailed messages
```

### Reset Everything (Emergency)
```javascript
// WARNING: Deletes all data!
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 🎯 Common Tasks

### Add a New User Programmatically
```javascript
const auth = window.authManager; // If available globally
const newUser = {
    id: 'user_' + Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: btoa('password'),
    tier: 'free',
    createdAt: new Date().toISOString()
};
auth.saveUserToStorage(newUser);
```

### Change User's Tier
```javascript
let user = JSON.parse(localStorage.getItem('currentUser'));
user.tier = 'premium';
user.premiumExpiry = new Date(Date.now() + 30*24*60*60*1000).toISOString();
localStorage.setItem('currentUser', JSON.stringify(user));
```

### Delete All User Data
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'));
let contents = JSON.parse(localStorage.getItem('contents'));
contents = contents.filter(c => c.userId !== user.id);
localStorage.setItem('contents', JSON.stringify(contents));
```

### Export as CSV
```javascript
// Built-in: Settings → Export Library
// Or use console:
const data = JSON.parse(localStorage.getItem('contents'));
console.log(data.map(d => `${d.date},${d.caption}`).join('\n'));
```

## 🎉 You're All Set!

Your app is ready to:
- ✅ Register new users
- ✅ Enforce tier limits
- ✅ Isolate user data
- ✅ Manage premium features
- ✅ Deploy to production

**Next Steps:**
1. Deploy to Firebase (5 min setup)
2. Set up Stripe payments (2 hours)
3. Add Google OAuth (1 hour)
4. Go live! 🚀

---

**Questions?** Check the README.md or IMPLEMENTATION_SUMMARY.md

**Ready to ship?** See FIREBASE_DEPLOYMENT.md for production deployment
