# The Quote Catalog

A quote collection site with a public browsable grid and an admin panel to
add/edit/delete quotes and tag them by category. Static HTML/CSS/JS, backed
by Firebase (Firestore for data, Firebase Auth for the admin login), hosted
free on GitHub Pages.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name → finish the wizard (you can skip Google Analytics).
2. In the left sidebar, click **Build → Firestore Database → Create database**. Start in **production mode**, pick a region close to you.
3. Click **Build → Authentication → Get started**. Under **Sign-in method**, enable **Email/Password**.
4. Still in Authentication, go to the **Users** tab → **Add user** → enter your own email and a password. This is the only account that will exist, so this *is* your admin login — there's no public sign-up.
5. Go to **Project settings** (gear icon) → scroll to **Your apps** → click the `</>` (web) icon → register the app (nickname doesn't matter, skip hosting) → copy the `firebaseConfig` object it shows you.

## 2. Wire up the config

Open `js/firebase-config.js` and paste in the values from step 1.5, replacing the placeholders.

## 3. Set the security rules

In the Firebase console: **Firestore Database → Rules**, paste in the contents of `firestore.rules` from this project, and click **Publish**.

This makes quotes publicly readable, but only your signed-in account can write.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Quote catalog site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 5. Turn on GitHub Pages

In your GitHub repo: **Settings → Pages → Source**, choose the `main` branch and `/ (root)` folder, then **Save**. GitHub gives you a URL like:

```
https://<your-username>.github.io/<repo-name>/
```

Give it a minute or two after the first push for it to go live.

## 6. Use it

- **Public site** (`index.html`): browsable card grid of quotes, filterable by category, with search.
- **Admin panel** (`admin.html`): sign in with the email/password you created in step 1.4 to add, edit, delete quotes and set their category.

## Adding more admins later

If you ever want a second person to have admin access, add their email as
another user under **Authentication → Users** in the Firebase console — no
code changes needed, since the security rule just checks "is signed in."

## File structure

```
quote-site/
├── index.html        # public quote catalog
├── admin.html         # admin login + dashboard
├── css/styles.css      # shared styles
├── js/
│   ├── firebase-config.js  # your Firebase project keys (fill this in)
│   ├── app.js               # public site logic
│   └── admin.js              # admin auth + CRUD logic
└── firestore.rules       # Firestore security rules
```
