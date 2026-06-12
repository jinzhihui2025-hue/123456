#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/unsigned-ios"
IPA_PATH="$ROOT_DIR/dist/vocab-unsigned.ipa"

cd "$ROOT_DIR"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required. Run this on macOS or a macOS CI runner." >&2
  exit 1
fi

npm run build

if [ -d "$ROOT_DIR/ios/App/App.xcodeproj" ]; then
  npx cap sync ios
else
  npx cap add ios
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$ROOT_DIR/dist"

xcodebuild \
  -project "$ROOT_DIR/ios/App/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath "$BUILD_DIR/DerivedData" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="" \
  clean build

APP_PATH="$BUILD_DIR/DerivedData/Build/Products/Release-iphoneos/App.app"

if [ ! -d "$APP_PATH" ]; then
  echo "App bundle not found: $APP_PATH" >&2
  exit 1
fi

rm -rf "$BUILD_DIR/Payload"
mkdir -p "$BUILD_DIR/Payload"
cp -R "$APP_PATH" "$BUILD_DIR/Payload/App.app"
rm -rf "$BUILD_DIR/Payload/App.app/_CodeSignature"
rm -f "$BUILD_DIR/Payload/App.app/embedded.mobileprovision"
rm -f "$IPA_PATH"

(
  cd "$BUILD_DIR"
  zip -qry "$IPA_PATH" Payload
)

echo "Unsigned IPA created:"
echo "$IPA_PATH"
