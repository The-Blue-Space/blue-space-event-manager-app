# Dashboard Drag & Drop Feature Documentation

## Overview

The dashboard Activities section now supports drag-and-drop rearrangement of components with persistent layout storage.

---

## Features

### 1. **Draggable Components**

- Growth Charts
- Revenue Chart
- Active Events
- Upcoming Events

### 2. **Layout Structure**

The dashboard uses a 3-column grid layout:

```
┌─────────────────┬──────────────┬──────────────┐
│ Column 1        │ Column 2     │ Column 3     │
│ (Vertical Stack)│ (Single)     │ (Single)     │
├─────────────────┼──────────────┼──────────────┤
│ Growth Charts   │ Active       │ Upcoming     │
│                 │ Events       │ Events       │
│ Revenue Chart   │              │              │
└─────────────────┴──────────────┴──────────────┘
```

### 3. **Drag Rules**

#### Within Column 1 (Vertical Stack)

- **Allowed:** Swap positions between Growth Charts and Revenue Chart
- **Example:** Revenue Chart can move to top, Growth Charts to bottom

#### Between Columns (Horizontal)

- **Allowed:** Swap any component between Column 1, Column 2, and Column 3
- **Examples:**
  - Active Events → Column 1 (replaces one of the stacked charts)
  - Growth Charts → Column 2 (becomes single column)
  - Revenue Chart → Column 3 (becomes single column)

#### Restrictions

- **No Stacking:** Only Column 1 allows stacked components (max 2)
- **Always 2 in Column 1:** When you move a component from Column 2/3 to Column 1, it pushes another component out

---

## Implementation Details

### File Structure

```
features/home/activities/
├── index.tsx              # Main drag & drop logic
├── draggable-card.tsx     # Wrapper for draggable components
├── growth-charts.tsx
├── revenue-chart.tsx
├── active-events/
└── upcoming-events/
```

### Key Technologies

- **@dnd-kit/core** - Core drag and drop functionality
- **@dnd-kit/sortable** - Sortable list behavior
- **@dnd-kit/utilities** - Helper utilities
- **localStorage** - Layout persistence via `useStorage` hook

### State Management

#### Layout Configuration

```typescript
type ComponentId = "growth-charts" | "revenue-chart" | "active-events" | "upcoming-events";

type LayoutConfig = {
	column1: ComponentId[]; // Array of 2 components (vertical stack)
	column2: ComponentId; // Single component
	column3: ComponentId; // Single component
};
```

#### Default Layout

```typescript
const DEFAULT_LAYOUT: LayoutConfig = {
	column1: ["growth-charts", "revenue-chart"],
	column2: "active-events",
	column3: "upcoming-events",
};
```

### Persistence

The layout is automatically saved to localStorage:

- **Key:** `dashboard-layout`
- **Storage Type:** `localStorage` (persists across sessions)
- **Auto-save:** Updates whenever layout changes
- **Auto-load:** Restores on page mount

---

## User Experience

### Drag Handle

- **Location:** Left side of each component card
- **Icon:** Grip vertical (⋮⋮)
- **Appearance:**
  - Always visible
  - Hover: Shadow increases, opacity 100%
  - Default: Slight opacity (60%)
  - Active drag: Cursor changes to "grabbing"

### Drag Overlay

- **Effect:** Semi-transparent preview (50% opacity)
- **Transform:** Slight rotation (3°) and scale (105%)
- **Purpose:** Visual feedback during drag

### Visual States

1. **Idle:** Normal appearance with visible drag handle
2. **Hover:** Drag handle becomes more prominent
3. **Dragging:** Component becomes semi-transparent, overlay shows preview
4. **Drop:** Smooth transition to new position

---

## Code Examples

### Using the Drag Handle

The drag handle is automatically added by the `DraggableCard` wrapper:

```tsx
<DraggableCard id="growth-charts">
	<GrowthCharts />
</DraggableCard>
```

### Resetting to Default Layout

Users can clear localStorage to reset:

```javascript
localStorage.removeItem("dashboard-layout");
// Then refresh the page
```

---

## Testing Scenarios

### Test Case 1: Swap within Column 1

1. Drag Revenue Chart up
2. Drop on Growth Charts
3. **Expected:** Positions swap, layout persists

### Test Case 2: Move to Different Column

1. Drag Active Events from Column 2
2. Drop on Growth Charts in Column 1
3. **Expected:**
   - Active Events enters Column 1
   - Growth Charts moves to Column 2
   - Layout persists

### Test Case 3: Persistence

1. Rearrange components
2. Refresh the page
3. **Expected:** Layout remains as configured

### Test Case 4: Cross-browser

1. Configure layout in Chrome
2. Open in same browser (new tab)
3. **Expected:** Same layout appears

---

## Future Enhancements (Optional)

1. **Reset Button:** Add UI button to restore default layout
2. **Multiple Presets:** Save multiple layout configurations
3. **Cloud Sync:** Store preferences in backend for cross-device sync
4. **Touch Support:** Optimize for mobile/tablet drag and drop
5. **Keyboard Navigation:** Accessibility improvements for keyboard-only users
6. **Animation:** Smooth transitions when components swap positions

---

## Browser Compatibility

Tested and supported on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Performance Considerations

- **Minimal Re-renders:** Only affected components re-render during drag
- **Optimized Storage:** Layout saved only when changed, not on every render
- **Lazy Loading:** Components load independently
- **Smooth Animations:** Hardware-accelerated CSS transforms

---

## Troubleshooting

### Layout Not Persisting

- Check browser localStorage is enabled
- Verify no browser extensions blocking storage
- Check console for errors

### Drag Not Working

- Ensure @dnd-kit libraries are installed
- Check for JavaScript errors in console
- Verify drag handle is visible and clickable

### Components Overlapping

- This shouldn't happen with current logic
- If it does, clear localStorage and refresh
- Report as bug with steps to reproduce

