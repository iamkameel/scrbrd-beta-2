---
trigger: model_decision
description: Player Skills and Attribute Matrix 
---

continue

erDiagram
    PERSON {
        string personId PK
        string firstName
        string lastName
        string email
    }

    PLAYER_PROFILE {
        string profileId PK
        string personId FK
        string primaryRole
        string battingStyle
        string bowlingStyle
        int    currentAbility
        int    potentialAbility
        int    reputation
        int    heightCM
        int    weightKG
    }

    BATTING_ATTRIBUTES {
        string profileId FK
        int frontFoot
        int backFoot
        int powerHitting
        int timing
        int shotRange
        int sweep
        int reverseSweep
        int spinReading
        int seamAdaptation
        int strikeRotation
        int finishing
    }

    BOWLING_ATTRIBUTES {
        string profileId FK
        int stockBallControl
        int variations
        int powerplaySkill
        int middleOversControl
        int deathOversSkill
        int lineLengthConsistency
        int spinManipulation
        int releaseMechanics
        int tacticalOverConstruction
    }

    FIELDING_ATTRIBUTES {
        string profileId FK
        int closeCatching
        int deepCatching
        int groundFielding
        int throwingPower
        int throwingAccuracy
        int reactionSpeed
        int anticipation
    }

    MENTAL_ATTRIBUTES {
        string profileId FK
        int temperament
        int gameAwareness
        int pressureHandling
        int patience
        int killerInstinct
        int decisionMaking
        int adaptability
        int workEthic
        int leadership
        int competitiveness
    }

    PHYSICAL_ATTRIBUTES {
        string profileId FK
        int speed
        int acceleration
        int agility
        int strength
        int stamina
        int balance
        int coreFitness
        int injuryResistance
    }

    PLAYER_TRAIT {
        string traitId PK
        string profileId FK
        string name
    }

    ROLE_RATING {
        string roleRatingId PK
        string profileId FK
        string roleCode
        int    rating     // 1–5 stars or 1–20
    }

    SEASON_STATS {
        string seasonStatsId PK
        string profileId FK
        string seasonId  FK
        string teamId    FK
        string format    // T20, 50-over, 2-day, etc.
        int    matches
        int    runs
        float  battingAverage
        float  strikeRate
        int    wickets
        float  economy
        int    catches
        int    momAwards
    }

    ZONE_ANALYSIS {
        string zoneId PK
        string profileId FK
        string type      // "strength" or "weakness"
        string zoneLabel // e.g. "Extra Cover", "Short Ball 4th Stump"
        string description
    }

    ACHIEVEMENT {
        string achievementId PK
        string profileId FK
        string title
        string description
        date   achievedOn
    }

    COACH_REPORT {
        string reportId PK
        string profileId FK
        string summary
        string pros
        string cons
        date   createdAt
        string coachId
    }

    TEAM {
        string teamId PK
        string name
        string schoolId
    }

    SEASON {
        string seasonId PK
        date   startDate
        date   endDate
    }

    %% RELATIONSHIPS

    PERSON ||--|| PLAYER_PROFILE : "has"
    PLAYER_PROFILE ||--|| BATTING_ATTRIBUTES : "has"
    PLAYER_PROFILE ||--|| BOWLING_ATTRIBUTES : "has"
    PLAYER_PROFILE ||--|| FIELDING_ATTRIBUTES : "has"
    PLAYER_PROFILE ||--|| MENTAL_ATTRIBUTES : "has"
    PLAYER_PROFILE ||--|| PHYSICAL_ATTRIBUTES : "has"

    PLAYER_PROFILE ||--o{ PLAYER_TRAIT : "exhibits"
    PLAYER_PROFILE ||--o{ ROLE_RATING : "suitableFor"
    PLAYER_PROFILE ||--o{ SEASON_STATS : "records"
    PLAYER_PROFILE ||--o{ ZONE_ANALYSIS : "analysedIn"
    PLAYER_PROFILE ||--o{ ACHIEVEMENT : "earns"
    PLAYER_PROFILE ||--o{ COACH_REPORT : "assessedBy"

    SEASON ||--o{ SEASON_STATS : "contextFor"
    TEAM   ||--o{ SEASON_STATS : "represents"
