# Appwrite Sites Deployment Guide

## Configuration Required

### 1. Fallback File (Required)

**Critical:** For client-side routing to work, you **must** configure Appwrite Sites with a fallback file.

In your Appwrite Site settings:
- Go to **Settings** → **General**
- Set **Fallback File** to: `index.html`

This ensures that all routes (like `/notes`, `/login`, etc.) fall back to `index.html`, allowing TanStack Router to handle client-side routing.

### 2. Environment Variables

Add these environment variables in **Settings** → **Environment Variables**:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_APPWRITE_ENDPOINT` | `https://nyc.cloud.appwrite.io/v1` | Your Appwrite endpoint |
| `VITE_APPWRITE_PROJECT_ID` | `690a33cc002402960ca3` | Your Appwrite project ID |

### 3. Build Configuration

**Build Command:**
```bash
npm run build
```

**Output Directory:**
- **For Node.js Runtime (SSR)**: Set to `.output/server` 
- **For Static Runtime**: Set to `.output/public` (but TanStack Start prefers SSR)
- The server entry point is `.output/server/index.mjs`

**Install Command:**
```bash
npm install
```

### 4. Site Settings Summary

**Appwrite Sites Configuration:**
- **Framework:** TanStack Start ✅ (Select this in Appwrite Sites)
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.output/server` ⚠️ **IMPORTANT for Node.js runtime**
- **Entry Point:** `.output/server/index.mjs` (auto-detected by framework)
- **Fallback File:** May be auto-configured by TanStack Start framework
- **Node Version:** 18.x or higher

⚠️ **Important:** When you select "TanStack Start" as the framework in Appwrite Sites, it should automatically configure the correct output directory and routing. If you still see routing errors, check the Site settings.

## Troubleshooting

### "router_path_not_found" Error

This error occurs when TanStack Router can't find routes. Check these:

1. **Verify Route Tree Generation**:
   - Ensure `src/routeTree.gen.ts` exists and is up to date
   - Run `npm run build` locally and check for route generation errors
   - The route tree should include all your routes (`/`, `/login`, `/signup`, `/notes`)

2. **Appwrite Sites Configuration**:
   - **Framework**: Must be set to "TanStack Start"
   - **Output Directory**: Should be `.output/public` (for static) OR `.output/server` (for SSR)
   - **Runtime**: Check if it's set to "Node.js" or "Static" - TanStack Start may need Node.js runtime
   - **Fallback File**: If using static mode, set to `index.html` (though TanStack Start may not generate this)

3. **Check Build Output**:
   - Verify `.output/public` contains your assets
   - Check if `.output/server` exists (for SSR mode)
   - TanStack Start with Nitro generates both - Appwrite Sites needs to use the correct one

4. **Try SSR Mode**:
   - If static mode isn't working, TanStack Start might need SSR mode
   - In Appwrite Sites, ensure Node.js runtime is enabled
   - Output directory should point to `.output/server` for SSR

### Routes Not Working

If routes like `/notes` or `/login` return 404:
- Ensure **Fallback File** is set to `index.html`
- Verify the build output includes `index.html`
- Check that environment variables are set correctly

### Build Fails

If the build fails:
- Ensure all dependencies are in `package.json`
- Check that environment variables are accessible during build
- Verify Node.js version compatibility

## Quick Checklist

- [ ] Fallback file set to `index.html` in Appwrite Sites
- [ ] Environment variables added (`VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`)
- [ ] Build command configured (`npm run build`)
- [ ] Output directory configured correctly
- [ ] Site redeployed after configuration changes

