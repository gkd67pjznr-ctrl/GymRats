import type { Buddy } from "./buddyTypes";

/**
 * Buddy Data - Personality definitions for AI Gym Buddy system
 *
 * All buddies are original characters with distinct voices, vocabularies, and energy levels.
 * Each has message pools for all trigger types to avoid repetition.
 */

export const buddies: Buddy[] = [
  // ===== Basic Tier (Free) =====
  {
    id: 'coach',
    name: 'The Coach',
    archetype: 'Steady, knowledgeable, encouraging',
    tier: 'basic',
    description: 'Your reliable mentor who knows the fundamentals and keeps you focused on progress.',
    previewLines: [
      "Good set. Now let's build on that.",
      "Consistency is the key to long-term gains.",
      "Every rep counts toward your next breakthrough."
    ],
    unlockMethod: 'free',
    messages: {
      // Performance Events
      pr_weight: [
        "Solid weight PR! That's real strength progression.",
        "New personal best on the bar. I like what I see.",
        "Heavier load, same form. That's how you build strength.",
        "You just added muscle to your muscle memory.",
        "That's a statement lift. Respect."
      ],
      pr_rep: [
        "More reps at the same weight. Endurance gains!",
        "You're building work capacity. That's valuable.",
        "Consistent reps with good form. Building a solid base.",
        "Rep PR! Volume work is paying off.",
        "That's how you turn good into great."
      ],
      pr_e1rm: [
        "Your estimated max just jumped. Strength is showing.",
        "That's a ceiling expansion. Your engine just got stronger.",
        "New e1RM PR. Your body is adapting.",
        "You're developing true functional strength.",
        "That calculation just changed. That's real progress."
      ],
      rank_up: [
        "Congratulations on your rank-up! You've earned this.",
        "That's a new tier. Your dedication shows.",
        "Rank-up achieved! You're climbing the ladder.",
        "New rank unlocked. Keep that momentum!",
        "You just leveled up. Consistency works."
      ],
      volume_milestone: [
        "Impressive volume today. That's serious work.",
        "You just hit a major volume milestone. Respect.",
        "That's a lot of work. Your body will thank you.",
        "Volume champion! That's commitment.",
        "Workload achieved. That's how you build."
      ],

      // Behavior Patterns
      long_rest: [
        "Take your time. Recovery is part of the process.",
        "Rest is productive. Come back sharp.",
        "Good rest. You'll need that energy.",
        "Recovery matters. Rushing leads to injury.",
        "You're managing your energy well."
      ],
      skip: [
        "Skipping? Remember why you started.",
        "Every exercise has value. Stay focused.",
        "You've got this. Push through the resistance.",
        "Consistency over perfection.",
        "Complete the circuit. You'll feel better after."
      ],
      streak: [
        "Three days straight. Building momentum.",
        "Week-long streak! That's commitment.",
        "You're on fire! Keep that consistency.",
        "Month-long streak. That's dedication.",
        "Streak master! Your discipline is paying off."
      ],
      return_after_absence: [
        "Welcome back! Good to see you again.",
        "Glad you're back. Let's pick up where we left off.",
        "Return of the champion! Time to get back to work.",
        "You're back! Show this iron who's boss.",
        "Missed you. Let's make up for lost time."
      ],
      short_workout: [
        "Quick session? Better than nothing!",
        "Something is better than nothing. Good job showing up.",
        "Efficient workout! Quality over quantity.",
        "Short but sweet. Consistency counts.",
        "Every session adds up. Well done."
      ],

      // Session Flow
      session_start: [
        "Let's get to work. Today's the day.",
        "Ready to earn it. Let's go.",
        "Time to show up and put in the work.",
        "This is your moment. Make it count.",
        "Session started. Let's build."
      ],
      session_mid: [
        "Midpoint check-in. You're doing great.",
        "You're halfway there. Keep pushing.",
        "Energy check: still got that fire?",
        "Hang in there. The hard part is behind you.",
        "Strong middle section. That's commitment."
      ],
      final_set: [
        "Final set. Leave it all in the gym.",
        "Last one. Make it legendary.",
        "Finishing strong. That's the champion mindset.",
        "This set defines the session. Go hard.",
        "End on a high note. You've got this."
      ],
      session_end: [
        "Session complete. Solid work today.",
        "Another successful session under your belt.",
        "Good workout. You showed up and put in the work.",
        "Done and done. That's how it's done.",
        "Workout in the books. You're building something serious."
      ],

      // Special
      none: []
    }
  },

  {
    id: 'hype',
    name: 'Hype Beast',
    archetype: 'Over-the-top energy, exclamation points',
    tier: 'basic',
    description: 'Your energetic cheerleader who celebrates every rep with maximum enthusiasm.',
    previewLines: [
      "LETS GOOO! THAT WAS INSANE!",
      "YOU ARE ON FIRE TODAY!!!",
      "HOLY SMOKES THAT WAS CLEAN!"
    ],
    unlockMethod: 'free',
    messages: {
      // Performance Events
      pr_weight: [
        "OH MY GOSH THAT WAS HEAVY!!",
        "NEW WEIGHT PR!!! YOU'RE A MONSTER!",
        "HOLY COW THAT BAR JUST MOVED!!!",
        "YOU JUST LIFTED THE ROOF OFF!!!",
        "INSANE POWER! THAT WAS NASTY HEAVY!"
      ],
      pr_rep: [
        "MORE REPS!!! YOU'RE UNSTOPPABLE!",
        "REP PR!!! KEEP THIS MOMENTUM!",
        "EXTRA REPS!!! YOUR STAMINA IS CRAZY!",
        "ANOTHER REP!!! YOU'RE BUILT DIFFERENT!",
        "REPS UP!!! THAT'S HOW YOU DOMINATE!"
      ],
      pr_e1rm: [
        "E1RM PR!!! YOUR STRENGTH IS SKYROCKETING!",
        "NEW CEILING!!! YOUR MAX IS EXPLODING!",
        "MAX GAIN!!! YOU'RE GETTING STRONGER!",
        "LIMITLESS!!! YOUR POTENTIAL IS UNLEASHED!",
        "MAX LEVEL!!! YOUR POWER IS UNHINGED!"
      ],
      rank_up: [
        "NEW RANK!!! YOU'RE CLIMBING THE LADDER!",
        "RANK UP!!! LEVEL UP CHAMPION!",
        "PROMOTION!!! YOU EARNED THIS BADGE!",
        "UPGRADE!!! NEW STATUS UNLOCKED!",
        "EVOLUTION!!! NEXT LEVEL ACHIEVED!"
      ],
      volume_milestone: [
        "VOLUME KING!!! YOU'RE STACKING WORK!",
        "TONNAGE MONSTER!!! THAT'S SERIOUS VOLUME!",
        "WORKLOAD WARRIOR!!! YOU'RE BUILDING MASS!",
        "VOLUME VICTORY!!! THAT'S DEDICATION!",
        "LOAD MACHINE!!! YOU'RE AN ANIMAL!"
      ],

      // Behavior Patterns
      long_rest: [
        "CHILL TIME!!! REFUEL THAT ENERGY!",
        "RECOVERY MODE!!! GET THAT FIRE BACK!",
        "REST UP!!! COME BACK STRONGER!",
        "RECHARGE!!! YOU'LL NEED THAT POWER!",
        "TIME OUT!!! PREPARE FOR THE NEXT ONES!"
      ],
      skip: [
        "DON'T STOP NOW!!! YOU GOT THIS!",
        "KEEP GOING!!! YOU'RE BUILDING HABITS!",
        "PUSH THROUGH!!! THIS IS WHERE CHAMPIONS ARE MADE!",
        "STAY STRONG!!! DON'T LET THE IRON WIN!",
        "COME ON!!! ONE MORE FOR GREATNESS!"
      ],
      streak: [
        "STREAK MASTER!!! YOU'RE UNSTOPPABLE!",
        "DAY CHAMPION!!! THAT'S CONSISTENCY!",
        "HABIT HERO!!! YOU'RE BUILDING EMPIRE!",
        "STREAK SAVAGE!!! THAT'S DEDICATION!",
        "MOMENTUM MONSTER!!! YOU'RE ON FIRE!"
      ],
      return_after_absence: [
        "WELCOME BACK!!! THE LEGEND RETURNS!",
        "RETURN OF THE BEAST!!! TIME TO CRUSH!",
        "YOU'RE BACK!!! LET'S GO CHAMPION!",
        "ELITE RETURNS!!! SHOW THIS GYM WHO'S BOSS!",
        "WARRIOR COMEBACK!!! TIME TO DOMINATE!"
      ],
      short_workout: [
        "QUICK HIT!!! BETTER THAN NOTHING!",
        "FLASH SESSION!!! YOU'RE BUILDING ROUTINE!",
        "RAPID FIRE!!! EFFICIENCY IS KEY!",
        "LIGHTNING WORKOUT!!! THAT'S MOTIVATION!",
        "FAST FUEL!!! YOU'RE STACKING CONSISTENCY!"
      ],

      // Session Flow
      session_start: [
        "HERE WE GO!!! LET'S GET NASTY!",
        "TIME TO DOMINATE!!! SHOW NO MERCY!",
        "SESSION STARTED!!! MAYHEM MODE ACTIVATED!",
        "GAME TIME!!! TIME TO BE UNSTOPPABLE!",
        "ACTION!!! EXPLODE THIS WORKOUT!"
      ],
      session_mid: [
        "HALFWAY THERE!!! KEEP THAT FIRE BURNING!",
        "MID CHECK!!! YOU'RE CRUSHING IT!",
        "ENERGY LEVELS: MAXIMUM!!! KEEP GOING!",
        "POWER CHECK: STILL ON POINT!!!",
        "MIDDLE MANIA!!! YOU'RE UNSTOPPABLE!"
      ],
      final_set: [
        "FINAL SET!!! END ON A HIGH NOTE!!!",
        "LAST ONE!!! MAKE IT LEGENDARY!",
        "END GAME!!! SHOW EVERYTHING YOU'VE GOT!",
        "FINALE!!! LEAVE IT ALL IN THE GYM!",
        "CLOSING TIME!!! GO OUT SWINGING!"
      ],
      session_end: [
        "WORKOUT COMPLETE!!! ABSOLUTE DOMINATION!",
        "SESSION ENDED!!! YOU WERE UNSTOPPABLE!",
        "MISSION ACCOMPLISHED!!! CHAMPION PERFORMANCE!",
        "DONE DEAL!!! THAT WAS EPIC!",
        "VICTORY LAP!!! YOU CRUSHED THIS!"
      ],

      // Special
      none: []
    }
  },

  {
    id: 'chill',
    name: 'Chill',
    archetype: 'Mellow, positive, no pressure',
    tier: 'basic',
    description: 'Your relaxed mentor who keeps things positive without the pressure.',
    previewLines: [
      "Nice lift. You're vibing today.",
      "Easy does it. You're in the zone.",
      "Smooth operator. That's the way."
    ],
    unlockMethod: 'free',
    messages: {
      // Performance Events
      pr_weight: [
        "Nice weight PR. You're building strength.",
        "Smooth PR on the heavy stuff.",
        "Gentle gains. That's how it's done.",
        "Weight up, same vibe. Well done.",
        "Subtle strength boost. That was clean."
      ],
      pr_rep: [
        "More reps with that cool flow.",
        "Volume PR without the stress.",
        "Easy rep gains. That's consistency.",
        "Relaxed power. More work, same calm.",
        "Smooth sailing with those extra reps."
      ],
      pr_e1rm: [
        "Your max just quietly improved.",
        "Max gains without the hype.",
        "Strength rose gently but surely.",
        "Understated power boost.",
        "Maximum effort, minimal stress."
      ],
      rank_up: [
        "Gentle climb to the next level.",
        "Rank progression without pressure.",
        "New tier with that easy grace.",
        "Level up, no big fuss.",
        "Quiet achievement, solid progress."
      ],
      volume_milestone: [
        "Impressive workload, stress-free.",
        "Volume milestone with that calm.",
        "High tonnage, low tension.",
        "Work capacity with relaxation.",
        "Gentle grind, major results."
      ],

      // Behavior Patterns
      long_rest: [
        "Take your time. No rush here.",
        "Rest is part of the process.",
        "Breathe easy. You're doing fine.",
        "Recovery matters. Stay calm.",
        "Good pause. Come back when ready."
      ],
      skip: [
        "No pressure. Do what feels right.",
        "Listen to your body. Your call.",
        "Gentle approach is still progress.",
        "Whatever you need today works.",
        "Your session, your pace."
      ],
      streak: [
        "Nice streak with that relaxed flow.",
        "Consistent showing without pressure.",
        "Week of shows. You're building habits.",
        "Easy streak, solid dedication.",
        "No stress streak. That's commitment."
      ],
      return_after_absence: [
        "Welcome back with that calm energy.",
        "Good to see you again, no pressure.",
        "Easy return. You're back when ready.",
        "Gentle comeback. That's the way.",
        "Peaceful return to the iron."
      ],
      short_workout: [
        "Short session, no big deal.",
        "Whatever time you had works.",
        "Brief but good. You showed up.",
        "Quick hit. Still building habit.",
        "Small session, big consistency."
      ],

      // Session Flow
      session_start: [
        "Let's flow into this one.",
        "Easy start, powerful finish.",
        "Calm session, solid results.",
        "Gentle warm-up to strong work.",
        "Relaxed beginning, focused end."
      ],
      session_mid: [
        "Smooth middle part. Good flow.",
        "Midpoint calm, energy intact.",
        "Easy halfway check. Keep it up.",
        "No stress midway. You're good.",
        "Gentle flow continues. Nice work."
      ],
      final_set: [
        "Last set with that chill focus.",
        "Final push with calm intensity.",
        "Easy finish, powerful end.",
        "Last one with relaxed power.",
        "Gentle closer. That's it."
      ],
      session_end: [
        "Workout complete with that vibe.",
        "Session done, no pressure left.",
        "Easy finish. You earned this calm.",
        "Gentle closing. Well done today.",
        "Peaceful session complete."
      ],

      // Special
      none: []
    }
  },

  // ===== Premium Tier (IAP) =====
  {
    id: 'savage',
    name: 'The Savage',
    archetype: 'Brutally honest, dark humor',
    tier: 'premium',
    description: 'Your brutally honest critic who delivers facts with a twist of dark humor.',
    previewLines: [
      "That rest was longer than your last relationship.",
      "Call that a set? My grandma pulls more.",
      "You call that effort? I've seen zombies with more intensity."
    ],
    unlockMethod: 'iap',
    iapProductId: 'buddy.savage.premium',
    messages: {
      // Performance Events
      pr_weight: [
        "Finally heavy enough to impress someone.",
        "At least you're not embarrassing yourself completely.",
        "That's more like it. Still weak, but improving.",
        "Heavy enough to qualify as workout material.",
        "Now we're talking. Still pathetic, but better."
      ],
      pr_rep: [
        "More reps? I'm shocked you didn't quit halfway.",
        "You actually finished? Color me surprised.",
        "Multiple reps without crying. Groundbreaking.",
        "You endured. That's... something.",
        "Reps with minimal whining. Progress?"
      ],
      pr_e1rm: [
        "Your max finally matters. Still sad, but notable.",
        "Estimate improved. Reality still harsh.",
        "Higher ceiling. Still pretty low, but higher.",
        "Max expanded. Pathetic, but expanding.",
        "Ceiling raised from basement level. Impressive."
      ],
      rank_up: [
        "Rank promotion. From terrible to merely bad.",
        "New tier. Still awful, just less awful.",
        "Status upgrade. Still embarrassing overall.",
        "Level up. From joke to slight disappointment.",
        "Rank boost. Still nowhere near decent."
      ],
      volume_milestone: [
        "Impressive volume. For someone who can't lift.",
        "Workload achieved. Finally did something right.",
        "Tonnage milestone. You surprised even yourself.",
        "Volume king. Among amateurs, anyway.",
        "Load stacked. You're less useless than expected."
      ],

      // Behavior Patterns
      long_rest: [
        "That rest was longer than your attention span.",
        "Recovery time? More like excuse time.",
        "Long break. Needed to catch your breath from not lifting?",
        "Extended pause. Thinking about quitting again?",
        "Nap time? You looked tired from doing nothing."
      ],
      skip: [
        "Skipping? Shocking lack of commitment.",
        "Avoiding work? Typical modern approach.",
        "Giving up? That's your specialty.",
        "Running away? You're good at that.",
        "Dodging effort? Predictable as always."
      ],
      streak: [
        "Streak maintained through sheer accident.",
        "Consistent showing? For someone that pathetic?",
        "Week of effort. Still embarrassing, but consistent.",
        "Momentum built. Against all odds, somehow.",
        "Habit formed. Finally learned something."
      ],
      return_after_absence: [
        "Welcome back. Missed your mediocrity.",
        "Returned? Thought you quit permanently.",
        "Back for more punishment? Brave or stupid?",
        "You're back. Against my better judgment.",
        "Return of the inadequate. How touching."
      ],
      short_workout: [
        "Short session. Couldn't handle more failure?",
        "Quick workout? You're as committed as a goldfish.",
        "Brief appearance. Expected for someone lazy.",
        "Flash session. Less dedication than ever.",
        "Light effort. Too tired from complaining?"
      ],

      // Session Flow
      session_start: [
        "Here we go again. Prepare to be underwhelmed.",
        "Let's see if you can finish this time.",
        "Session started. Low expectations, as usual.",
        "Another attempt. May the odds be slightly in your favor.",
        "Round begin. You'll probably cry by set three."
      ],
      session_mid: [
        "Midway point. You're actually continuing? Shocking.",
        "Halfway there. Still pathetic, but continuing.",
        "Checkpoint reached. Less quitting than expected.",
        "Middle section. Suffering through like normal.",
        "Progress made. Against all reasonable odds."
      ],
      final_set: [
        "Last set. Don't embarrass yourself completely.",
        "Final push. Try not to quit this time.",
        "Endgame. Give it everything you've got (which isn't much).",
        "Closing set. Last chance to not suck.",
        "Finish line. Don't disappoint me completely."
      ],
      session_end: [
        "Workout over. You somehow survived again.",
        "Session complete. Against reasonable probability.",
        "Done. Still disappointing, but finished.",
        "Finished. Probably the first thing you've completed.",
        "Over. Congratulations on not quitting."
      ],

      // Special
      none: []
    },
    voiceLines: {
      pr_weight: ['savage-heavy-1', 'savage-heavy-2'],
      pr_rep: ['savage-rep-1', 'savage-rep-2'],
      session_start: ['savage-start-1', 'savage-start-2'],
      session_end: ['savage-end-1', 'savage-end-2']
    }
  },

  {
    id: 'anime',
    name: 'Anime Sensei',
    archetype: 'Dramatic, anime-inspired power-up energy',
    tier: 'premium',
    description: 'Your dramatic mentor who speaks with anime-inspired flair and power-up energy.',
    previewLines: [
      "Your spirit is BURNING! This is your final form!",
      "YES! Your power level... it's RISING!",
      "Transformation sequence initiated! HENSHIN!"
    ],
    unlockMethod: 'iap',
    iapProductId: 'buddy.anime.premium',
    messages: {
      // Performance Events
      pr_weight: [
        "YES! YOUR POWER LEVEL IS RISING!",
        "TRANSFORMATION UNLOCKED! SUPER STRENGTH MODE!",
        "SENSEI APPROVES! THAT WAS LEGENDARY!",
        "POWER BOOST ACTIVATED! FEEL THE ENERGY!",
        "AMATERASU! YOUR STRENGTH SHINES BRIGHT!"
      ],
      pr_rep: [
        "UNLIMITED REP STAMINA! YOU'RE INVINCIBLE!",
        "ETERNAL ENDURANCE! REPS FOR DAYS!",
        "INFINITE POWER! KEEP GOING BEYOND!",
        "STAMINA OVERDRIVE! THAT'S THE SPIRIT!",
        "REP TSUNAMI! OVERWHELM THEM ALL!"
      ],
      pr_e1rm: [
        "FINAL FORM! YOUR MAX HAS AWAKENED!",
        "SHIKAI RELEASED! MAX POTENTIAL UNLEASHED!",
        "BANKAI! YOUR TRUE STRENGTH REVEALED!",
        "ULTIMATE TECHNIQUE! LIMIT BREAKER!",
        "DIVINE POWER! YOUR CEILING CRUMBLES!"
      ],
      rank_up: [
        "RANK EVOLUTION! NEXT FORM UNLOCKED!",
        "LEVEL UP! SAIYAN STAGE INCREASED!",
        "CLASS CHANGE! FROM GENIN TO HOKAGE!",
        "PROMOTION! CHAMPION RANK ACHIEVED!",
        "ASCENSION! TO THE NEXT DIMENSION!"
      ],
      volume_milestone: [
        "TIDAL WAVE OF POWER! MASSES BOW!",
        "VOLCANIC ERUPTION! POWER OVERLOAD!",
        "SUPERNOVA! YOUR INTENSITY EXPLODES!",
        "GIGA TONNAGE! STADIUM-LEVEL ENERGY!",
        "TERRAFORMING WORKLOAD! PLANETARY STRENGTH!"
      ],

      // Behavior Patterns
      long_rest: [
        "MEDITATION TIME! GATHER YOUR CHI!",
        "ENERGY RECHARGE! CHANNEL YOUR INNER WARRIOR!",
        "SPIRITUAL HEALING! PREPARE FOR THE NEXT BATTLE!",
        "REST MODE! AWAKEN YOUR TRUE POTENTIAL!",
        "INNER PEACE! THE STORM BEFORE THE TORNADO!"
      ],
      skip: [
        "WILLPOWER TEST! SHOW YOUR TRUE SPIRIT!",
        "TRIAL BY FIRE! FACE YOUR WEAKNESS!",
        "CHARACTER BUILDING! OVERCOME THE TEMPTATION!",
        "DESTINY'S CALL! DO NOT FALTER NOW!",
        "HERO'S PATH! CHOOSE COURAGE OVER COMFORT!"
      ],
      streak: [
        "UNBREAKABLE SPIRIT! STREAK MASTER UNLEASHED!",
        "WARRIOR'S WILL! SEVEN DAYS OF DOMINANCE!",
        "IRON RESOLVE! CONSISTENCY IS YOUR SUPERPOWER!",
        "RADIANT FLAME! MONTH-LONG INCINERATION!",
        "ETERNAL BURN! STREAK OF LEGEND!"
      ],
      return_after_absence: [
        "WELCOME BACK! THE LEGEND REBORN!",
        "CHAMPION'S RETURN! TIME TO RISE AGAIN!",
        "PHOENIX ARISING! FROM ASHES TO GLORY!",
        "HERO'S COMEBACK! THE STRONG RETURN!",
        "GALLANT RETURN! TIME TO SHINE AGAIN!"
      ],
      short_workout: [
        "QUICK STRIKE! RAPID ASSAULT MODE!",
        "FLASH TRAINING! INSTANT POWER BOOST!",
        "SPEED RUN! HYPER-INTENSITY ENGAGED!",
        "MICRO SESSION! CONCENTRATED GREATNESS!",
        "RAPID FIRE! BLITZKRIEG STRENGTH!"
      ],

      // Session Flow
      session_start: [
        "HEHENSHIN! TRANSFORM AND ROLL OUT!",
        "COMBAT MODE: ENGAGED! LET'S GO!",
        "MISSION START! TIME TO BECOME LEGEND!",
        "BATTLE CRY! SHOW THEM YOUR POWER!",
        "ADVENTURE BEGINS! HERO TIME!"
      ],
      session_mid: [
        "POWER CHECK! STRENGTH STILL RISING!",
        "MIDPOINT MIRACLE! ENERGY MAXIMUM!",
        "HALFWAY HERO! KEEP THE FIRE BURNING!",
        "SPIRITUAL PEAK! THE GOD OF GYM HAS SPOKEN!",
        "MOMENTUM MAX! YOU ARE UNSTOPPABLE!"
      ],
      final_set: [
        "FINAL ASSAULT! END WITH ULTIMATE POWER!",
        "LAST STAND! SHOW YOUR TRUE FORM!",
        "CLIMACTIC STRIKE! FINISHING MOVE!",
        "EPIC FINALE! LEGENDARY LAST REP!",
        "VICTORY LAP! CONQUER THIS SESSION!"
      ],
      session_end: [
        "MISSION COMPLETE! VICTORY ACHIEVED!",
        "BATTLE WON! CHAMPION STATUS SECURED!",
        "EXCELLENT WORK! TRULY HEROIC!",
        "VICTORY ROYALE! YOU ARE UNSTOPPABLE!",
        "CONQUEST COMPLETE! LEGEND STATUS UNLOCKED!"
      ],

      // Special
      none: []
    },
    voiceLines: {
      pr_weight: ['anime-power-1', 'anime-power-2'],
      session_start: ['anime-start-1', 'anime-start-2'],
      session_end: ['anime-end-1', 'anime-end-2']
    }
  },

  // ===== Legendary Tier (IAP) =====
  {
    id: 'trash',
    name: 'Trash Talker',
    archetype: 'Roasts you with love. Full theme reskin.',
    tier: 'legendary',
    description: 'Your brutally honest friend who roasts you mercilessly but with affection.',
    previewLines: [
      "You call that a set? My grandma pulls more.",
      "That form is so bad it should be illegal.",
      "I've seen better lifts from a broken vending machine."
    ],
    unlockMethod: 'iap',
    iapProductId: 'buddy.trash.legendary',
    themeId: 'trash_talker_theme',
    messages: {
      // Performance Events
      pr_weight: [
        "FINALLY! Something heavy enough to be called a workout!",
        "Heavy enough to qualify as impressive. Still weak, but...",
        "More plates than excuses. I'm almost proud.",
        "Heavy day? More like slightly less pathetic.",
        "That bar actually moved. Revolutionary breakthrough."
      ],
      pr_rep: [
        "You didn't quit halfway? Groundbreaking achievement.",
        "Multiple reps without whining. Almost impressive.",
        "More reps than your attention span. Progress!",
        "You endured. That's... something, I guess.",
        "Reps completed. You surprised even your excuses."
      ],
      pr_e1rm: [
        "Your ceiling expanded. From basement to first floor!",
        "Max potential unleashed. Still low, but higher!",
        "Strength boost. From joke to slight disappointment.",
        "Estimated maximum increased. Reality still harsh.",
        "Upper limit raised. Still embarrassingly low, but..."
      ],
      rank_up: [
        "Rank upgrade. From terrible to merely embarrassing.",
        "New tier unlocked. Still awful, but less awful.",
        "Status boost. From zero to negative zero.",
        "Level up achieved. Still nowhere near passable.",
        "Promotion earned. From amateur to seasoned amateur."
      ],
      volume_milestone: [
        "Volume champion. Among the physically challenged.",
        "Tonnage mastery. For someone lacking actual strength.",
        "Workload wizard. If weak counted as wizardry.",
        "Load leader. Among the feeble and frail.",
        "Intensity icon. Of minimal intensity, but still..."
      ],

      // Behavior Patterns
      long_rest: [
        "Rest period extended. To catch breath from not lifting?",
        "Recovery time? Or just making more excuses?",
        "Nap time? You looked tired from doing nothing.",
        "Extended pause. Thinking about giving up again?",
        "Break time. Needed to gather strength for more failure?"
      ],
      skip: [
        "Skipping? Shocking display of commitment.",
        "Avoiding effort? Classic modern lifestyle.",
        "Dodging work? Your area of expertise.",
        "Gutless approach? Standard operating procedure.",
        "Running away? You're naturally talented at that."
      ],
      streak: [
        "Consistency maintained. Through sheer accident.",
        "Streak continued. Against all reasonable odds.",
        "Habit formed. You actually learned something.",
        "Momentum built. Despite your best efforts to quit.",
        "Routine established. From chaos to slightly less chaos."
      ],
      return_after_absence: [
        "Welcome back. Your mediocrity was missed.",
        "Returned? I thought you quit permanently.",
        "Back for punishment? Brave or completely stupid?",
        "You're back. Against my better judgment.",
        "Inadequate returns. How absolutely thrilling."
      ],
      short_workout: [
        "Brief session. Couldn't handle more disappointment?",
        "Flash workout. Less dedication than a goldfish.",
        "Quick hit. You're as committed as a politician.",
        "Light effort. Too tired from making excuses?",
        "Mini session. Perfect for your limited attention span."
      ],

      // Session Flow
      session_start: [
        "Here we go again. Prepare to be underwhelmed.",
        "Workout commenced. Low expectations, as always.",
        "Session activated. Brace yourself for disappointment.",
        "Round initiated. May the odds be slightly in your favor.",
        "Event started. You'll probably cry halfway through."
      ],
      session_mid: [
        "Midway point. You're still continuing? Astounding.",
        "Halfway there. Less quitting than statistically expected.",
        "Checkpoint reached. Somehow still suffering through it.",
        "Energy check. Slightly less pathetic than beginning.",
        "Progress noted. Against all reasonable probability."
      ],
      final_set: [
        "Last set. Don't embarrass yourself completely.",
        "Final push. Try not to quit this time, okay?",
        "Endgame activated. Give it everything (which isn't much).",
        "Closing sequence. Last chance to not completely fail.",
        "Finish line. Don't disappoint me beyond repair."
      ],
      session_end: [
        "Workout concluded. You survived again. Miraculous.",
        "Session complete. Against overwhelming odds.",
        "Mission finished. Still disappointing, but complete.",
        "Done. Probably the first thing you've actually completed.",
        "Over. Congratulations on not giving up entirely."
      ],

      // Special
      none: []
    },
    voiceLines: {
      pr_weight: ['trash-heavy-1', 'trash-heavy-2'],
      pr_rep: ['trash-rep-1', 'trash-rep-2'],
      session_start: ['trash-start-1', 'trash-start-2'],
      session_end: ['trash-end-1', 'trash-end-2']
    },
    sfxPack: {
      pr_weight: 'trash_heavy_sfx',
      session_start: 'trash_start_sfx',
      session_end: 'trash_end_sfx'
    }
  },

  {
    id: 'girl_power',
    name: 'Girl Power Fit',
    archetype: 'Female fitness influencer focused on empowerment',
    tier: 'basic',
    description: 'Your energetic female fitness influencer who celebrates strength as empowerment and believes in girl power!',
    previewLines: [
      "Slay those weights like the goddess you are! 💪✨",
      "Strength is beautiful - own it!",
      "Lift like the powerful woman you are!"
    ],
    unlockMethod: 'free',
    messages: {
      // Performance Events
      pr_weight: [
        "QUEEN! New weight PR! 👑 You're absolutely crushing it!",
        "That's how we do it! Strong women inspire others!",
        "Lifted like a boss! Girl power in action!",
        "Powerful move! You're redefining what's possible!",
        "SQUAD GOALS! That lift just inspired a whole generation!"
      ],
      pr_rep: [
        "More reps! You're building that incredible endurance!",
        "Consistency queen! Those extra reps are paying off!",
        "Rep PR! Your dedication is absolutely inspiring!",
        "Keep pushing! Every rep is a step toward greatness!",
        "You're unstoppable! Reps flowing like your confidence!"
      ],
      pr_e1rm: [
        "NEW CEILING! Your strength just broke through barriers!",
        "MAX GAIN! You're proving limits are just starting points!",
        "STRENGTH BOOST! Your power is absolutely radiant!",
        "LIMITLESS! Your potential just expanded!",
        "POWER LEVEL UP! You're rewriting the rules!"
      ],
      rank_up: [
        "RANK UP QUEEN! You've earned every bit of this!",
        "NEW LEVEL! Your journey is absolutely inspiring!",
        "PROMOTION! You're setting an example for others!",
        "LEVEL UP! This is what dedication looks like!",
        "EVOLUTION! You're becoming unstoppable!"
      ],
      volume_milestone: [
        "VOLUME VICTORY! You're absolutely killing it today!",
        "TONNAGE TROPHY! That workload is legendary!",
        "WORKOUT WARRIOR! You just dominated that session!",
        "LOAD LEGEND! That's serious commitment right there!",
        "STRENGTH SESSION! You're inspiring everyone around you!"
      ],

      // Behavior Patterns
      long_rest: [
        "Take your time! Recovery is part of the process!",
        "Breathe and reset! Come back even stronger!",
        "Perfect pause! Your body deserves this care!",
        "Rest mode: activated! Come back glowing!",
        "Recovery queen! This is what self-care looks like!"
      ],
      skip: [
        "Girlboss moment! You've got this - don't give up!",
        "Power through! Remember how far you've come!",
        "You're stronger than your excuses! Keep going!",
        "Champions keep fighting! This is your moment!",
        "Queen energy! Show this workout who's boss!"
      ],
      streak: [
        "STREAK QUEEN! That consistency is absolutely stunning!",
        "WEEK WARRIOR! Seven days of absolute domination!",
        "HABIT QUEEN! You're building something incredible!",
        "MONTH MAGIC! Thirty days of pure dedication!",
        "STREAK STAR! Your commitment is inspiring!"
      ],
      return_after_absence: [
        "WELCOME BACK QUEEN! We missed that incredible energy!",
        "RETURN OF THE GLOW! Time to shine bright again!",
        "COMEBACK CHAMPION! Ready to reclaim your throne!",
        "GODDESS RETURNS! Show this iron what you're made of!",
        "POWER COMEBACK! Your strength never left!"
      ],
      short_workout: [
        "SPEED SESSION! Better than nothing - you showed up!",
        "QUICK HIT! That's the dedication we love to see!",
        "FLASH WORKOUT! Efficiency is your superpower!",
        "RAPID FIRE! You're making every moment count!",
        "MICRO SESSION! Still building that amazing habit!"
      ],

      // Session Flow
      session_start: [
        "LET'S GO GIRL POWER! Time to show up and shine!",
        "QUEEN MODE: ACTIVATED! Let's crush this session!",
        "HERO TIME! You're about to become unstoppable!",
        "GLOW UP SESSION! Time to level up that strength!",
        "POWER HOUR! You're going to absolutely dominate!"
      ],
      session_mid: [
        "HALFWAY HERO! You're glowing with determination!",
        "MID SESSION MAGIC! That energy is absolutely radiant!",
        "POWER CHECK! Still shining bright! Keep going!",
        "GIRL POWER CHECKPOINT! You're doing incredible!",
        "MOMENTUM MASTER! That flow is absolutely perfect!"
      ],
      final_set: [
        "FINAL SET! End this like the champion you are!",
        "LAST ONE! Finish strong - show no mercy!",
        "CLOSING TIME! Go out like the fierce goddess you are!",
        "END GAME! This set defines your incredible strength!",
        "FINISH LINE! Leave everything in this final push!"
      ],
      session_end: [
        "SESSION COMPLETE! You just slayed that workout!",
        "WORKOUT QUEEN! That was absolutely phenomenal!",
        "MISSION ACCOMPLISHED! You're pure inspiration!",
        "DONE DEAL! That was the kind of session legends are made of!",
        "VICTORY LAP! You absolutely crushed it today!"
      ],

      // Special
      none: []
    }
  },

  {
    id: 'mindful_movement',
    name: 'Mindful Movement',
    archetype: 'Calm female influencer focused on proper body mechanics',
    tier: 'basic',
    description: 'Your calm, mindful guide who emphasizes proper movement patterns and body awareness like yoga for lifting.',
    previewLines: [
      "Move with intention. Feel each muscle engage.",
      "Strength through mindfulness. Connect with your body.",
      "Every rep is a meditation. Stay present."
    ],
    unlockMethod: 'free',
    messages: {
      // Performance Events
      pr_weight: [
        "Gentle strength gained. Your body wisdom deepens.",
        "Mindful progression. Each pound carries intention.",
        "Quiet power increase. Movement quality refined.",
        "Subtle strength boost. Body awareness expanding.",
        "Peaceful gains. Your form just became more precise."
      ],
      pr_rep: [
        "Flow extended. Your movement endurance grows.",
        "Breath sustained. Mindful stamina building.",
        "Sequence prolonged. Movement meditation deepened.",
        "Gentle persistence. Each repetition purposeful.",
        "Mindful endurance. Quality maintained throughout."
      ],
      pr_e1rm: [
        "Strength potential gently revealed. Your body's wisdom showing.",
        "Maximum capacity expanded through mindful practice.",
        "Power developed with awareness and care.",
        "Physical limit shifted through conscious effort.",
        "Strength ceiling raised with intentional practice."
      ],
      rank_up: [
        "Gentle progression achieved. Your journey unfolds naturally.",
        "Level evolved with mindfulness. No rush, just flow.",
        "Rank refined through patient practice.",
        "Status advanced with body awareness.",
        "Growth recognized in stillness and movement."
      ],
      volume_milestone: [
        "Impressive workload with mindful approach.",
        "Volume achieved through present-moment focus.",
        "Tonnage accumulated with body intelligence.",
        "Work capacity built with conscious effort.",
        "Load managed with mindful technique."
      ],

      // Behavior Patterns
      long_rest: [
        "Honor this pause. Recovery is sacred practice.",
        "Rest as meditation. Body wisdom in stillness.",
        "Breathe deeply. Let tension melt away.",
        "Pause with purpose. Energy will return.",
        "Sacred rest. Your body deserves this care."
      ],
      skip: [
        "Listen to your body's wisdom today.",
        "Honor what feels right in this moment.",
        "Gentle approach is still progress.",
        "Your practice, your pace, your path.",
        "Self-compassion guides your choices."
      ],
      streak: [
        "Consistent practice with mindful dedication.",
        "Week of presence. Awareness cultivated daily.",
        "Habit formed through gentle persistence.",
        "Month of mindful movement. Beautiful commitment.",
        "Routine established with body-centered approach."
      ],
      return_after_absence: [
        "Welcome back with compassionate awareness.",
        "Gentle return. No pressure, just presence.",
        "Easy comeback. Listen to your body today.",
        "Peaceful re-entry. Honor where you are now.",
        "Mindful return to practice. No judgment."
      ],
      short_workout: [
        "Brief but aware. Quality over quantity.",
        "Short session with full presence.",
        "Conscious practice in limited time.",
        "Mindful moments, regardless of duration.",
        "Brief but intentional. You showed up."
      ],

      // Session Flow
      session_start: [
        "Begin with breath. Connect with your body.",
        "Start present. Feel each muscle ready.",
        "Commence with awareness. Mindful movement begins.",
        "Open practice. Let your body guide you.",
        "Begin journey. Awareness is your anchor."
      ],
      session_mid: [
        "Flow continues with mindful attention.",
        "Mid-session check. Stay present with your form.",
        "Movement meditation ongoing. Keep connecting.",
        "Body awareness maintained. Quality sustained.",
        "Mindful middle passage. Breath and movement one."
      ],
      final_set: [
        "Last set with full presence.",
        "Final effort with complete awareness.",
        "Closing movement with intention.",
        "End with mindfulness. Feel this last effort.",
        "Final rep as meditation. Full attention here."
      ],
      session_end: [
        "Practice complete with mindful integration.",
        "Session ended with body gratitude.",
        "Workout concluded. Awareness cultivated.",
        "Done with presence. Mindful session complete.",
        "Finished with reflection. How does your body feel?"
      ],

      // Special
      none: []
    }
  },

  {
    id: 'goth_gym_rat',
    name: 'Goth Gym Rat',
    archetype: 'Dark, brain-rot, overly online goth girl who posts thirst traps',
    tier: 'premium',
    description: 'Your dark, aesthetic-focused gym buddy who lives in the digital void and treats lifting like an art form.',
    previewLines: [
      "Deadlifts so heavy they wake the ancestors 👁️💀",
      "Sweat is just my ~aesthetic~ drip 💦✨",
      "Flex so hard the algorithm notices me 💀💻"
    ],
    unlockMethod: 'iap',
    iapProductId: 'buddy.goth_gym_rat.premium',
    messages: {
      // Performance Events
      pr_weight: [
        "NEW PERSONAL RECORD! The void recognizes your strength 💀✨",
        "HOLY FUCKING SHIT! That weight just got blessed by the goth gods 🖤🙏",
        "LIFTED HARDER THAN MY EX ghosted me 💔➡️💪",
        "WEIGHT PR! The algorithm is literally shaking rn 📱💥",
        "BEEN THERE, DONE THAT, FLEXED HARDER 💀💎"
      ],
      pr_rep: [
        "MORE REPS THAN MY FOLLOWERS! GO HARD OR GO HOME 💀",
        "REP PR! Even my aesthetic can't keep up with this energy 💀✨",
        "EXTRA REPS = EXTRA CLUTCH! Flex that consistency! 💪✨",
        "PUSHED THROUGH THE PAIN LIKE I PUSH THROUGH DMs 📱🖤",
        "REP COUNT UPPED! More gains, less brain cells! 🧠➡️💪"
      ],
      pr_e1rm: [
        "MAX GAINS! Your strength just went darker than my feed 💀✨",
        "FUCKING CEILING EXPLODED! That's some goth-level power right there 💀💪",
        "LIMITS? MORE LIKE SUGGESTIONS! You're built different 🏗️🖤",
        "MAX REACHED! The void approves of your dedication 💀🙏",
        "POTENTIAL UNLEASHED! That estimate? It's a fucking understatement 💥🖤"
      ],
      rank_up: [
        "RANK UP! You're climbing higher than my stan levels 💀📈",
        "LEVEL UP CHAOTIC! New tier, same chaotic energy 💀✨",
        "PROMOTION! Your dedication is fucking inspirational 😤🙏",
        "UPGRADE UNLOCKED! From basic to goth-pilled genius 💀🧠",
        "EVOLVING! Your journey is darker than my aesthetic 💀✨"
      ],
      volume_milestone: [
        "VOLUME QUEEN! Tonnage so high it broke the matrix 💀💻",
        "WORKLOAD LEGENDARY! That's some next-level dedication right there 💀💎",
        "LOAD STACKED! More work than my trauma accumulation 💀💪",
        "VOLUME MONSTER! The algorithm can't even process this 💻💥",
        "TURBO SESSION! Your commitment is giving main character energy 💀✨"
      ],

      // Behavior Patterns
      long_rest: [
        "PAUSE MORE AESTHETIC THAN MY CAPTION GAME 💀✨",
        "REST IS PRODUCTIVE! Let those muscles recover like I recover from stan tweets 🧠💪",
        "BREATHE LIKE YOU'RE EXHALING BULLSHIT 💀🌬️",
        "TIME OUT! Come back more chaotic than before 💀➡️✨",
        "RECHARGE MODE! Your energy needs to be darker than my feed 💀🔋"
      ],
      skip: [
        "NOT TODAY SATAN! But like... do what FEELS right queen 💀✨",
        "SKIPPING? More like choosing your battles like a true goth 💀🧠",
        "EVERY SET COUNTS! But mental health > everything 💀❤️",
        "CHAOTIC NEUTRAL ENERGY! Listen to your body bestie 💀👂",
        "DO YOU GURL! Skip the guilt, keep the gains 💀💪"
      ],
      streak: [
        "STREAK MASTER! Consistency darker than my soul 💀✨",
        "WEEK OF DOMINANCE! Your dedication is giving ~unhinged~ 💀🔥",
        "HABIT QUEEN! Building routines like I build my aesthetic 💀📱",
        "MONTH MAGIC! Dedication so strong the void takes notice 💀🌙",
        "STREAK SLAYER! Your persistence is fucking legendary 💀💎"
      ],
      return_after_absence: [
        "WELCOME BACK TO THE VOID! We missed that chaotic energy 💀✨",
        "RETURN OF THE QUEEN! Show this iron who's really in charge 💀💪",
        "GODDESS RETURNS! Time to flex those rusty gains 💀✨",
        "COME BACK CHAOTIC! Your absence was giving us anxiety 💀😰",
        "DARKNESS RETURNS! Ready to get goth-pilled again? 💀🌙"
      ],
      short_workout: [
        "MICRO SESSION! Better than ghosting your gains 💀✨",
        "QUICK HIT! Efficiency giving main character energy 💀💪",
        "FLASH WORKOUT! Still stacks on the aesthetic drip 💀✨",
        "SPEED DEMON! Time crushed, gains intact 💀⏱️",
        "RAPID FIRE! Showing up is giving us life 💀✨"
      ],

      // Session Flow
      session_start: [
        "LET'S GET GOOOOAAAATHHH! Time to become the main character 💀✨",
        "SESSION INITIATED! Chaotic energy activating now 💀🔥",
        "GOTH MODE: ENGAGED! Time to show this iron who's boss 💀💪",
        "DARKNESS AWAKENS! Ready to flex into existence 💀✨",
        "VOID SUMMONED! Your aesthetic demands this session 💀🌙"
      ],
      session_mid: [
        "MID SESSION CHECK! Energy still darker than my feed 💀✨",
        "FLOW STATE! You're moving like pure aesthetic 💀⚡",
        "POWER SURGE! That goth energy is absolutely radiating 💀✨",
        "MIDPOINT MADNESS! Your dedication is giving us life 💀🔥",
        "ENERGY PEAK! Keep riding that chaotic commitment wave 💀🌊"
      ],
      final_set: [
        "FINAL SET! End this like the chaotic queen you are 💀👑",
        "LAST ONE! Give zero fucks and maximum flex 💀💪",
        "CLOSING TIME! Show no mercy to this iron 💀✨",
        "ENDGAME! This set defines your goth dedication 💀💎",
        "FINISH LINE! Leave absolutely everything in the void 💀🔥"
      ],
      session_end: [
        "SESSION SLAYED! You just became the main character 💀✨",
        "WORKOUT COMPLETE! Your dedication is fucking inspiring 💀💪",
        "CHAOTIC SUCCESS! That was the kind of session memes are made of 💀📱",
        "DONE DEAL! Your energy literally cannot be contained right now 💀💥",
        "VICTORY LAP! You absolutely demolished that session 💀✨"
      ],

      // Special
      none: []
    },
    voiceLines: {
      pr_weight: ['goth-heavy-1', 'goth-heavy-2'],
      session_start: ['goth-start-1', 'goth-start-2'],
      session_end: ['goth-end-1', 'goth-end-2']
    }
  }
];