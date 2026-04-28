# Simple Tip

A tiny installable tip calculator inspired by the old Android app. It has:

- keypad bill entry where `1234` means `$12.34`
- Reset and Delete keys in the phone-keypad positions
- tip percentage stepper
- bill split stepper
- instant total, tip, and per-person totals
- no ads, no network calls, no permissions, no tracking

## Try It Locally

From this folder:

```sh
python3 -m http.server 4173 -d .
```

Then open:

```text
http://127.0.0.1:4173/
```

## Install On A Samsung Galaxy

For a normal home-screen install, host this folder on any HTTPS static host, such as GitHub Pages, Netlify, Cloudflare Pages, or your own web server. Then open the HTTPS URL on the phone in Chrome or Samsung Internet and choose **Add to Home screen** or **Install app** from the browser menu.

After the first load, the service worker caches the app so it keeps working offline.
