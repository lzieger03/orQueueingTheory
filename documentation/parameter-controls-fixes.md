# Parameter Controls TypeScript Error Fixes

## Issues Fixed

1. Fixed syntax errors in JSX comments. Changed from:
   ```jsx
   value={params.serviceTimeRegular || 75} /* Default to 75 seconds */
   ```
   To:
   ```jsx
   value={params.serviceTimeRegular || 75} // Default to 75 seconds
   ```

2. Updated the same fix for serviceTimeKiosk parameter to use proper JSX comment syntax.

## Explanation

When using JSX, HTML-style comments within curly braces can sometimes cause issues. It's better to use standard single-line comments for inline comments in JSX properties. The HTML-style comments were causing TypeScript to interpret them as part of an object literal or JSX expression, leading to parse errors.

This fix ensures proper syntax in the JSX code while maintaining the descriptive comments.
