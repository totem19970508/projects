# ClearLED engineering workspace

The static website is deployed to GitHub Pages from the `main` branch by
`.github/workflows/pages.yml`. Firebase continues to provide Authentication,
Firestore, Storage, and Functions; it is not used to host the website.

## GitHub Pages setup

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push the website changes to `main`, or run the workflow manually from the
   **Actions** tab.

The project site will be available at:

`https://totem19970508.github.io/projects/`

For Google sign-in, add `totem19970508.github.io` to Firebase Authentication's
authorized domains.
