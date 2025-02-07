# System Architecture Overview

## Core Components Flow
```
App Initialization → Service Registry → WorkoutState → Views
                        ↓                    ↑
                  Storage Service ──────→ Data Flow
```

## Critical Paths

### 1. State Management Flow
```
WorkoutState ←→ Subscribers
     ↓
Storage Service
     ↓
Local Storage
```

### 2. UI Update Flow
```
State Change → Debounced Notify → Subscriber Updates → UI Refresh
                    ↓
             Throttled Save
```
