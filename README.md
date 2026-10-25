# NYHL-Shifts

A Nashville Youth Hockey League coach's bench tool, shared across every team
in the league: check in who's at the game, drag to set the starting order,
pick how many skaters go out at a time (3v3, 4v4, 5v5…), and tap
**Next Shift** to see who's on the ice and who's up next, with a fair
round-robin rotation. Data is stored in a Google Sheet via a small Apps
Script web app — no database to manage. The app is a static export, deployed
to GitHub Pages, the same way as
[exposure-tristar](https://github.com/nvastano/exposure-tristar).

Live at: https://nvastano.github.io/nyhl-shifts/

## Setup

1. Create a new Google Sheet.
2. Open **Extensions > Apps Script**, delete the default code, and paste in
   the contents of [`apps-script/Code.gs`](apps-script/Code.gs).
3. Click **Deploy > New deployment**, choose type **Web app**, set:
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
4. Deploy and copy the resulting web app URL.
5. In the GitHub repo, go to **Settings > Secrets and variables > Actions >
   Variables** and add `NEXT_PUBLIC_SHEETS_WEBAPP_URL` set to that URL (the
   deploy workflow reads it at build time).
6. In **Settings > Pages**, set Source to **GitHub Actions**.
7. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and
   publishes to GitHub Pages automatically.

For local development: copy `.env.local.example` to `.env.local`, set
`NEXT_PUBLIC_SHEETS_WEBAPP_URL`, then `npm install && npm run dev`.

The script auto-creates `Players`, `Games`, `Shifts`, and `Teams` tabs in the
sheet on first use (or run `setupSheets` once from the Apps Script editor to
create them up front).

## Using it

1. Go to **Roster** once and add your skaters, their jersey numbers, and a
   goalie.
2. On game day, go to the home page, check off who showed up, drag skaters
   into the order you want the rotation to start in, pick skaters per shift
   (3, 4, 5…), and tap **Start Game**.
3. Tap **Next Shift** each time you're ready to rotate. Whoever's sat out the
   longest goes out next. Tap **Sit out** on a bench player if they need a
   break or are hurt — they'll skip future rotations until toggled back on.
4. The current game is saved to your phone's browser as you go, so a refresh
   mid-game won't lose anything. Each shift is also logged to the `Shifts`
   tab in your Google Sheet as a record, best-effort (the tracker keeps
   working locally even if that sync is slow or fails, which matters on rink
   wifi).
5. Tap **End Game** (twice, to confirm) when the game's over.

## Coaching more than one team

Tap the team name in the header to open the switcher. Adding a team there
starts a brand new roster and game log — it shares this same Sheet and web
app, just in its own set of tabs (`Players_<slug>`, `Games_<slug>`,
`Shifts_<slug>`), so nothing from one team shows up in another. No new
Google Sheet or Apps Script deployment needed.

## Pages

- `/` — game day: attendance check-in, drag-to-reorder, shift size, and the
  live shift tracker.
- `/roster` — manage the skaters, jersey numbers, and goalie on the team.

## Branding

`app/icon.png`, `public/apple-touch-icon.png`, and `public/nyhl-logo.png`
are the Nashville Youth Hockey League logo, sized for their spots (512×512
square for the first two, a 546×242 landscape crop for the header/loading
logo). The logo is black-on-white, so it's shown on a small white card
rather than directly on the app's dark background — regenerate all three
from a new source image if the logo ever changes.
