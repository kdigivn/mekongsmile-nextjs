# Silktide Cookie Consent Manager

This directory contains the Silktide Cookie Consent Manager implementation for the ferry ticket website.

## 📁 File Structure

```
cookie-banner/
├── silktide-consent-manager.js  # Core library (DO NOT EDIT)
├── silktide-configs.js          # Your configuration (EDIT THIS)
└── README.md                    # This file
```

## 🔧 Configuration

All customization is done in **`silktide-configs.js`**. The file is organized into clear sections:

### 1. Visual Settings
- Cookie icon position
- Banner position

### 2. Cookie Types
- Essential cookies (required)
- Analytics cookies (Google Analytics)
- Marketing cookies (Google Ads)

Each cookie type includes:
- `onAccept`: Function called when accepted
- `onReject`: Function called when rejected

### 3. Text Content
- All Vietnamese text for banner and modal
- Button labels
- Descriptions
- Privacy policy link

## 🔄 Updating the Library

When Silktide releases an update to the consent manager:

### Step 1: Update the Core Library
Replace `silktide-consent-manager.js` with the new version from Silktide:

```bash
# Download new version or copy content
curl -o silktide-consent-manager.js [NEW_VERSION_URL]
```

### Step 2: Verify Compatibility
Check that the configuration API (`updateCookieBannerConfig`) is still compatible:

1. Open the new `silktide-consent-manager.js`
2. Search for `updateCookieBannerConfig` function
3. Verify it accepts the same config structure

### Step 3: Test
1. Keep your `silktide-configs.js` unchanged
2. Load the website locally
3. Test cookie banner functionality:
   - Banner displays correctly
   - Accept/Reject buttons work
   - Cookie preferences modal opens
   - Consent choices are saved
   - Google Consent Mode V2 updates properly

### Step 4: Update Configuration (if needed)
Only if the new version requires config changes:
1. Review Silktide changelog
2. Update `silktide-configs.js` accordingly
3. Keep your customizations organized

## ✏️ Customizing Configuration

### Change Button Text
Edit the `textContent` section in `silktide-configs.js`:

```javascript
const textContent = {
  banner: {
    acceptAllButtonText: 'Your New Text',
    // ...
  }
};
```

### Add New Cookie Type
Add to the `cookieTypes` array in `silktide-configs.js`:

```javascript
const cookieTypes = [
  // ... existing types
  {
    id: 'preferences',
    name: 'Cookie preferences',
    description: 'Stores your preferences',
    defaultValue: true,
    onAccept: function() {
      // Your code here
    },
    onReject: function() {
      // Your code here
    }
  }
];
```

### Change Banner Position
Edit `visualSettings` in `silktide-configs.js`:

```javascript
const visualSettings = {
  position: {
    banner: 'bottomLeft', // Options: bottomLeft, bottomRight, topLeft, topRight, center
  }
};
```

## 🔗 Integration with Google Consent Mode V2

The configuration includes automatic Google Consent Mode V2 integration:

- **Analytics cookies** → Controls `analytics_storage`
- **Marketing cookies** → Controls `ad_storage`, `ad_user_data`, `ad_personalization`

These are automatically updated when users change their preferences.

## 🧪 Testing

After making changes:

1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Verify banner appears
4. Test accept/reject flows
5. Check Google Tag Manager events (if using GTM)

## 📚 Resources

- [Silktide Consent Manager Documentation](https://silktide.com/consent-manager/)
- [Google Consent Mode V2](https://support.google.com/tagmanager/answer/10718549)

## 🐛 Troubleshooting

### Banner doesn't appear
- Check browser console for errors
- Verify both JS files are loaded in `layout.tsx`
- Clear localStorage and cookies

### Consent not saving
- Check localStorage for keys starting with `silktideCookieChoice_`
- Verify no errors in browser console

### Google Consent Mode not updating
- Verify `gtag` is defined (Google Analytics loaded)
- Check if GTM is configured correctly
- Look for `consent_accepted_analytics` and `consent_accepted_marketing` events in GTM preview
