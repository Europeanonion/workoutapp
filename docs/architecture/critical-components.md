# Critical Components

## Core Components

### WorkoutState
- Central state management
- Handles all data mutations
- Controls subscriber notifications
- Critical for app functionality

### Storage Service
- Persistent data storage
- State recovery
- Crash recovery capability

### Service Registry
- Dependency management
- Service lifetime control
- Component access point

## Optimization Points

### State Updates
- Debounced notifications (250ms)
- Throttled storage saves (1000ms)
- Cleanup of destroyed subscribers

### Component Loading
- Lazy loading of exercise details
- Intersection Observer usage
- On-demand rendering
