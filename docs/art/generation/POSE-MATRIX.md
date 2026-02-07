# ControlNet Pose Matrix

> Systematic pose templates for consistent exercise icon generation.
> Each exercise maps to one pose template based on position × equipment.

## Pose Templates Needed

### Standing Poses (8)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| stand_bb | Standing | Barbell | Barbell Curl, Overhead Press, Barbell Row |
| stand_db | Standing | Dumbbell | Dumbbell Curl, Lateral Raise, Shrugs |
| stand_machine | Standing | Machine | Cable Crossover, Machine Press |
| stand_cable | Standing | Cable | Cable Curl, Face Pull, Tricep Pushdown |
| stand_kb | Standing | Kettlebell | Kettlebell Swing, KB Clean |
| stand_bw | Standing | Bodyweight | Standing Calf Raise |
| stand_band | Standing | Band | Band Pull Apart |
| stand_plate | Standing | Plate | Plate Raise |

### Seated Poses (6)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| seat_bb | Seated | Barbell | Seated OHP, Seated Curl |
| seat_db | Seated | Dumbbell | Seated DB Press, Concentration Curl |
| seat_machine | Seated | Machine | Leg Extension, Leg Curl, Seated Row |
| seat_cable | Seated | Cable | Seated Cable Row, Cable Curl |
| seat_bw | Seated | Bodyweight | Seated Calf Raise |
| seat_bench | Seated | Bench | Bench Dips |

### Lying Poses (4)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| lying_bb | Lying Flat | Barbell | Bench Press, Skull Crushers |
| lying_db | Lying Flat | Dumbbell | DB Bench, DB Fly |
| lying_machine | Lying Flat | Machine | Machine Chest Press |
| lying_bw | Lying Flat | Bodyweight | Lying Leg Raise, Crunch |

### Incline Poses (4)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| incline_bb | Incline | Barbell | Incline Bench Press |
| incline_db | Incline | Dumbbell | Incline DB Press, Incline Curl |
| incline_machine | Incline | Machine | Incline Machine Press |
| incline_cable | Incline | Cable | Incline Cable Fly |

### Decline Poses (2)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| decline_bb | Decline | Barbell | Decline Bench Press |
| decline_db | Decline | Dumbbell | Decline DB Press |

### Squat/Lunge Poses (4)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| squat_bb | Squat | Barbell | Back Squat, Front Squat |
| squat_db | Squat | Dumbbell | Goblet Squat, DB Squat |
| lunge_bb | Lunge | Barbell | Barbell Lunge |
| lunge_db | Lunge | Dumbbell | DB Lunge, Walking Lunge |

### Hinge Poses (3)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| hinge_bb | Hip Hinge | Barbell | Deadlift, RDL, Good Morning |
| hinge_db | Hip Hinge | Dumbbell | DB RDL, DB Deadlift |
| hinge_kb | Hip Hinge | Kettlebell | KB Swing, KB Deadlift |

### Special Poses (8)
| ID | Position | Equipment | Example Exercises |
|----|----------|-----------|-------------------|
| legpress | Leg Press | Machine | Leg Press, Calf Press on LP |
| pullup | Hanging | Bar | Pull-up, Chin-up, Hanging Leg Raise |
| dip | Supported | Bars | Dips, Tricep Dips |
| pushup | Floor | Bodyweight | Push-up, Diamond Push-up |
| plank | Plank | Bodyweight | Plank, Side Plank |
| row_bent | Bent Over | Any | Bent Over Row, T-Bar Row |
| olympic | Power Position | Barbell | Clean, Snatch, Jerk |
| farmer | Walking | Any | Farmer's Walk, Carry |

---

## Total Pose Templates: ~39

This covers all 637 exercises with reusable poses.

## Next Steps
1. Create or find OpenPose skeleton images for each template
2. Map each exercise ID to its pose template
3. Generate icons using ControlNet + pose reference
