<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1miNZqBHJVYSc13_oxjgNyAyHF49uxPmB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Recent Updates

### Enhanced User Experience Features

#### 1. **Clickable Project Entries**
- **What's New**: Entire project cards in the Projects page are now clickable
- **How to Use**: Simply click anywhere on a project card to view its details
- **Accessibility**: Full keyboard navigation support (Tab to focus, Enter/Space to select)
- **Visual Feedback**: Hover effects and cursor changes provide clear interaction cues
- **Backward Compatibility**: "View Live" links are preserved and remain clickable

#### 2. **Dynamic Custom Fields**
- **What's New**: Project profile pages now display context-aware field labels based on template category
- **Landing Pages**: Fields are labeled as "Hero Title", "Hero Subtitle", "Call to Action Text", etc.
- **Feedback Forms**: Fields are labeled as "Feedback Form Title", "Welcome Message", "Question 1", etc.
- **Fallback Support**: Projects without field mappings display generic "Data 1-8" labels
- **Error Handling**: Clear warnings when template category information is missing

#### 3. **Improved Chatbot Integration**
- **What's New**: Fixed scroll space issues caused by the floating chatbot button
- **Scroll Behavior**: Main dashboard container now properly handles overflow
- **Positioning**: Chatbot maintains fixed position without affecting page layout
- **Performance**: Eliminated unnecessary scroll space while preserving full functionality

## Testing

Run the test suite to verify all functionality:

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage report
npm test:coverage
```

### Test Coverage Includes:
- **Dynamic Field Rendering**: Unit tests for template category field mapping
- **Clickable Project Entries**: Tests for click behavior, keyboard navigation, and accessibility
- **Responsive Behavior**: Cross-device compatibility testing
- **Chatbot Scroll Fix**: Verification of proper CSS classes and layout behavior

## Responsive Design

All features are fully responsive and tested across:
- **Mobile Devices**: 375px width (iPhone SE, iPhone 12)
- **Tablets**: 768px width (iPad)
- **Desktop**: 1920px width (Full HD)

Features maintain functionality and visual consistency across all screen sizes.
