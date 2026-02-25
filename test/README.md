# Test Automation

Appium-based UI automation for ESP Rainmaker Home (React Native / Expo). Tests run on physical Android and iOS devices and use BDD feature files (pytest-bdd).

## What's Included

- User management: signup, login, forgot password, change password, logout, delete account
- BDD scenarios in `tests/01_user_management/*/` (signup.feature, login.feature, etc.)
- Config generation for CI: `scripts/ci_setup_config.py` builds `config/*.yaml` from `.example` templates and env vars
- HTML reports with screenshots/videos on failure; optional email delivery

## Prerequisites

Tests run on **physical devices**. One-time setup:

### Python 3.10+
```bash
python3 --version   # or: brew install python@3.10
```

### Appium 2.x
```bash
npm install -g appium
appium driver install uiautomator2   # Android
appium driver install xcuitest       # iOS
```

### Android
- [Android Studio](https://developer.android.com/studio) — SDK Manager → install SDK, Platform-Tools
- Enable **USB debugging** on device: Settings → Developer options
- Export (Linux: use `~/Android/Sdk`; macOS: `~/Library/Android/sdk`):
  ```bash
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/platform-tools:$PATH"
  ```
- Verify: `adb devices` (first column value is UDID)

### iOS (macOS only)
- **Xcode 16.3+** — [Install from Mac App Store](https://developer.apple.com/xcode/)
- **Command Line Tools**: `xcode-select --install`
- Physical device: trust computer, enable Developer Mode (Settings → Privacy & Security)
- **WebDriverAgent** (for Appium): Build & sign in Xcode — see [Real device config](https://appium.github.io/appium-xcuitest-driver/5.8/real-device-config/). 
  
  Set `xcodeOrgId`, `xcodeSigningId`, `updatedWDABundleId` in `config/app.yaml`.

## How to Run Tests

1. Install dependencies:
   ```bash
   cd test
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. IMPORTANT: Generate config (or copy `.example` files and fill manually ex: mailosaur key etc):
   ```bash
   cp ../.env.example ../.env    # in repo root; add secrets as needed
   python3 scripts/ci_setup_config.py
   ```

3. Build the apps:
   - **Android:** [Building for Production - Android](../README.md#android-release-build)
   - **iOS:** [Building for Production - iOS](../README.md#ios-release-build)

4. Run pytest with `--model` and `--chip`. If the model is not found, `config/mobiles.yaml` is auto-synced from connected devices.

   **Required arguments (device):**
   - `--model MODEL`: Device model. Use this command to get the model string:
     ```bash
     adb shell getprop ro.product.model
     ```
     Or if multiple connected devices: `adb -s <UDID> shell getprop ro.product.model`
   - `--chip CHIP`: ESP chip for device tests (e.g. esp32c3, esp32s2).

   **Optional arguments:**
   - `-m MARKER`: Pytest marker filter — `sanity`, `regression` (omit to run all)
   - `--install-app y|n`: Install app before run (default: y)
   - `--start-servers`: Start Appium servers (default: true)
   - `--deployment production`: Deployment from `config/deployment.yaml`

   **Android Quick Run:** Place the APK at `test/artifacts/android/app-release.apk`
   ```bash
   python3 -m pytest --model "SM-S711B" --chip esp32s2 -m regression -v
   ```

   **iOS Quick Run:** To skip reinstall, use `--install-app n`:
   ```bash
   python3 -m pytest --model "iPhone 13" --chip esp32c3 -m sanity -v --install-app n
   ```

   **Parallel runs (Android + iOS):** `./scripts/run_parallel.sh -m sanity` (use `-d 'model:chip,...'` to override devices)

## How to Add Test Cases

1. Add a `.feature` file (Gherkin) in `tests/<feature_name_as_folder>/`.
2. Add step definitions (`@given`, `@when`, `@then`) in the corresponding `test_*.py`; pytest-bdd matches steps by text.
3. Add locators in `locators/<page>.json`; page helpers use them via `get_element_locator()`.
4. For new screens, add a page helper in `utils/page_helpers/` extending `BasePage`.

See [pytest-bdd documentation](https://pytest-bdd.readthedocs.io/) for step reuse, parametrization, and shared fixtures.

## Test Report

- Reports are written to `reports/` by default (configurable via `config/report_config.yaml`)
- HTML report includes charts, screenshots, and videos on failure
- `config/report_config.yaml` can enable local HTTP hosting and email delivery (SMTP)
- CI runs generate reports; email recipients come from `config/report_config.yaml` (stakeholders section)

## CI Variables

GitLab CI uses these variables (set in project or `.env`):

**Build stage:**
- `ANDROID_HOME`: Android SDK path
- `.env` created from `.env.example`; app build reads `BASE_URL`, `ENABLE_THIRD_PARTY_AUTH`, etc.

**Test stage:**
- `MODEL`, `CHIP`, `MARKER`: Override default device/chip/pytest marker
- `ANDROID_HOME`, `ANDROID_APP_APPLICATION_ID`, `IOS_APP_APPLICATION_ID`: For `config/app.yaml`
- `BASE_URL`, `API_VERSION`, `DEPLOYMENT_URI`: For `config/deployment.yaml`
- `MAILOSAUR_API_KEY`, `MAILOSAUR_SERVER_ID`, `MAILOSAUR_DOMAIN`: Email testing (Mailosaur)
- `EMAIL_SENDER`, `EMAIL_PASSWORD`, `EMAIL_SMPT_SERVER`: Report email delivery
- `STAKEHOLDER_DEFAULT_RECIPIENTS`, `STAKEHOLDER_SANITY_RECIPIENTS`, `STAKEHOLDER_REGRESSION_RECIPIENTS`: JSON arrays of email addresses for report delivery

Config templates use placeholders like `${VAR}` or `${VAR:-default}`. Run `scripts/ci_setup_config.py` before pytest in CI; it loads `.env` and generates `config/deployment.yaml`, `config/report_config.yaml`, `config/app.yaml`.
