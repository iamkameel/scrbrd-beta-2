# Comprehensive Profile Rollout Plan

This document outlines the strategy for implementing "Football Manager" style profiles for all specialized roles in SCRBRD. The goal is to provide deep, attribute-driven data for every key person involved in the cricket ecosystem.

## 🎯 Phase 1: Match Officials (High Impact)

### 1.1 Umpire Profiles

**Objective:** Track umpire performance, decision accuracy, and match management skills to aid in appointments.

* **Data Structure (`UmpireProfile`)**
  * **Core:** Certification Level (Level 1-4, Elite Panel), Home Association.
  * **Attributes (1-20):**
    * *Decision Making:* LBW Judgement, Caught Behind, Run Out Positioning, DRS Accuracy.
    * *Match Control:* Player Management, Conflict Resolution, Time Management, Law Application.
    * *Physical:* Fitness, Endurance, Positioning Agility.
  * **Stats:** Matches Officiated (by format), Decisions Overturned (if DRS data exists), Average Match Duration.
  * **Traits:** "Strict on Wides", "Good Communicator", "Allows Flow".

* **Implementation Steps:**
    1. Define `UmpireProfile` and attribute interfaces in `firestore.ts`.
    2. Create Zod validation schema in `umpireSchema.ts`.
    3. Build `UmpireForm` with attribute sliders and trait manager.
    4. Create `UmpireProfileView` with "Decision Matrix" visualization.

### 1.2 Scorer Profiles

**Objective:** Ensure data integrity by tracking scorer accuracy and reliability.

* **Data Structure (`ScorerProfile`)**
  * **Core:** Certification, Preferred Method (Digital/Linear), Experience.
  * **Attributes (1-20):**
    * *Technical:* Software Proficiency (PlayHQ, CricHQ, SCRBRD), Law Knowledge (DLS).
    * *Professional:* Concentration, Speed, Accuracy, Communication.
  * **Stats:** Matches Scored, Correction Rate (edits made post-match).

* **Implementation Steps:**
    1. Define `ScorerProfile` in `firestore.ts`.
    2. Create `ScorerForm` and validation.
    3. Integrate into "Match Officials" assignment workflow.

---

## 🏥 Phase 2: Support Staff (Medium Impact)

### 2.1 Medical / Physio Profiles

**Objective:** Manage player welfare and track injury rehabilitation expertise.

* **Data Structure (`MedicalProfile`)**
  * **Core:** Qualifications (Degree, Specializations), Registration Number.
  * **Attributes (1-20):**
    * *Clinical:* Diagnosis Accuracy, Taping/Strapping, Emergency Response.
    * *Rehab:* Return-to-Play Planning, Strength & Conditioning Integration.
  * **Tags:** "Shoulder Specialist", "Concussion Protocol Expert".

* **Implementation Steps:**
    1. Define `MedicalProfile` schema.
    2. Create `MedicalForm`.
    3. Link to "Injury Management" module (future feature).

### 2.2 Groundskeeper Profiles

**Objective:** Track pitch preparation quality and field maintenance.

* **Data Structure (`GroundskeeperProfile`)**
  * **Core:** Experience, Machinery Licenses.
  * **Attributes (1-20):**
    * *Pitch Prep:* Pace Generation, Spin Promotion, Durability.
    * *Outfield:* Drainage Management, Grass Health, Boundary Marking.
  * **Stats:** Average Pitch Rating (from Captain/Umpire reports).

* **Implementation Steps:**
    1. Define `GroundskeeperProfile` schema.
    2. Create `GroundskeeperForm`.
    3. Link to "Fields & Venues" module.

---

## 🛠 Technical Implementation Strategy

### Shared Infrastructure

To avoid code duplication, we will leverage the patterns established in the Player and Coach profiles:

1. **Unified `Person` Schema:** All profiles will live as nested objects (`umpireProfile`, `scorerProfile`, etc.) within the main `Person` document.
2. **Reusable Components:**
    * `AttributeSliderGroup`: For rendering blocks of 1-20 attributes.
    * `TraitManager`: For managing tag-based traits.
    * `ProfileHeader`: Standardized header with avatar, role badge, and quick stats.
3. **Dynamic Routing:**
    * The `/people/[id]` page will act as a "Smart Router", checking the user's role and rendering the appropriate Profile View component (`PlayerView`, `CoachView`, `UmpireView`, etc.).
    * The `/people/[id]/edit` page will similarly route to the correct Form component.

### Rollout Schedule

| Phase | Profile Type | Est. Effort | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **1** | **Umpire** | 2 Days | Schema, Form, Profile View, Assignment Integration |
| **2** | **Scorer** | 1 Day | Schema, Form, Profile View |
| **3** | **Medical** | 1 Day | Schema, Form, Basic View |
| **4** | **Grounds** | 1 Day | Schema, Form, Field Linkage |

## 🚀 Immediate Next Step

Begin **Phase 1: Umpire Profiles** by defining the schema and updating the `Person` interface.
