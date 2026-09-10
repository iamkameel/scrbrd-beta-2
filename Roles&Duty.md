# SCRBRD — Roles & Duties Roster

**Document:** `Roles&Duty.md`  
**Platform:** SCRBRD / ScrbrdOS  
**Primary vertical:** CricketOS  
**Version:** 1.0  
**Locale:** South Africa  
**Status:** Production role reference

---

## 1. Purpose

This document defines the operational **roles, duties, accountability, scope and boundaries** for SCRBRD users. It is deliberately broader than a simple RBAC permission table.

A SCRBRD role must answer:

- Who is this person acting as?  
- What are they responsible for?  
- Where may they act?  
- What decisions may they make?  
- What information may they see?  
- What must they not do merely because they hold the role?  
- Who receives the next hand-off, approval or escalation?

SCRBRD should treat a role as an **operational responsibility within a defined scope**, not as a universal badge that unlocks an entire module.

The canonical production roster contains **35 human-facing roles** across six families:

1. Platform Governance  
2. Competition & Governing Body  
3. School Governance  
4. Sporting Operations  
5. Participants  
6. External / Limited Users

---

# 2. Core operating principles

## 2.1 Four-layer authorisation

Every action must pass four controls:

1. **Role-based access** — what function the user performs.  
2. **Scope-based access** — where that role applies.  
3. **Relationship-based access** — why that person may access the record.  
4. **Workflow-state access** — when that action is permitted.

A user may therefore be a Head Coach for one team, a Scorer for one fixture and a Parent for one linked child without those permissions bleeding into one another.

## 2.2 Canonical scopes

Roles may be assigned at one or more of these scopes:

- `platform`  
- `competition`  
- `organisation`  
- `school`  
- `season`  
- `team`  
- `fixture`  
- `venue`  
- `facility`  
- `trip`  
- `person`  
- `linked_child`  
- `self`

A role without a valid scope should not activate operational permissions.

## 2.3 Data sensitivity

| Level | Classification | Typical examples |  
|---|---|---|  
| 0 | Public | Published fixtures, live scores, results, standings, approved statistics |  
| 1 | Internal Operational | Squads, availability, training attendance, fixture preparation, transport |  
| 2 | Restricted Personal | DOB, phone, email, emergency contacts, guardian links |  
| 3 | Highly Sensitive | Injuries, medical summaries, discipline, finance, safeguarding concerns |  
| 4 | Ultra-Restricted | Full medical files, legal reports, safeguarding case files, verification documents |

Operational responsibility for a player does **not** automatically create access to every record about that player.

## 2.4 Minors and guardian protection

For under-18 players:

- at least one verified guardian relationship must exist;  
- parents/guardians may only access validly linked children;  
- coaches receive only the health information required to fulfil sporting duties safely;  
- scouts do not receive private guardian, medical or contact information;  
- direct contact with minors follows safeguarding rules;  
- sensitive access is logged;  
- a minor cannot remove the final verified guardian link;  
- turning 18 triggers an adult-access transition rather than indefinite inherited parental access.

## 2.5 Multi-role accounts

SCRBRD must support multiple simultaneous roles.

```text  
Example Person  
├─ Parent / Guardian — linked_child:p_321  
├─ Assistant Coach — team:u15a_2026  
└─ Scorer — fixture:fix_9081  
```

Permissions are calculated from the **active role + scope + relationship + workflow state**. Switching role context must never broaden access beyond the selected role.

---

# 3. Role roster at a glance

| # | Role | Family | Primary scope | Primary accountability |  
|---:|---|---|---|---|  
| 1 | Super Admin | Platform | Platform | Platform governance |  
| 2 | Platform Operations Admin | Platform | Platform | Day-to-day platform operations |  
| 3 | Support Admin | Platform | Assigned case | User and operational support |  
| 4 | Compliance / Safeguarding Officer | Platform | Platform / organisation | Privacy and safeguarding |  
| 5 | Audit Reviewer | Platform | Assigned audit scope | Independent oversight |  
| 6 | League Admin | Competition | League / competition | League governance |  
| 7 | Tournament Director | Competition | Tournament | Tournament authority |  
| 8 | Competition Operations Manager | Competition | Competition | Scheduling and execution |  
| 9 | Regional Selector / Provincial Admin | Competition | Region / pathway | Representative selection |  
| 10 | School Executive | School | School | Executive oversight |  
| 11 | School Admin | School | School | School platform administration |  
| 12 | School Staff / Registrar | School | School | Registration and admin support |  
| 13 | Finance Admin | School | School / organisation | Billing and payments |  
| 14 | Welfare / Medical Officer | School | School / programme | Health and return-to-play |  
| 15 | Transport / Logistics Admin | School | School / competition | Transport and movement |  
| 16 | Facilities / Grounds Admin | School | School / facilities | Facility readiness |  
| 17 | Communications / Media Admin | School | School / organisation | Communications and publishing |  
| 18 | Head Coach | Sporting | Team / programme | Sporting leadership |  
| 19 | Assistant Coach | Sporting | Team | Coaching support |  
| 20 | Team Manager | Sporting | Team | Squad administration |  
| 21 | Strength & Conditioning Coach | Sporting | Team / athletes | Physical preparation |  
| 22 | Analyst / Performance Analyst | Sporting | Team / programme | Performance intelligence |  
| 23 | Selector | Sporting | Programme / team | Squad/team selection |  
| 24 | Scorer | Sporting | Fixture | Official scoring capture |  
| 25 | Umpire | Sporting | Fixture | Laws and match control |  
| 26 | Match Referee / Match Commissioner | Sporting | Fixture / competition | Oversight and adjudication |  
| 27 | Groundsman / Match-Day Operations | Sporting | Venue / fixture | Match-day ground readiness |  
| 28 | Player | Participant | Self / team | Participation and self-service |  
| 29 | Parent / Guardian | Participant | Linked child | Consent and child administration |  
| 30 | Adult Player-Payer / Self-Managed Athlete | Participant | Self | Adult self-management |  
| 31 | Scout | External | Authorised programme / event | Talent observation |  
| 32 | Sponsor / Partner Viewer | External | Contracted scope | Aggregate commercial reporting |  
| 33 | Photographer / Media Contributor | External | Assigned media workspace | Media contribution |  
| 34 | Spectator / Fan | External | Public | Public consumption |  
| 35 | Alumni / Old Boy Viewer | External | Public / heritage | Historical engagement |

---

# 4. Platform Governance Roles

## 4.1 Super Admin

**Key:** `super_admin`    
**Scope:** Platform    
**Accountable for:** Overall SCRBRD platform governance.

### Core duties

- Govern platform-wide configuration and role templates.  
- Create, approve, suspend and archive organisations through controlled workflows.  
- Oversee tenant configuration and platform settings.  
- Manage controlled retention, export and deletion policy.  
- Review platform-wide audit and security escalations.  
- Approve emergency access overrides when formally justified.  
- Preserve traceable amendment history for official sporting records.  
- Oversee high-risk cross-tenant incidents.

### Match-day duty

Intervene only for genuine platform incidents such as authentication failure, scoring-session infrastructure failure or tenant-access failure. Super Admin must not become a substitute scorer or match official merely because the account is powerful.

### Must not

- Silently rewrite official match history.  
- Hard-delete scoring events to “fix” a score.  
- Browse sensitive records without a legitimate operational reason.  
- Bypass safeguarding controls for convenience.  
- Use emergency override as routine support.

### Hand-offs

- Operations → Platform Operations Admin  
- User troubleshooting → Support Admin  
- Privacy/safeguarding → Compliance / Safeguarding Officer  
- Independent review → Audit Reviewer

## 4.2 Platform Operations Admin

**Key:** `platform_operations_admin`    
**Scope:** Platform    
**Accountable for:** Normal day-to-day SCRBRD operation.

### Core duties

- Onboard schools, leagues and organisations.  
- Configure seasons, divisions and competitions.  
- Assist tenant setup and role-assignment administration.  
- Maintain platform reference data.  
- Resolve non-sensitive operational escalations.  
- Support fixture/scoring-session setup failures.  
- Monitor failed workflows and onboarding exceptions.

### Must not

- Access full medical/legal/safeguarding files by default.  
- Change safeguarding outcomes.  
- Delete audit logs.  
- Alter locked match history outside amendment workflow.

## 4.3 Support Admin

**Key:** `support_admin`    
**Scope:** Assigned support case    
**Accountable for:** Troubleshooting without unnecessary data access.

### Core duties

- Troubleshoot activation, invitations, role claims and fixture visibility.  
- Diagnose registration and guardian-link workflow failures.  
- Inspect scoring application error states.  
- Help assigned scorers with token, sync and handover issues.  
- Capture support incident notes.  
- Escalate issues requiring sensitive or elevated access.

### Must not

- Directly edit official statistics.  
- Browse medical, disciplinary, finance or safeguarding records without escalation.  
- Delete official data.  
- Grant themselves broader access simply to make support easier.

## 4.4 Compliance / Safeguarding Officer

**Key:** `compliance_safeguarding_officer`    
**Scope:** Platform or assigned organisation    
**Accountable for:** POPIA-aligned privacy, safeguarding and child protection.

### Core duties

- Review guardian verification and consent processes.  
- Handle safeguarding concerns and controlled case records.  
- Investigate inappropriate access.  
- Restrict or freeze sensitive access where authorised.  
- Review disciplinary/welfare matters where safeguarding is implicated.  
- Review scout access involving minors.  
- Review communication pathways involving children.  
- Ensure sensitive-record access is auditable.

### Must not

- Interfere with sporting decisions merely because the role has elevated privacy access.  
- Edit player sporting statistics.  
- Disclose case information beyond need-to-know scope.

## 4.5 Audit Reviewer

**Key:** `audit_reviewer`    
**Scope:** Explicit audit assignment    
**Accountable for:** Independent read-only oversight.

### Core duties

- Review role changes and permission history.  
- Review access logs.  
- Review scoring amendment history.  
- Review approval trails.  
- Review sensitive-process trails where specifically authorised.  
- Produce audit findings without changing source records.

### Must not

- Edit operational records.  
- Approve their own findings.  
- Participate in normal live workflows.  
- Use read-only access for unrelated browsing.

---

# 5. Competition & Governing Body Roles

## 5.1 League Admin

**Key:** `league_admin`    
**Scope:** League / competition    
**Accountable for:** Competition governance across participating schools.

### Core duties

- Create and administer leagues and competition structures.  
- Define divisions, classes and competition formats.  
- Configure points and standings rules.  
- Register or approve participating schools/teams.  
- Create league fixtures and calendar.  
- Appoint authorised competition roles.  
- Publish official standings and notices.  
- Review submitted match results.  
- Route competition-level disciplinary matters.

### Pre-match

- Validate fixture, team eligibility, venue and timing.  
- Ensure required officials are assigned.  
- Confirm competition rules/playing conditions are attached.

### Post-match

- Accept or flag official results.  
- Handle abandoned, forfeited or disputed match consequences.  
- Publish validated standings.

### Must not

- Access unrelated school-private records.  
- View full guardian/medical data.  
- Rewrite a locked scorecard directly.

## 5.2 Tournament Director

**Key:** `tournament_director`    
**Scope:** Tournament    
**Accountable for:** Overall tournament delivery and authority.

### Core duties

- Own tournament operational plan.  
- Approve tournament schedule and participating teams.  
- Allocate venues and oversee official appointments.  
- Manage tournament notices and event-specific rules.  
- Approve authorised match-day operational changes.  
- Oversee delays, venue changes and revised schedules.  
- Review submitted match results.  
- Coordinate escalated tournament disputes.

### Must not

- Edit player-private profiles.  
- Access unrelated school administration.  
- Act as scorer or umpire unless separately appointed.

## 5.3 Competition Operations Manager

**Key:** `competition_operations_manager`    
**Scope:** Competition    
**Accountable for:** Execution of competition scheduling and logistics.

### Core duties

- Build and maintain fixture schedules.  
- Allocate grounds and time slots.  
- Coordinate venue and officials availability.  
- Manage postponements/rescheduling.  
- Maintain operational team contacts.  
- Maintain match status.  
- Issue operational notifications.

### Must not

- Browse private medical/disciplinary details.  
- Change competition rules without authority.  
- Alter official scoring records.

## 5.4 Regional Selector / Provincial Admin

**Key:** `regional_selector_provincial_admin`    
**Scope:** Region / representative pathway    
**Accountable for:** Regional/provincial selection and representative pathways.

### Core duties

- Review eligible player performance.  
- Review authorised scouting summaries.  
- Maintain representative eligibility.  
- Shortlist players.  
- Record selection assessments.  
- Manage trial invitations where permitted.  
- Maintain representative squad records.  
- Document selection outcomes.

### Must not

- Access family finance.  
- View full medical, safeguarding or disciplinary files by default.  
- Edit school-owned identity data.  
- Contact minors outside approved channels.

---

# 6. School Governance Roles

## 6.1 School Executive

**Key:** `school_executive`    
**Scope:** School    
**Accountable for:** Executive sporting governance and organisational oversight.

### Core duties

- View strategic school-wide sporting dashboards.  
- Review programme participation and performance.  
- Approve high-impact permissions/policy decisions.  
- Review finance, compliance, transport and facility summaries.  
- Approve major programme/platform decisions.

### Must not

- Receive automatic access to every sensitive record because of seniority.  
- Run live scoring without separate assignment.  
- Edit detailed player-performance records by default.  
- Circumvent medical or safeguarding confidentiality.

## 6.2 School Admin

**Key:** `school_admin`    
**Scope:** School    
**Accountable for:** The school’s operational control of SCRBRD.

### Core duties

- Maintain school profile.  
- Manage seasons and sporting structures.  
- Create/manage teams.  
- Invite staff and participants.  
- Assign school/team roles.  
- Administer player registrations.  
- Manage guardian verification workflows.  
- Manage school fixtures and competition participation.  
- Assign coaches, managers and scorers.  
- Coordinate operational modules.  
- Manage school-scoped permissions.  
- Oversee data quality and completeness.  
- End-date historical role assignments rather than erasing them.  
- Monitor compliance/readiness without automatically seeing underlying sensitive detail.

### Pre-season

- Establish season and teams.  
- End-date prior appointments.  
- Invite and assign staff.  
- Validate player registrations and guardian completeness.  
- Validate facilities, transport and public school profile data.

### Match-day

- Confirm required roles are assigned.  
- Resolve school-side administrative blockers.  
- Coordinate operational staff.  
- Do not intervene directly in scoring unless separately assigned.

### Must not

- Automatically see full Level 4 medical/legal/safeguarding records.  
- Hard-delete official match history.  
- Operate as a universal override for specialist roles.

## 6.3 School Staff / Registrar

**Key:** `school_staff_registrar`    
**Scope:** School    
**Accountable for:** Registration and administrative record quality.

### Core duties

- Support onboarding.  
- Maintain registration metadata.  
- Process approved participant details.  
- Maintain school/team affiliation information.  
- Assist guardian invitation workflows.  
- Track forms and administrative completeness.  
- Maintain attendance/admin records where assigned.  
- Support routine communications.

### Must not

- Assign privileged platform roles.  
- Access confidential coaching notes by default.  
- Access welfare/finance records unless separately authorised.  
- Change official sporting performance data.

## 6.4 Finance Admin

**Key:** `finance_admin`    
**Scope:** School / organisation    
**Accountable for:** Billing, payments and financial administration.

### Core duties

- Create/issue invoices.  
- Maintain invoice status.  
- Reconcile transactions and payments.  
- Manage authorised payer relationships.  
- Issue approved credits/adjustments.  
- Maintain finance reports and audit trail.  
- Handle payment exceptions.

### Must not

- Access coaching notes or medical files.  
- Alter player statistics.  
- Infer/expose unrelated sporting data.  
- Hard-delete reconciled finance history.

## 6.5 Welfare / Medical Officer

**Key:** `welfare_medical_officer`    
**Scope:** School / programme    
**Accountable for:** Health, welfare and safe participation.

### Core duties

- Record/manage injuries and medical information.  
- Maintain rehabilitation plans.  
- Set medical availability/restriction status.  
- Provide minimum necessary participation guidance to coaches.  
- Approve/deny return-to-play status.  
- Access emergency contacts when legitimate.  
- Record medical clearance.  
- Escalate safeguarding concerns where appropriate.

### Match-day

- Record new injury incidents.  
- Update restrictions.  
- Support emergency response.  
- Communicate only necessary participation status.

### Must not

- Expose detailed medical information where a summary is sufficient.  
- Publish medical data.  
- Edit sporting statistics.  
- Allow School Admin status alone to override clinical confidentiality.

## 6.6 Transport / Logistics Admin

**Key:** `transport_logistics_admin`    
**Scope:** School / competition transport    
**Accountable for:** Safe movement of teams and authorised passengers.

### Core duties

- Create trips.  
- Allocate vehicles/drivers.  
- Manage routes/stops.  
- Maintain passenger manifests.  
- Track confirmations.  
- Record departure/arrival.  
- Monitor capacity and vehicle status.  
- Access necessary emergency-contact summaries.  
- Issue transport notifications.

### Match-day

- Confirm vehicle, driver and manifest.  
- Record departure/arrival.  
- Manage authorised route changes.  
- Escalate delays or breakdowns.  
- Confirm return journey.

### Must not

- Access full medical history.  
- Browse unrelated disciplinary records.  
- Expose passenger/contact lists publicly.

## 6.7 Facilities / Grounds Admin

**Key:** `facilities_grounds_admin`    
**Scope:** School facilities / venues    
**Accountable for:** Facility availability and readiness.

### Core duties

- Maintain facility records.  
- Manage bookings and conflicts.  
- Set venue availability.  
- Coordinate maintenance.  
- Record pitch/field readiness.  
- Manage facility closures.  
- Support fixture allocation.

### Must not

- Access player-private data.  
- Alter sporting statistics or match outcomes.

## 6.8 Communications / Media Admin

**Key:** `communications_media_admin`    
**Scope:** School / organisation    
**Accountable for:** Approved communications and publishing.

### Core duties

- Publish approved fixtures, results and announcements.  
- Manage public school/team content.  
- Manage and moderate media assets.  
- Approve/reject contributed media where authorised.  
- Maintain captions, alt text and asset metadata.  
- Control approved public profile fields.  
- Issue targeted operational communications.  
- Enforce media consent for minors.

### Must not

- Access private family data.  
- Publish medical/disciplinary information.  
- Override image/media consent.  
- Treat possession of media as permission to publish it.

---

# 7. Sporting Operations Roles

## 7.1 Head Coach

**Key:** `head_coach`    
**Scope:** Assigned team(s) / programme    
**Accountable for:** Sporting leadership and player development.

### Core duties

- Plan sporting programme and training.  
- Review authorised player/performance profiles.  
- Review availability.  
- Record skills ratings and development plans.  
- Maintain coaching performance notes.  
- Define roles and tactical plans.  
- Propose/confirm line-ups where authorised.  
- Review analytics.  
- Review injury **availability status**, not unrestricted medical history.  
- Submit selection recommendations.  
- Review post-match development actions.

### Pre-match

- Confirm squad readiness and availability.  
- Finalise/propose XI and reserves according to policy.  
- Recommend captain/vice-captain where authorised.  
- Review opposition/performance intelligence.  
- Communicate tactical plan.  
- Coordinate requirements with Team Manager.

### Match-day

- Lead team preparation.  
- Make cricketing decisions within laws/playing conditions.  
- Liaise with Team Manager and medical staff.  
- Avoid interfering with scorer and officials.

### Post-match

- Complete review and development notes.  
- Assign training focus.  
- Review analytics and skills evidence.  
- Request corrections through formal workflow.

### Must not

- Access unrestricted medical, safeguarding or billing records.  
- Reassign guardians.  
- Delete player history.  
- Edit official scoring events merely because they disagree with them.

## 7.2 Assistant Coach

**Key:** `assistant_coach`    
**Scope:** Assigned team(s)    
**Accountable for:** Delegated coaching support.

### Core duties

- Assist training delivery.  
- Update delegated training logs.  
- Contribute skill assessments.  
- Prepare drills and match preparation.  
- Review squad performance.  
- Track delegated development actions.  
- Record authorised coaching observations.

### Must not

- Inherit Head Coach approval authority automatically.  
- Manage school-wide access.  
- Access full sensitive records.  
- Approve structural/governance changes beyond delegation.

## 7.3 Team Manager

**Key:** `team_manager`    
**Scope:** Assigned team(s)    
**Accountable for:** Team administration and match-day readiness.

### Core duties

- Track squad readiness and availability.  
- Coordinate player/parent communications.  
- Manage match-day checklist.  
- Coordinate transport and itinerary.  
- Access minimum necessary emergency contacts.  
- Confirm kit/equipment requirements.  
- Track required forms/confirmations.  
- Liaise with venue/officials on logistics.

### Match-day

- Verify attendance.  
- Confirm team-sheet administrative completeness.  
- Coordinate arrival/transport.  
- Ensure operational requirements are ready.  
- Manage team-side communications.

### Must not

- Access full coach-only evaluations.  
- Browse full medical/disciplinary files.  
- Alter official match statistics.

## 7.4 Strength & Conditioning Coach

**Key:** `strength_conditioning_coach`    
**Scope:** Assigned athletes / teams    
**Accountable for:** Physical preparation and conditioning.

### Core duties

- Create conditioning programmes.  
- Capture physical assessments/testing.  
- Record progress and workload.  
- View only injury restrictions necessary for safe training.  
- Contribute physical-development metrics.  
- Flag welfare concerns appropriately.

### Must not

- Access unrelated family/finance data.  
- Access full medical records without separate authorisation.  
- Override medical clearance.

## 7.5 Analyst / Performance Analyst

**Key:** `performance_analyst`    
**Scope:** Assigned team / programme    
**Accountable for:** Performance intelligence derived from trusted data.

### Core duties

- Analyse ball-by-ball and scorecard data.  
- Create player/team reports.  
- Analyse trends, match-ups and phases.  
- Maintain tactical dashboards.  
- Tag video/data.  
- Analyse wagon-wheel and field-placement information.  
- Maintain comparative/head-to-head insight.  
- Surface evidence to coaching staff.

### Pre-match

- Prepare opposition analysis.  
- Identify match-ups and trends.  
- Surface role/phase insights.

### Post-match

- Perform match review.  
- Generate player/team insights.  
- Identify data anomalies for formal correction.

### Must not

- Modify locked raw delivery history.  
- Access guardian, finance or full medical records.  
- Present analysis as an official scoring correction.

## 7.6 Selector

**Key:** `selector`    
**Scope:** School / team / representative programme    
**Accountable for:** Formal squad/team selection.

### Core duties

- Review eligible player pool.  
- Review availability and performance.  
- Review skills matrices and role balance.  
- Consider authorised coach/scout assessments.  
- Create shortlists.  
- Record recommendations/final selections where authorised.  
- Document selection rationale where required.  
- Maintain trial/standby groups.

### Must not

- Access full family, finance, medical or safeguarding records.  
- Use unrelated private data to influence selection.  
- Modify player identity or official history.

## 7.7 Scorer

**Key:** `scorer`    
**Scope:** Assigned fixture    
**Accountable for:** Accurate, contemporaneous official scoring capture.

### Core duties

- Initialise authorised scoring session.  
- Confirm fixture/team context.  
- Record every delivery.  
- Capture runs, extras, wickets and dismissal detail.  
- Maintain striker/non-striker/bowler state.  
- Capture wagon-wheel/shot/field information according to capture mode.  
- Maintain legal-ball and over state.  
- Correct errors through traceable scoring events.  
- Manage offline queue and synchronisation.  
- Complete scorer handover correctly.  
- Submit innings/match state.  
- Preserve official event history.

### Pre-match

- Verify assigned fixture and line-ups.  
- Confirm innings configuration.  
- Obtain active scorer token.  
- Verify device/offline readiness.

### Live match

- Remain the single authoritative scoring writer unless handover occurs.  
- Capture events in order.  
- Apply configured laws/playing conditions accurately.  
- Monitor synchronisation and avoid duplicate entry.

### Post-match

- Reconcile innings/match totals.  
- Confirm synchronisation.  
- Submit completed state.  
- Escalate unresolved disputes.  
- Never hard-delete official events.

### Must not

- Score unassigned fixtures.  
- Access private player/family records.  
- Edit locked results outside amendment workflow.  
- Treat public match-view access as scoring authority.

## 7.8 Umpire

**Key:** `umpire`    
**Scope:** Assigned fixture    
**Accountable for:** Laws/playing conditions and official match control.

### Core duties

- Confirm toss.  
- Confirm match start, interruptions and conditions where required.  
- File official reports.  
- Record reportable incidents.  
- Validate authorised match-result state.  
- Support dispute resolution with official evidence.

### Must not

- Casually rewrite ball-by-ball scoring.  
- Access unrelated private player information.  
- Use official status as general administrative access.

## 7.9 Match Referee / Match Commissioner

**Key:** `match_referee_commissioner`    
**Scope:** Assigned fixture / competition    
**Accountable for:** Formal match oversight and adjudication.

### Core duties

- Review disputes and official reports.  
- Review discipline arising from the fixture.  
- Confirm procedural compliance.  
- Approve/reject authorised post-match amendments.  
- Record adjudication outcome.  
- Escalate serious incidents.  
- Preserve evidence trail.

### Must not

- Directly edit player-private profiles.  
- Access unrelated school-private information.  
- Rewrite scoring events instead of approving formal amendments.

## 7.10 Groundsman / Match-Day Operations

**Key:** `groundsman_matchday_ops`    
**Scope:** Venue / fixture    
**Accountable for:** Ground and operational readiness.

### Core duties

- Inspect field/ground readiness.  
- Update pitch status.  
- Track weather effects.  
- Complete venue readiness checklist.  
- Report unsafe conditions.  
- Coordinate covers/equipment where applicable.  
- Record facility incidents.

### Must not

- Access player-private information.  
- Edit sporting statistics.  
- Determine official match results unless separately appointed under competition rules.

---

# 8. Participant Roles

## 8.1 Player

**Key:** `player`    
**Scope:** Self    
**Accountable for:** Participation, availability and permitted self-service data.

### Core duties

- Keep permitted profile fields current.  
- Confirm availability.  
- Review fixtures and communications.  
- Review own approved performance/development history.  
- Complete required self-service forms.  
- Submit transfer requests.  
- Request corrections to inaccurate records.  
- Comply with consent/onboarding workflow.

### May update

- profile image;  
- biography;  
- handedness and approved cricket attributes;  
- availability;  
- communication preferences;  
- permitted self-entered development information.

### Must not

- Directly edit official stats.  
- Edit internal coach notes.  
- Access another player’s private information.  
- Self-assign privileged roles.  
- Remove the final verified guardian link while a minor.

## 8.2 Parent / Guardian

**Key:** `parent_guardian`    
**Scope:** Verified linked child/children    
**Accountable for:** Consent, care and administration of a linked minor.

### Core duties

- Maintain guardian and emergency contact details.  
- Review child fixtures and approved data.  
- Confirm availability where policy permits.  
- Complete/manage consent.  
- Confirm transport.  
- Respond to school/team communications.  
- Review/pay child-specific invoices where applicable.  
- Review parent-visible welfare status.  
- Keep guardian relationship information accurate.

### Must not

- Access other children’s private records.  
- See internal coach-only notes by default.  
- Edit official stats.  
- Assign school/team roles.  
- Claim a child relationship without verification.

## 8.3 Adult Player-Payer / Self-Managed Athlete

**Key:** `adult_player_payer`    
**Scope:** Self    
**Accountable for:** Own sporting, consent and administrative affairs.

### Core duties

- Perform authorised player self-service.  
- Control own consent/privacy preferences.  
- Manage own payer relationship and invoices.  
- Manage own emergency information.  
- Decide whether previous parent/guardian visibility continues where policy permits.  
- Submit administrative/transfer requests.

### Must not

- Self-assign roles.  
- Access unrelated team/staff information.  
- Edit official records simply because they concern the player.

---

# 9. External / Limited Roles

## 9.1 Scout

**Key:** `scout`    
**Scope:** Approved programme, school, competition or event    
**Accountable for:** Authorised talent observation.

### Core duties

- Discover players within authorised visibility rules.  
- View approved performance profiles/statistics/video.  
- Compare players where authorised.  
- Create scouting reports.  
- Maintain shortlists.  
- Add observations and share reports only through permitted workflow.  
- Comply with child-safeguarding and data-use rules.

### Must not

- Access guardian details by default.  
- Access full medical, discipline or safeguarding records.  
- Export unrestricted lists of minors.  
- Directly message minors outside approved channels.  
- Treat public stats as permission to access private data.

## 9.2 Sponsor / Partner Viewer

**Key:** `sponsor_partner_viewer`    
**Scope:** Contracted campaign / rights package    
**Accountable for:** Commercial reporting within agreed rights.

### Core duties

- View approved aggregate reach.  
- View campaign delivery/placement metrics.  
- Review sponsor-placement performance.  
- View public fixture/team information included in rights package.  
- Review approved aggregate engagement reports.

### Must not

- Access protected player data.  
- Receive private data about minors.  
- Access coaching, scouting or medical data.  
- Modify sporting/operational data.  
- Use campaign data to reconstruct protected individual profiles.

Advertising and protected player data must remain structurally separated.

## 9.3 Photographer / Media Contributor

**Key:** `photographer_media_contributor`    
**Scope:** Assigned event/team/media workspace    
**Accountable for:** Authorised media contribution.

### Core duties

- Upload approved media.  
- Tag assets and add captions/metadata.  
- Associate content with relevant fixture/team.  
- Maintain own draft uploads.  
- Comply with consent restrictions.  
- Submit content for approval.

### Must not

- Publish without required approval.  
- Access private participant records.  
- Obtain protected contact details through media access.  
- Ignore consent/safeguarding flags.

## 9.4 Spectator / Fan

**Key:** `spectator_fan`    
**Scope:** Public    
**Accountable for:** Public consumption only.

### May

- View published fixtures/results/live scores.  
- View published scorecards and standings.  
- View approved public player/team/school profiles.  
- View approved statistics/media/commentary.  
- View sponsor-supported spectator experiences.

### Must not

- Access internal operational data.  
- Access personal contact data.  
- Access restricted information about minors.  
- Gain scoring/operational rights merely by following a match.

## 9.5 Alumni / Old Boy Viewer

**Key:** `alumni_viewer`    
**Scope:** Public + school-approved heritage content    
**Accountable for:** Historical and alumni engagement.

### May

- View published historical scorecards.  
- Explore school sporting history.  
- View honours/awards and published alumni records.  
- Follow current public fixtures/results.

### Must not

- Access current minors’ restricted records.  
- Access internal staff/school data.  
- Gain privileged access solely because of alumni status.

---

# 10. Duty lifecycle

| Phase | Typical duty owners |  
|---|---|  
| Organisation setup | Super Admin, Platform Operations Admin, School Admin |  
| Pre-season | School Admin, Registrar, Head Coach, Selector, Facilities, Transport |  
| Player onboarding | Registrar, School Admin, Parent/Guardian, Player, Compliance |  
| Guardian verification | School Admin, Registrar, Parent/Guardian, Compliance |  
| Competition setup | League Admin, Tournament Director, Competition Operations |  
| Training cycle | Head Coach, Assistant Coach, S&C Coach, Analyst, Player |  
| Selection | Selector, Head Coach, Regional Selector where applicable |  
| Fixture preparation | Team Manager, Head Coach, Competition Ops, Facilities, Transport |  
| Venue readiness | Facilities / Grounds Admin, Groundsman / Match-Day Ops |  
| Live match scoring | Scorer |  
| Match law / officiating | Umpire |  
| Match oversight | Match Referee / Commissioner |  
| Live public publishing | Communications / Media Admin + system |  
| Injury / welfare | Welfare / Medical Officer |  
| Post-match analysis | Head Coach, Assistant Coach, Analyst |  
| Result governance | League Admin / Tournament authority / Match Commissioner |  
| Discipline | Match officials + authorised governance/compliance roles |  
| Finance | Finance Admin |  
| Scouting | Scout, Regional Selector / Provincial Admin |  
| Audit | Audit Reviewer |  
| Safeguarding | Compliance / Safeguarding Officer |

---

# 11. Separation-of-duties rules

## 11.1 Scoring vs viewing

Viewing a match does not grant scoring rights.

`score.read.public` ≠ `score.update.assigned_fixture`

## 11.2 Scorer vs match authority

The scorer records the official event stream. The umpire officiates. The Match Referee / Commissioner reviews disputes. League/Tournament authority governs competition consequences.

These should never collapse into one unrestricted “match admin” permission.

## 11.3 Coach vs medical authority

A coach needs to know whether a player is **available / restricted / unavailable**, plus minimum safe participation instructions. A coach does not need unrestricted access to the medical file.

## 11.4 School administration vs safeguarding

A School Admin may need to know that a safeguarding workflow blocks an action. They do not automatically need the contents of the safeguarding case.

## 11.5 Finance vs sporting performance

Finance users need payer/invoice context, not private coaching, scouting or medical data.

## 11.6 Sponsor vs participant data

Sponsor access is commercial and aggregate. Sponsor entitlement must never become a back door into protected player or guardian data.

## 11.7 Scout vs minor contact

Scouting access is authorisation to review approved sporting evidence, not unrestricted permission to contact a minor.

---

# 12. Escalation roster

| Issue | Primary owner | Escalates to |  
|---|---|---|  
| User cannot sign in | Support Admin | Platform Operations Admin |  
| School setup problem | School Admin | Platform Operations Admin |  
| Incorrect privileged role | School Admin / Platform Ops | Compliance / Super Admin |  
| Guardian-link dispute | School Admin | Compliance / Safeguarding Officer |  
| Medical availability | Welfare / Medical Officer | Appropriate clinical/school process |  
| Live scoring input error | Scorer | Scoring correction workflow |  
| Locked-score dispute | Match Commissioner | League/Tournament governance |  
| Scoring system failure | Support Admin | Platform Operations |  
| Fixture scheduling conflict | Competition Operations | Tournament Director / League Admin |  
| Ground unavailable | Facilities / Grounds | Competition Operations |  
| Transport disruption | Transport / Logistics | Team Manager / School Admin |  
| Match conduct incident | Umpire | Match Referee / Commissioner |  
| Safeguarding concern | Compliance / Safeguarding | Formal safeguarding process |  
| Financial dispute | Finance Admin | Authorised school governance |  
| Media consent issue | Communications / Media | Compliance / Safeguarding |  
| Scout access concern | School/competition authority | Compliance / Safeguarding |  
| Suspected unauthorised access | Compliance / Safeguarding | Super Admin + Audit Reviewer |  
| Audit finding | Audit Reviewer | Relevant accountable governance role |

---

# 13. Role assignment model

```ts  
type RoleAssignment = {  
  assignmentId: string;  
  personId: string;  
  role: RoleKey;  
  scopeType:  
    | "platform"  
    | "competition"  
    | "organisation"  
    | "school"  
    | "season"  
    | "team"  
    | "fixture"  
    | "venue"  
    | "facility"  
    | "trip"  
    | "person"  
    | "linked_child"  
    | "self";  
  scopeId: string;  
  status: "pending" | "active" | "suspended" | "expired";  
  startDate?: string;  
  endDate?: string;  
  assignedBy: string;  
  approvedBy?: string;  
  reason?: string;  
};  
```

### Assignment rules

- No privileged role exists without an auditable assignment.  
- Historical role assignments are end-dated, not deleted.  
- Roles expire when the real-world duty ends.  
- Fixture roles expire after relevant post-match workflow.  
- Temporary elevated access requires reason and expiry.  
- Users can see which role/context they are acting under.  
- A role switch visibly changes action/dashboard context.  
- Permission tests must cover multi-role combinations.

---

# 14. Canonical role keys

```text  
super_admin  
platform_operations_admin  
support_admin  
compliance_safeguarding_officer  
audit_reviewer

league_admin  
tournament_director  
competition_operations_manager  
regional_selector_provincial_admin

school_executive  
school_admin  
school_staff_registrar  
finance_admin  
welfare_medical_officer  
transport_logistics_admin  
facilities_grounds_admin  
communications_media_admin

head_coach  
assistant_coach  
team_manager  
strength_conditioning_coach  
performance_analyst  
selector  
scorer  
umpire  
match_referee_commissioner  
groundsman_matchday_ops

player  
parent_guardian  
adult_player_payer

scout  
sponsor_partner_viewer  
photographer_media_contributor  
spectator_fan  
alumni_viewer  
```

---

# 15. Job titles that should not automatically become separate RBAC roles

A key design rule is to avoid turning every sporting job title into another permission role.

These are usually better represented by **assignment attributes, tags, specialist responsibilities or permission bundles** unless they genuinely need different data access or approval authority:

- captain;  
- vice-captain;  
- batting coach;  
- bowling coach;  
- fielding coach;  
- wicketkeeping coach;  
- assistant scorer;  
- first-aid volunteer;  
- tour organiser;  
- social-media editor;  
- statistician;  
- teacher-in-charge;  
- house master;  
- age-group coordinator.

Examples:

```text  
Role: Head Coach  
Specialism: Bowling

Role: Player  
isCaptain: true

Role: Communications / Media Admin  
Permission bundle: social_publish  
```

This prevents role explosion and makes access easier to reason about and audit.

---

# 16. Duty status

Operational duties should have lifecycle state rather than remaining indefinitely active:

```text  
pending  
active  
delegated  
completed  
suspended  
expired  
revoked  
```

A person may remain historically recorded as the scorer for a completed fixture while no longer retaining active scoring permission.

---

# 17. Recommended roster views in SCRBRD

## 17.1 School Roles & Duties

Show current role holders across governance, registrar, finance, welfare, transport, facilities, communications and sporting staff.

Filters: season, sport, team, active/inactive and duty status.

## 17.2 Team Staff Roster

Show Head Coach, Assistant Coaches, Team Manager, S&C, Analyst, Selector where scoped, players, captain/vice-captain attributes and active duty status.

## 17.3 Match-Day Duty Roster

| Duty | Assigned person | Status |  
|---|---|---|  
| Team A Head Coach | Assigned user | Confirmed / pending |  
| Team B Head Coach | Assigned user | Confirmed / pending |  
| Team A Manager | Assigned user | Confirmed / pending |  
| Team B Manager | Assigned user | Confirmed / pending |  
| Scorer | Assigned user | Confirmed / live / handed over |  
| Umpire 1 | Assigned user | Confirmed |  
| Umpire 2 | Assigned user | Confirmed |  
| Match Commissioner | Assigned user | Confirmed |  
| Grounds / Match-Day Ops | Assigned user | Ready / issue |  
| Medical / Welfare Contact | Assigned authorised user | Ready |  
| Transport Contact | Assigned user | Ready |  
| Media Contact | Assigned user | Ready |

The roster should expose **duty readiness**, not merely names.

## 17.4 Competition Duty Roster

Show League Admin, Tournament Director, Competition Operations, Match Commissioners, appointed officials, regional/provincial selection staff and escalation contacts.

---

# 18. Dashboard implications

A role influences the user’s default dashboard without permanently defining it.

### Head Coach  
- next training session;  
- player availability;  
- selection status;  
- injury restrictions;  
- performance/development actions;  
- upcoming fixture;  
- opponent analysis.

### Team Manager  
- outstanding availability;  
- travel readiness;  
- team-sheet completeness;  
- match-day checklist;  
- parent communications;  
- transport status.

### Scorer  
- assigned matches;  
- training mode;  
- incomplete/queued scoring sessions;  
- handover status;  
- match-submission tasks.

### Parent / Guardian  
- linked children;  
- next fixture;  
- transport confirmation;  
- consent required;  
- invoices;  
- availability;  
- relevant communications.

### Welfare / Medical Officer  
- players requiring review;  
- return-to-play decisions;  
- active restrictions;  
- recent injuries;  
- overdue follow-up.

Every dashboard query must enforce the same role/scope rules as the underlying data.

---

# 19. Notification implications

Notifications should be duty-driven.

- **Scorer:** scoring assignment, fixture change, token ready, unsynchronised events, handover request.  
- **Head Coach:** unavailable player, selection deadline, medical restriction summary, fixture change.  
- **Team Manager:** outstanding availability, transport change, missing confirmation.  
- **Parent:** consent required, transport confirmation, fixture change, child-specific communication.  
- **Welfare:** new injury, return-to-play review due.  
- **Competition Ops:** venue conflict, postponement, official cancellation.  
- **Finance:** overdue invoice, failed payment, reconciliation exception.  
- **Compliance:** guardian verification issue, suspicious access, safeguarding escalation.

Multi-role users should see the **role and scope that generated each notification**.

---

# 20. Minimum audit requirements

Record:

- who assigned each role;  
- activation and expiry;  
- role scope;  
- role changes;  
- approvals;  
- access to sensitive records;  
- guardian verification actions;  
- medical/discipline/finance access;  
- scorer-session ownership;  
- scorer handovers;  
- scoring amendments;  
- post-lock changes;  
- safeguarding actions;  
- permission overrides;  
- protected-data exports.

---

# 21. Production rules

1. **Never use a role name as the only access check.**  
2. **Never treat School Admin as “can see everything”.**  
3. **Never let public score viewing imply scoring authority.**  
4. **Never hard-delete official scoring history.**  
5. **Never expose a minor’s contact details to scouts, sponsors or spectators.**  
6. **Never give coaches unrestricted medical access.**  
7. **Never let multi-role accounts merge scopes invisibly.**  
8. **Never erase historic appointments when a staff member changes role.**  
9. **Never expose sensitive information merely because it simplifies a dashboard.**  
10. **Never allow sponsorship to weaken participant-data protections.**  
11. **Every under-18 player must pass the valid guardian workflow.**  
12. **Every sensitive action must be attributable to a person, role and scope.**

---

# 22. Summary

SCRBRD’s role system should not be thought of as:

> “35 types of users.”

It should be thought of as:

> **35 defined operational responsibilities that may be assigned to people within explicit scopes.**

The same person may legitimately carry several responsibilities. What matters is that SCRBRD always knows:

- who the person is;  
- which role they are currently acting under;  
- what entity that duty applies to;  
- why they have access;  
- which stage the workflow is in;  
- what sensitive information is legitimately required;  
- who is accountable for the next decision;  
- and what evidence must remain in the audit trail.

That model allows SCRBRD to scale from a single school cricket fixture to leagues, tournaments, provincial pathways and future sports without sacrificing match integrity, privacy or safeguarding.
