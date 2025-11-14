# Mobile-First Design Overview

## Design Philosophy

The app has been completely redesigned with a mobile-first approach, featuring:

- **Modern, Clean Aesthetic**: Gradient backgrounds, rounded corners, and subtle shadows
- **Responsive Layout**: Optimized for screens from 320px (mobile) to 1920px+ (desktop)
- **Touch-Friendly**: Larger tap targets, improved spacing, and mobile gestures
- **Contemporary Typography**: Clean hierarchy with proper font sizes for readability
- **Accessibility**: High contrast ratios and clear visual feedback

## Key Components

### Landing Page (`StravaConnect`)
- **Full-screen hero section** with gradient background
- **Centered card layout** with feature highlights
- **Large, prominent CTA button** for Strava connection
- **Icons and emojis** for visual interest
- **Responsive grid** that stacks on mobile

### Dashboard Header
- **Sticky header** that stays visible while scrolling
- **Glassmorphism effect** with backdrop blur
- **Compact mobile layout** with icon-only buttons on small screens
- **Two-row design**: Title/actions on top, filters below
- **Badge indicators** for route count and sync status

### Settings Panel
- **Modern card design** with rounded corners and borders
- **Gradient slider tracks** showing progress visually
- **Quick preset buttons** in responsive grid
- **Color-coded sections** for different settings
- **Status indicators** with icons and animations

### Route List
- **Card-based design** with hover effects
- **Icon indicators** for metrics (runs, distance, heart rate)
- **Selected state** with gradient background
- **Numbered badges** for easy route identification
- **Scrollable container** with fixed max height

### Route Details
- **Separated map and chart cards** for better focus
- **Gradient stat cards** with icons
- **Responsive height** for maps (264px mobile, 320px tablet, 384px desktop)
- **Color-coded metrics** matching chart colors
- **Touch-optimized controls** for chart interaction

### Progress Chart
- **Button-style metric toggles** instead of checkboxes
- **Visual feedback** with borders and scale effects
- **Larger touch targets** (44px minimum)
- **Color indicators** for each metric
- **Mobile helper text** for tap instructions

## Color Scheme

### Primary Colors
- **Blue**: `rgb(59, 130, 246)` - Primary actions, links
- **Orange**: `#FC4C02` (Strava) - CTA buttons, highlights
- **Green**: `rgb(34, 197, 94)` - Success states, distance metrics
- **Red**: `rgb(239, 68, 68)` - Heart rate data
- **Purple**: `rgb(147, 51, 234)` - Chart/analytics

### Background Gradients
- **Light mode**: Gray-50 → White → Blue-50
- **Dark mode**: Gray-900 → Gray-800 → Blue-900/20
- **Cards**: White with subtle borders (light), Gray-800 with borders (dark)

### Stat Card Gradients
- **Blue stats**: `from-blue-50 to-blue-100/50` (light)
- **Green stats**: `from-green-50 to-green-100/50` (light)
- **Red stats**: `from-red-50 to-red-100/50` (light)
- **Orange stats**: `from-orange-50 to-orange-100/50` (light)

## Responsive Breakpoints

### Mobile First
- **Base (320px+)**: Single column, stacked layout, icon-only buttons
- **Small (640px+)**: Show button labels, larger padding
- **Medium (768px+)**: Two-column grids for some elements
- **Large (1024px+)**: Three-column layout, side-by-side route list and details
- **Extra Large (1280px+)**: Wider content container, more spacing

## Typography Scale

- **Headings H1**: 2.5rem (40px) mobile → 3rem (48px) desktop
- **Headings H2**: 1.125rem (18px) mobile → 1.25rem (20px) desktop
- **Body**: 0.875rem (14px) mobile → 1rem (16px) desktop
- **Small/Meta**: 0.75rem (12px) mobile → 0.875rem (14px) desktop

## Spacing System

- **Component padding**: 1rem (16px) mobile → 1.5rem (24px) desktop
- **Card gaps**: 1rem (16px) mobile → 1.5rem (24px) desktop
- **Button padding**: 0.75rem × 1rem mobile → 1rem × 1.5rem desktop
- **Icon sizes**: 1rem (16px) small → 1.25rem (20px) large

## Interactive States

### Buttons
- **Default**: Base color with shadow
- **Hover**: Darker color, larger shadow
- **Active**: Scale down slightly
- **Disabled**: Gray with reduced opacity

### Cards
- **Default**: White/Gray-800 with border
- **Hover**: Slight shadow increase
- **Selected**: Gradient background with scale effect
- **Focus**: Blue ring for keyboard navigation

## Animations

- **Page transitions**: Smooth fade-ins
- **Loading states**: Spinning border animation
- **Hover effects**: 150-200ms transitions
- **Scale effects**: `scale-[1.02]` for selected items
- **Opacity changes**: Smooth 300ms transitions

## Mobile Optimizations

1. **Touch targets**: Minimum 44×44px for all interactive elements
2. **No hover-only features**: All interactions work on touch devices
3. **Optimized images**: Responsive sizing for maps
4. **Reduced motion**: Respects user preferences
5. **Fast load times**: Minimal CSS, optimized components
6. **Offline indicators**: Clear feedback when cached vs live data
7. **Sticky headers**: Important navigation always accessible
8. **Large fonts**: Readable without zooming
9. **Clear CTAs**: Obvious primary actions
10. **Error states**: User-friendly error messages

## Accessibility Features

- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: WCAG AA compliant
- **Focus indicators**: Visible focus states
- **Alternative text**: Icons have descriptive purposes
- **Semantic HTML**: Proper heading hierarchy

## Performance

- **Lazy loading**: Charts and maps load on demand
- **Optimized re-renders**: React best practices
- **Debounced inputs**: Slider changes debounced
- **Local caching**: Reduced API calls
- **Efficient rendering**: Minimal DOM updates

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive enhancement**: Works without JavaScript for basic content
- **Fallbacks**: Gradient fallbacks for older browsers
