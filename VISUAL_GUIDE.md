# Calendo - Complete Visual Guide

## 🎯 App Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: Open index.html                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
                ┌────────────────────┐
                │ Check localStorage │
                │ for currentUser    │
                └────────┬───────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ↓ (No User)              ↓ (User Found)
    ┌──────────────────┐       ┌──────────────────┐
    │  Show Auth Page  │       │  Verify Session  │
    │                  │       │  Check Premium   │
    │ ┌─────────────┐  │       │  Expiry          │
    │ │ Login Form  │  │       └────────┬─────────┘
    │ └─────────────┘  │              │ (Valid)
    │ ┌─────────────┐  │               ↓
    │ │ Signup Form │  │       ┌──────────────────┐
    │ └─────────────┘  │       │  Show Main App   │
    └────────┬─────────┘       │  Initialize UI   │
             │                 │  Dashboard Ready │
             │                 └──────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
User Clicks "Sign Up"  User Submits Login
    │                   │
    ↓                   ↓
┌─────────────┐    ┌──────────────┐
│  Signup     │    │ Validate     │
│  Form       │    │ Email/Phone  │
│  ┌────────┐ │    └──────┬───────┘
│  │ Name   │ │           │
│  ├────────┤ │      ✓ Valid?
│  │ Email/ │ │      ├─No: Show Error
│  │ Phone  │ │      │
│  ├────────┤ │      └─Yes: Check User
│  │Pass    │ │           Exists
│  ├────────┤ │           ├─Exists: Verify Pass
│  │Premium │ │           │  ├─Correct: LOGIN
│  │Trial?  │ │           │  └─Wrong: Error
│  └────────┘ │           │
│  [Create]   │           └─New User: CREATE
└─────┬───────┘
      │
      ↓
┌──────────────────────┐
│ Create User Record:  │
│ - userId            │
│ - email/phone       │
│ - passwordHash      │
│ - tier (free/prem)  │
│ - expiry (if prem)  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Save to localStorage │
│ Set currentUser      │
│ Auto-login           │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│   SHOW MAIN APP      │
│                      │
│ Dashboard Ready      │
│ User in Sidebar      │
│ Tier Status Shown    │
└──────────────────────┘
```

---

## 🔄 User Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Logged In: alice@example.com (user_123)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┬─────────────┐
        │                           │             │
        ↓                           ↓             ↓
   Add Content              Check Clients     View Analytics
        │                      │                   │
        ↓                      ↓                   ↓
   ┌─────────────┐      ┌─────────────┐    ┌──────────────┐
   │ Create Item │      │ Check: Can  │    │ Filter Data  │
   │ ┌────────┐  │      │ Add Client? │    │ by userId    │
   │ │Caption │  │      │             │    │              │
   │ │Date    │  │      │ Free: 3max  │    │ Show Only    │
   │ │Platforms   │      │ Premium: ∞  │    │ alice's      │
   │ └────────┘  │      │             │    │ Content      │
   │             │      │ ✓ Valid?    │    │              │
   │ Add userId: │      │ ├─Yes:      │    │ Display:     │
   │ user_123    │      │ │  CREATE   │    │ • 5 posts    │
   │             │      │ └─No:       │    │ • 2 drafts   │
   │ Save to     │      │   ERROR    │    │ • Metrics    │
   │ localStorage│      │   Message  │    └──────────────┘
   │             │      │            │
   │ Filter by   │      └────────────┘   (Other users see
   │ userId only │        (Enforce       NOTHING of alice's
   └────────────┘        limits)         data)
```

---

## 📊 Tier System


### Free Tier Path
```
User Signup → Doesn't check "Premium Trial"
    ↓
tier = 'free'
premiumExpiry = null
    ↓
Can Create: 1, 2, 3 Clients ✓
    ↓
Try to add Client 4
    ↓
❌ BLOCKED - Message: "You've reached free tier limit"
    ↓
See "Upgrade to Premium" button
    ↓
Click → See Feature Matrix + $9.99/month
```

### Premium Trial Path
```
User Signup → Checks "Premium Trial"
    ↓
tier = 'premium'
premiumExpiry = now + 7 days
    ↓
Can Create: Unlimited Clients ✓
    ↓
Settings shows: "👑 Premium Member - 7 days left"
    ↓
Day 7 passes (auto-check on login)
    ↓
tier = 'free' (auto-downgrade)
premiumExpiry = null
    ↓
Now limited to 3 clients again
```

### Premium Paid Path
```
Premium User → Clicks "Subscribe Now"
    ↓
→ [Stripe Payment Modal - not yet implemented]
    ↓
premium_expiry = now + 30 days
auto-renew = true
    ↓
tier = 'premium'
    ↓
Unlimited features
    ↓
Each month: auto-renew (ready for Stripe webhook)
```

---

## 🔐 Authentication States

```
                    Browser Loads
                         │
                    ┌────┴────┐
                    │          │
            No currentUser    currentUser
      (first visit or        exists in
       after logout)         localStorage
                    │          │
                    ↓          ↓
            ┌───────────┐  ┌──────────────┐
            │ AUTH PAGE │  │ VERIFY TIER  │
            ├───────────┤  ├──────────────┤
            │ Login     │  │ Check if     │
            │ Signup    │  │ premium      │
            │ Google    │  │ expiry date  │
            │ OAuth     │  │ passed       │
            └────┬──────┘  └────┬─────────┘
                 │              │
        User fills form    ┌────┴────────┐
                 │         │              │
            Validate →  Premium    Expired
                 │      Valid      (auto
         ✓ Valid │      ✓ Show     downgrade
         ↓       │      app        to free)
      Create  ❌ Invalid│         ✓
      Account   ↓       │         ↓
         ↓      Error   │     ┌────────────┐
      Save      Message │     │ Update:    │
      User      ↓       │     │ tier=free  │
         ↓      Re-enter │     │ expiry=null│
      Login     └─────────┴──→ └────┬───────┘
         │                           │
         └───────────────┬───────────┘
                         │
                         ↓
                  ┌────────────────┐
                  │  SHOW MAIN APP │
                  │ Initialize UI  │
                  │ Dashboard ✓    │
                  └────────────────┘
```

---

## 📱 UI/UX Screens

### Screen 1: Login Page
```
                    ◆
                
            CALENDO
   Content Calendar for Creators
   
   ┌─────────────────────────────┐
   │ Welcome Back               │
   │ ┌───────────────────────┐   │
   │ │ 🔵 Continue w/ Google │   │
   │ └───────────────────────┘   │
   │                             │
   │  ─────────── or ────────    │
   │                             │
   │ Email or Phone *            │
   │ [____________________]      │
   │                             │
   │ Password *                  │
   │ [____________________]      │
   │                             │
   │ ┌──────────────────────┐    │
   │ │   Sign In (Button)   │    │
   │ └──────────────────────┘    │
   │                             │
   │ Don't have an account?      │
   │ Sign Up (link)              │
   └─────────────────────────────┘
```

### Screen 2: Signup Page
```
                    ◆
                
            CALENDO
      Join Creators Worldwide
   
   ┌─────────────────────────────┐
   │ Create Your Account         │
   │ ┌───────────────────────┐   │
   │ │ 🔵 Sign Up w/ Google  │   │
   │ └───────────────────────┘   │
   │                             │
   │  ─────────── or ────────    │
   │                             │
   │ Full Name *                 │
   │ [____________________]      │
   │                             │
   │ Email or Phone *            │
   │ [____________________]      │
   │                             │
   │ Password *                  │
   │ [____________________]      │
   │                             │
   │ ┌───────────────────────┐   │
   │ │ ☑ Start Premium Trial │   │
   │ │ Deep analysis, unl... │   │
   │ └───────────────────────┘   │
   │                             │
   │ ┌──────────────────────┐    │
   │ │ Create Account (Btn) │    │
   │ └──────────────────────┘    │
   │                             │
   │ Already have an account?    │
   │ Sign In (link)              │
   └─────────────────────────────┘
```

### Screen 3: Main Dashboard
```
┌──────────────────────────────────────────────────────┐
│ ◆ CALENDO        Dashboard        🔔 + Add Content  │
│ ─────────────────────────────────────────────────────│
│ Welcome back. Here's what's happening today.        │
├──────────────────────────────────────────────────────┤
│                                                      │
│ SIDEBAR              MAIN CONTENT                   │
│ ┌──────────────┐     ┌──────────────────────────┐  │
│ │📊 Dashboard  │     │ Stats Grid               │  │
│ │📅 Calendar   │     │ ┌──────┬──────┬──────┐  │  │
│ │📈 Analytics  │     │ │📤 24 │⏰ 8  │✓ 14  │  │  │
│ │👥 Clients    │     │ │Posts │Sched│Pub  │  │  │
│ │📚 Library    │     │ └──────┴──────┴──────┘  │  │
│ │⚙️ Settings   │     │                         │  │
│ ├──────────────┤     │ Upcoming Content        │  │
│ │ ●○ Anna Chen │     │ ┌────────────────────┐ │  │
│ │ Manager      │     │ │Tomorrow - 10:00 AM  │ │  │
│ │ (👑 Premium) │     │ │"Check out our new..." │ │  │
│ └──────────────┘     │ └────────────────────┘ │  │
│                      │                         │  │
│                      │ Charts & Analytics      │  │
│                      │ [Engagement Chart]      │  │
│                      └──────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Screen 4: Settings - User Profile
```
┌──────────────────────────────────────────────────────┐
│ ◆ CALENDO        Settings         [Theme Selector]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ACCOUNT SECTION:                                   │
│ ┌──────────────────────────────────────────────┐   │
│ │ Account                                      │   │
│ │                                              │   │
│ │ Anna Chen                                    │   │
│ │ anna@example.com                             │   │
│ │ 👑 Premium Member - 6 days left             │   │
│ │                                              │   │
│ │ ┌─────────────────────────────────────────┐ │   │
│ │ │  🚪 Logout                              │ │   │
│ │ └─────────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘

(If Free User, would show:)
↓
│ Anna Chen                                    │   │
│ anna@example.com                             │   │
│ Free Member                                  │   │
│                                              │   │
│ ┌─────────────────────────────────────────┐ │   │
│ │  👑 Upgrade to Premium                  │ │   │
│ └─────────────────────────────────────────┘ │   │
```

### Screen 5: Upgrade Modal
```
┌──────────────────────────────────────────────────┐
│                     👑                           │
│             Upgrade to Premium                  │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Unlimited Clients                      │   │
│ │ Manage as many clients as you want       │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Deep Analysis                          │   │
│ │ Advanced video analysis with sentiment   │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Custom Reports                         │   │
│ │ Generate and export detailed analytics   │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Priority Support                       │   │
│ │ Email & chat with faster response times  │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│          ┌─────────────────────┐               │
│          │ $9.99 /month        │               │
│          │ Billed monthly      │               │
│          └─────────────────────┘               │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │      Subscribe Now (Button)              │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
└──────────────────────────────────────────────────┘
```

---

## 📊 Database Structure

```
localStorage (5MB per domain)
└── _calendo_users
    ├── User 1
    │   ├── id: "user_1702345678901"
    │   ├── name: "Anna Chen"
    │   ├── email: "anna@example.com"
    │   ├── phone: null
    │   ├── passwordHash: "1Xhj92Js8=" (Base64)
    │   ├── tier: "premium"
    │   ├── premiumExpiry: "2024-12-25T10:30:00Z"
    │   ├── createdAt: "2024-12-18T10:30:00Z"
    │   └── googleId: null
    │
    ├── User 2
    │   ├── id: "user_1702345679001"
    │   ├── name: "John Smith"
    │   ├── email: "john@example.com"
    │   ├── tier: "free"
    │   ├── premiumExpiry: null
    │   └── ...
    │
    └── User 3
        └── ...

└── contents
    ├── Item 1
    │   ├── id: 1702345678901
    │   ├── userId: "user_1702345678901" ← Filter by this!
    │   ├── caption: "New product launch..."
    │   ├── platforms: ["instagram", "youtube"]
    │   ├── date: "2024-12-20"
    │   ├── status: "scheduled"
    │   └── ...
    │
    ├── Item 2
    │   ├── userId: "user_1702345679001" ← Different user!
    │   └── ...
    │
    └── Item 3
        └── ...

└── clients
    ├── Client 1
    │   ├── id: 1702345678901
    │   ├── userId: "user_1702345678901" ← Filter by this!
    │   ├── name: "Nike"
    │   ├── brand: "Nike Inc."
    │   └── ...
    │
    └── Client 2
        └── ...

└── settings (app-wide, shared)
    ├── theme: "dark"
    ├── accentColor: "#7C5CFC"
    └── ...

└── currentUser (session)
    ├── id: "user_1702345678901"
    ├── name: "Anna Chen"
    ├── tier: "premium"
    └── ...
```

---

## 🚀 Technology Stack

```
Frontend
├── HTML5
│   └── Semantic markup
│       ├── Forms
│       ├── Buttons
│       └── Modals
│
├── CSS3
│   ├── Custom Properties (vars)
│   ├── Animations
│   ├── Gradients
│   ├── Flexbox/Grid
│   └── Media Queries
│
└── Vanilla JavaScript (ES6+)
    ├── Classes
    │   ├── AuthManager
    │   ├── ContentManager
    │   ├── ClientManager
    │   ├── UIManager
    │   └── CalendarRenderer
    │
    ├── Event Listeners
    │   ├── Form submissions
    │   ├── Button clicks
    │   └── Input changes
    │
    ├── APIs
    │   ├── localStorage
    │   ├── DOM manipulation
    │   └── Date/Time
    │
    └── Patterns
        ├── Observer
        ├── Factory
        └── Singleton

Data Storage
└── localStorage (Client-side)
    └── Ready to migrate to:
        ├── Firebase Firestore
        ├── Supabase PostgreSQL
        └── Custom REST API
```

---

## 📈 Scaling Path

```
Phase 1 (Current - Now)
├── Client-side only
├── localStorage storage
└── Single-device users
     │
     └─→ ✅ CURRENT STATE (You Are Here)

Phase 2 (This Month)
├── Firebase Backend
├── Cloud Firestore
├── Multi-device sync
└── Real-time updates
     │
     └─→ Deploy & Get Users

Phase 3 (3 Months)
├── Payment Processing (Stripe)
├── Email Notifications
├── Google OAuth
└── Advanced Analytics
     │
     └─→ First Paying Customers

Phase 4 (6 Months)
├── Mobile App (React Native)
├── Team Features
├── Integrations (Slack, Zapier)
└── Custom API
     │
     └─→ Growing User Base

Phase 5 (1 Year)
├── Enterprise Features
├── Dedicated Support
├── On-Premise Option
└── Advanced BI/Reporting
     │
     └─→ Scale to 1000+ Users
```

---

## ✅ Complete Feature Map

```
                    CALENDO App
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Authentication    Core Features     Monetization
        │                │                │
        ├─ Email Login    ├─ Dashboard     ├─ Free Tier
        ├─ Phone Login    ├─ Calendar      ├─ Premium Tier
        ├─ Signup         ├─ Analytics     ├─ 7-Day Trial
        ├─ Google OAuth   ├─ Clients       ├─ $9.99/month
        ├─ Sessions       ├─ Library       ├─ Upgrade Modal
        └─ Multi-user     ├─ Video        └─ Pricing
                          ├─ Analyzer      
                          ├─ Export        Administration
                          ├─ Import        │
                          ├─ Settings      ├─ Tier Limits
                          ├─ Themes        ├─ Feature Flags
                          └─ Profiles      ├─ Premium Checks
                                           └─ Auto-Downgrade
```

---

**Ready to go live? 🚀**

Start with: **README.md**  
Then: **FIREBASE_DEPLOYMENT.md**  
Finally: **QUICK_REFERENCE.md** for testing
