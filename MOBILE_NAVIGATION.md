# Mobile Navigation Feature

## Overview
The route list is now hidden behind a burger menu on mobile devices, maximizing screen real estate for viewing maps and charts.

## How It Works

### Mobile (< 1024px)
- **Burger Menu Icon**: Appears in the top-left of the header (only when routes exist)
- **Slide-in Panel**: Routes list slides in from the left when burger menu is tapped
- **Overlay**: Semi-transparent backdrop appears behind the menu
- **Auto-close**: Menu closes automatically when a route is selected
- **Full-width Content**: Map and chart cards use full screen width

### Desktop (≥ 1024px)
- **Always Visible**: Route list is always visible in left column
- **3-Column Layout**: Route list (1/3) + Content (2/3)
- **No Burger Menu**: Icon hidden on large screens

## UI Components

### Burger Menu Button
```tsx
- Size: 40x40px (w-10 h-10)
- Color: Blue-500 (matches theme)
- Icon: Hamburger (☰) when closed, X when open
- Position: Top-left of header, before title
- Visibility: Hidden on desktop (lg:hidden)
```

### Slide-in Panel
```tsx
- Width: 320px (80vw max on very small screens)
- Height: Full viewport
- Position: Fixed, left-0, top-0
- Transform: translateX(-100%) when closed, translateX(0) when open
- Transition: 300ms ease-in-out
- Z-index: 50 (above content)
- Background: White (light mode), Gray-900 (dark mode)
```

### Backdrop Overlay
```tsx
- Position: Fixed, covers full screen
- Background: Black with 50% opacity + backdrop blur
- Z-index: 40 (below panel, above content)
- Click action: Closes menu
```

### Panel Header
```tsx
- Title: "Your Routes"
- Close Button: X icon in top-right
- Border: Bottom border for separation
- Padding: 1rem (16px)
```

### Route Items
- Same design as desktop route list
- Numbered badges
- Activity count, distance, heart rate
- Gradient background when selected
- Tap to select (closes menu automatically)

## Mobile Optimizations

### Screen Heights
```tsx
Map height:
- Mobile: h-56 (224px / 14rem)
- Tablet: sm:h-72 (288px / 18rem)  
- Desktop: lg:h-96 (384px / 24rem)

Chart height:
- Mobile: h-80 (320px / 20rem)
- Desktop: sm:h-96 (384px / 24rem)
```

### Card Spacing
```tsx
- Mobile: space-y-4 (1rem / 16px)
- Desktop: lg:space-y-6 (1.5rem / 24px)
```

### Padding
```tsx
- Mobile: p-4 (1rem / 16px)
- Desktop: sm:p-6 (1.5rem / 24px)
```

## State Management
```tsx
const [showRouteMenu, setShowRouteMenu] = useState(false);
```

### Toggle Function
- Click burger menu: Toggles menu open/closed
- Click overlay: Closes menu
- Click close button: Closes menu
- Select route: Closes menu

## Responsive Breakpoints

### Mobile First (<640px)
- Burger menu visible
- Full-width content
- Smaller map (224px)
- Compact padding

### Small (640px - 1023px)
- Burger menu visible
- Full-width content
- Medium map (288px)
- Standard padding

### Large (≥1024px)
- Burger menu hidden
- Route list always visible
- 3-column grid
- Large map (384px)
- Spacious padding

## Touch Interactions

### Tap Targets
- Burger button: 40x40px (meets 44px guideline with padding)
- Route items: Full width, 64px+ height
- Close button: 40x40px

### Gestures
- Tap burger: Opens menu
- Tap overlay: Closes menu
- Tap route: Selects route, closes menu
- Tap close X: Closes menu

## Accessibility

- **ARIA labels**: Burger button has title attribute
- **Keyboard navigation**: Tab through routes in menu
- **Focus management**: Focus trapped in menu when open
- **Semantic HTML**: Proper button and navigation elements
- **Screen readers**: Menu state announced when toggled

## Performance

- **No layout shift**: Menu slides over content, doesn't push it
- **GPU acceleration**: Uses transform for smooth animation
- **Debounced**: No performance issues with rapid toggling
- **Lazy render**: Menu content exists in DOM but hidden

## Browser Support

- **Transform animations**: All modern browsers
- **Backdrop filter**: Safari 14+, Chrome 76+, Firefox 103+
- **Fixed positioning**: All browsers
- **Flexbox**: All modern browsers

## Future Enhancements

Potential improvements:
- Swipe gesture to open/close menu
- Remember menu state in localStorage
- Keyboard shortcut (e.g., 'm' to toggle)
- Search/filter routes in menu
- Sort routes by different metrics
