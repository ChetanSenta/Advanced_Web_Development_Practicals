# Chetan Senta — Student Portfolio

This project is the React and Component Architecture practical for Practical 1. It is a single-page portfolio built with Vite and reusable functional components.

## Practical 2 additions

The portfolio now demonstrates state management and client-side routing:

- `/` — Home page
- `/projects` — Projects page
- `/contact` — Controlled contact form with live character count
- `*` — Custom 404 page

`BrowserRouter` is configured in `src/main.jsx`, and navigation uses `NavLink` so routes change without a full page reload. The contact form uses `useState` for the message input and a second `useState` value to toggle contact details.

## Practical 3 additions

The `/projects` route now consumes the public GitHub repositories API:

- Fetches `https://api.github.com/users/ChetanSenta/repos` with `useEffect`.
- Tracks repository data, loading, and error state with `useState`.
- Displays a loading message while the request is pending.
- Displays a retry action when the request fails.
- Renders repository name, description, language, stars, forks, and URL after success.
- Includes a search field that filters repositories by name.

## Projects page cleanup

The Projects page now uses a shared 4/8/12/16/24/32/48/64px spacing scale,
compact responsive project rows, and filled visual previews for the featured
Cashen, Pizza Delivery, and Competitive Programming projects. GitHub
repositories are displayed as responsive cards with:

- Fork/template/profile-repository filtering and a configurable ignore list.
- Sorting by latest push date and then star count.
- Featured badges for repositories already shown above.
- Skeleton loading, retry/error states, and a GitHub profile fallback link.
- A ten-minute `sessionStorage` cache, search filtering, and a show-all control.

## Component structure

- `src/App.jsx` — stores the portfolio data and composes the page.
- `src/components/NavBar.jsx` — page navigation.
- `src/components/Header.jsx` — introduction and theme-color prop example.
- `src/components/About.jsx` — education, experience, and profile summary.
- `src/components/Skills.jsx` — dynamically renders skill groups from props.
- `src/components/Projects.jsx` — dynamically renders project cards from props.
- `src/components/Footer.jsx` — contact and copyright information.
- `src/api.js` — authenticated task API client for the Practical 6 backend.
- `src/pages/TaskManager.jsx` — login, registration, and MongoDB-backed task CRUD UI.

## Practical 6 additions

The `/tasks` route connects the React application to the Node and MongoDB task
backend from Practicals 4 and 5. It supports registration, login, task
creation, completion toggling, deletion, loading states, and API error states.

Set `VITE_API_URL` when the backend is not running at `http://localhost:5000`.
The frontend expects `/register`, `/login`, and authenticated `/tasks`
endpoints. Authentication tokens are stored locally under
`task-manager-token`.

Resume details used in the page are based on Chetan Senta's resume.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Verify

```bash
npm run lint
npm run build
```
