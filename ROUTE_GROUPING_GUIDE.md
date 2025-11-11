# Route Grouping Settings Guide

## Overview

The **Route Grouping Settings** feature allows you to control how strictly routes are matched and grouped together. This is useful because GPS data isn't perfectly precise and can vary slightly between runs on the same route.

## How to Access

1. Start the app and log in with Strava
2. Click the **Settings** button (⚙️ icon) in the top-right corner
3. The settings panel will expand showing the threshold controls

## Understanding the Threshold

The **Similarity Threshold** is measured in meters and determines the maximum average distance between GPS tracks for them to be considered the "same route."

### What Does It Mean?

When comparing two activities, the algorithm:
1. Takes sample points from each GPS track
2. Calculates the average minimum distance between corresponding points
3. If this average distance is **less than the threshold**, they're grouped together

### Visual Example

```
Threshold = 50m (Very Strict)
Route A: ═══════════════
Route B:  ═══════════════  (✓ grouped - very close)
Route C: ═ ═ ═ ═ ═ ═ ═ ═  (✗ not grouped - GPS jitter too much)

Threshold = 200m (Balanced)
Route A: ═══════════════
Route B:  ═══════════════  (✓ grouped)
Route C: ═ ═ ═ ═ ═ ═ ═ ═  (✓ grouped - small variations OK)
Route D:     ═══════════   (✗ not grouped - different route)
```

## Recommended Settings

### Exact Matches Only (50m)
**Best for:**
- Running the exact same route repeatedly
- Track workouts on a known course
- When you want separate groups for slightly different variations

**Example:** Your morning 5K loop that you run the same way every time.

### Very Strict (100m) ⭐ **DEFAULT**
**Best for:**
- General route tracking
- Neighborhood runs with minor GPS variations
- When you occasionally start/end at slightly different spots

**Example:** Running around your neighborhood, sometimes parking in different spots.

### Strict (200m)
**Best for:**
- Routes where you sometimes take slightly different paths
- Trail runs with minor variations
- When GPS signal varies (urban canyons, tree cover)

**Example:** Trail run where you sometimes take a shortcut or variant.

### Balanced (350m)
**Best for:**
- General running in an area
- Long runs with flexible routing
- When you want to see "general area" patterns

**Example:** Running in a park, taking different loops but generally same area.

### Relaxed (500m)
**Best for:**
- Very flexible route interpretation
- Comparing runs in the same general location
- When you want fewer, broader groups

**Example:** "Runs near the waterfront" regardless of specific path.

## Quick Preset Buttons

Use the preset buttons for instant configuration:

- **Exact Only (50m)** - Nearly identical routes only
- **Very Strict (100m)** - Minor GPS variations OK
- **Strict (200m)** - Small route variations acceptable  
- **Balanced (350m)** - Moderate flexibility
- **Relaxed (500m)** - Loose matching

## Live Statistics

The settings panel shows real-time stats:

- **Total Activities**: All your running activities with GPS data
- **Unique Routes**: How many different routes detected with current threshold
- **Avg Runs/Route**: How many times you've run each route on average

Watch these numbers change as you adjust the threshold!

## Tips for Finding Your Ideal Setting

### Start Low, Adjust Up
1. Start at **50-100m** (strict matching)
2. Look at your route list
3. If you see duplicate routes that should be grouped together, increase the threshold by 50-100m
4. Repeat until you're happy with the grouping

### Signs Your Threshold is Too Low
- You see the same route listed multiple times separately
- Routes that are clearly the same appear in different groups
- Too many groups with only 1-2 activities

### Signs Your Threshold is Too High
- Routes that are clearly different are grouped together
- Your morning run and evening run (different routes) are combined
- You only have a few groups for many different routes

## Technical Details

### Algorithm
The app uses a **modified Hausdorff distance** algorithm:
- Decodes GPS polylines from Strava
- Samples every 10th GPS point for performance
- Calculates average minimum distance between routes
- Groups routes below the threshold

### Performance
- Sampling is used to keep the app fast
- Even with 100+ activities, grouping is near-instant
- Changing the threshold re-groups immediately

### GPS Accuracy
Typical GPS accuracy:
- **Phone**: 5-15m in good conditions
- **GPS Watch**: 3-10m in good conditions  
- **Poor conditions** (trees, buildings): 10-50m

This is why even the same route can have 20-50m of variation between runs.

## Examples by Use Case

### Track Athlete
**Goal:** Separate every workout precisely
```
Setting: 50m (Exact Only)
Result: 400m repeats, tempo runs, easy runs all separate
```

### Casual Runner
**Goal:** See which neighborhood routes I run most
```
Setting: 100-200m (Very Strict to Strict)
Result: Main routes grouped, minor variations combined
```

### Trail Runner
**Goal:** Group runs in the same trail system
```
Setting: 200-350m (Strict to Balanced)
Result: Different loops in same area grouped appropriately
```

### Marathon Trainer
**Goal:** Track all my long runs in the city
```
Setting: 350-500m (Balanced to Relaxed)
Result: Long runs grouped by general area/direction
```

## Troubleshooting

### All my runs show as separate routes
→ **Threshold too low**. Increase to 150-200m.

### Completely different routes are grouped together
→ **Threshold too high**. Decrease to 50-100m.

### Settings don't seem to change anything
→ Refresh the page or log out and back in.

### How to reset to default
→ Click the "Very Strict (100m)" preset button.

## FAQ

**Q: Does changing this affect my Strava data?**
A: No! This only affects how routes are displayed in this app. Your Strava data is unchanged.

**Q: Will my settings be saved?**
A: Currently, settings reset when you refresh. We may add persistence in a future update.

**Q: Can I see the actual distance between routes?**
A: Not in the UI currently, but it's calculated behind the scenes. Lower threshold = stricter matching.

**Q: What if I want routes from different cities separate?**
A: Even at 1000m, routes in different cities will naturally separate. The algorithm looks at GPS proximity.

**Q: Does this work with cycling or other activities?**
A: Currently only running activities are processed. Cycling support coming soon!

## Advanced: Manual Fine-Tuning

If you want a very specific threshold not in the presets:

1. Click and drag the slider
2. The current value shows in real-time
3. Statistics update immediately
4. Adjustable in 25m increments from 25m to 1000m

---

**Pro Tip:** Your ideal threshold depends on:
- GPS quality of your device
- How consistent your routes are
- Running environment (open vs. urban vs. trails)
- How you want to see your data organized

Experiment with different values to find what works best for you! 🏃‍♂️
