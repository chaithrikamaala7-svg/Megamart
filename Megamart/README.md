# Megamart (React + Node + MongoDB)

## What you get

- **Home page**: loads first with **Header + Footer**
- **Login icon (person)**: click it to go to `/login` (`Login.jsx`)
- **Login form**: enter a mobile number → it **saves to MongoDB** → the UI shows the saved number + Mongo ID

## Run (Windows)

### Prereqs

- **Node.js (LTS)** installed (so `node` + `npm` work)
- **MongoDB** running locally, or set a MongoDB Atlas URL

### Start dev

From the `Megamart/` folder:

```bash
npm install
cd server && npm install && cd ..
npm run dev
```

### Mongo connection

Backend defaults to:

- `mongodb://localhost:27017/megamart`

Override with:

- `MONGODB_URI="your mongodb uri"` (environment variable)
