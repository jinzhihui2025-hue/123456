# IPA build notes

This project is already prepared as a Capacitor iOS app source project.

## What this Windows computer can do

Run these commands here:

```bash
npm install
npm run build
```

That produces `www/`, the static app bundle used by Capacitor.

## What is needed to make a real installable IPA

Apple only supports building/signing iOS apps from macOS tooling, so an installable `.ipa` needs one of these:

- A Mac with macOS, Xcode, and Xcode Command Line Tools.
- Or a cloud Mac/iOS build service, such as Ionic Appflow or a GitHub Actions macOS runner, plus Apple signing credentials.

For Capacitor 8, the iOS tooling expects Xcode 26.0 or newer. CocoaPods is optional unless the native project or plugins are configured to use it.

## Commands on the Mac

Copy this project folder to the Mac, then run:

```bash
npm install
npm run build
npm run cap:add:ios
npm run cap:open:ios
```

In Xcode:

1. Select the `App` target.
2. Set your Apple Team.
3. Keep or change the bundle identifier, currently `com.xie.vocab`.
4. Connect your iPhone and press Run to install it directly.
5. To export an IPA, use `Product > Archive`, then `Distribute App`.

After future web changes:

```bash
npm run cap:sync:ios
```

## Offline behavior

The web app now includes a service worker cache (`sw.js`) for offline use when the browser allows service workers.

Important iPhone note: Safari generally requires HTTPS for service workers. Opening `http://192.168.x.x:8000` from your phone is useful for testing on the same Wi-Fi, but it may not cache offline. A Capacitor-installed app includes the built `www/` assets inside the app, so it does not depend on your computer or Wi-Fi for the app shell.
