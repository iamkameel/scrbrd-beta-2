# User Management & RBAC Enhancements

## Overview
Enhanced user management and people sections with improved Role-Based Access Control (RBAC) and intuitive school/team assignment capabilities.

## New Components

### 1. SchoolTeamAssignment Component
**Location:** `src/components/common/SchoolTeamAssignment.tsx`

A reusable component for assigning users to schools and teams with intelligent relationship management.

**Features:**
- **Dual Mode Support**: Can be rendered as a standalone card or inline content
- **Automatic Relationship Management**: 
  - When adding a team, automatically adds the team's school if not already assigned
  - When removing a school, automatically removes all teams from that school
- **Visual Feedback**: Badge-based UI showing all assignments with school abbreviations
- **Form Integration**: Generates hidden inputs for seamless form submission
- **Real-time Filtering**: Only shows teams from assigned schools

**Usage:**
```tsx
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

// As a card (default)
<SchoolTeamAssignment
  initialSchools={["school1", "school2"]}
  initialTeams={["team1", "team2"]}
  onChange={(data) => console.log(data)}
/>

// Inline mode
<SchoolTeamAssignment
  mode="inline"
  initialSchools={user.assignedSchools}
  initialTeams={user.teamIds}
  onChange={handleAssignmentChange}
/>
```

### 2. EnhancedUserEditDialog Component
**Location:** `src/components/user-management/EnhancedUserEditDialog.tsx`

A comprehensive user editing dialog with tabbed interface for better organization.

**Features:**
- **Three-Tab Interface**:
  1. **Basic Info**: Name, email, status
  2. **Roles & Access**: Primary role, additional roles with multi-select
  3. **Assignments**: School and team assignments

- **Smart Role Management**:
  - Primary role is always included in roles array
  - Cannot remove primary role from additional roles
  - Visual distinction between primary and additional roles
  - Grouped by role categories (Players, Coaches, Officials, etc.)

- **Email Protection**: Prevents changing email for existing users
- **Real-time Preview**: Shows selected roles as badges
- **Validation**: Ensures required fields are filled

**Usage:**
```tsx
import { EnhancedUserEditDialog } from "@/components/user-management/EnhancedUserEditDialog";

<EnhancedUserEditDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  user={selectedUser}
  onSave={async (data) => {
    await UserService.updateUser(user.uid, data);
    await refreshUsers();
  }}
/>
```

## Integration Guide

### Integrating into User Management Page

Replace the existing dialog in `src/app/user-management/page.tsx`:

```tsx
// Add import
import { EnhancedUserEditDialog } from "@/components/user-management/EnhancedUserEditDialog";

// Replace the existing Dialog component with:
<EnhancedUserEditDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  user={editingUser}
  onSave={async (data) => {
    if (editingUser) {
      await UserService.updateUser(editingUser.uid, data);
    } else {
      await UserService.inviteUser(data.email!, data.role, data.roles);
    }
    await fetchUsers();
  }}
/>
```

### Integrating into Player/Person Forms

Add to `src/components/players/PlayerForm.tsx`:

```tsx
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

// In the form, after the basic information section:
<SchoolTeamAssignment
  initialSchools={initialData.assignedSchools || []}
  initialTeams={initialData.teamIds || []}
  mode="card"
/>
```

## RBAC Improvements

### Multi-Role Support
Users can now have multiple roles simultaneously:
- **Primary Role**: Determines default UI and permissions
- **Additional Roles**: Grants access to features from other roles

Example: A user can be both a "Player" (primary) and "Coach" (additional), allowing them to:
- View player-specific features by default
- Access coaching tools when needed
- See combined permissions in the permissions matrix

### School-Based Access Control
- Users assigned to schools automatically get access to:
  - Teams within those schools
  - Matches involving those teams
  - Players/staff from those schools
  - School-specific analytics and reports

### Team-Based Access Control
- Team assignments provide granular access:
  - View team roster and statistics
  - Access team-specific training logs
  - Participate in team communications
  - View team match schedules

## Data Model Updates

### Person/User Schema Extensions
```typescript
interface Person {
  // ... existing fields
  assignedSchools?: string[];  // Array of school IDs
  teamIds?: string[];          // Array of team IDs
  roles?: string[];            // Array of all roles (including primary)
}
```

### Firestore Collections
Ensure these fields are indexed for efficient queries:
- `people.assignedSchools` (array)
- `people.teamIds` (array)
- `people.roles` (array)

## Security Rules

Update Firestore security rules to enforce RBAC:

```javascript
// Allow users to read their assigned schools' data
match /schools/{schoolId} {
  allow read: if request.auth != null && 
    (request.auth.token.role == 'Admin' || 
     schoolId in request.auth.token.assignedSchools);
}

// Allow users to read teams they're assigned to
match /teams/{teamId} {
  allow read: if request.auth != null && 
    (request.auth.token.role == 'Admin' || 
     teamId in request.auth.token.teamIds ||
     get(/databases/$(database)/documents/teams/$(teamId)).data.schoolId in request.auth.token.assignedSchools);
}
```

## Quick Assignment Workflows

### Workflow 1: Assign Player to School and Team
1. Navigate to User Management or People section
2. Click "Edit" on a user
3. Go to "Assignments" tab
4. Select school from dropdown → Click "+"
5. Select team from dropdown (filtered by assigned schools) → Click "+"
6. Save changes

### Workflow 2: Bulk School Assignment
1. In User Management, select multiple users (checkboxes)
2. Click "Bulk Actions" → "Assign to School"
3. Select school from dropdown
4. Optionally select teams
5. Confirm assignment

### Workflow 3: Quick Team Roster Building
1. Navigate to Teams → Select a team
2. Click "Manage Roster"
3. Search for people
4. Click "Add to Team" (automatically assigns school if needed)
5. Set role within team (Player, Captain, etc.)

## Benefits

### For Administrators
- **Faster Onboarding**: Assign users to schools/teams in one dialog
- **Better Organization**: Clear visual representation of assignments
- **Audit Trail**: Track who has access to what
- **Flexible Permissions**: Multi-role support for complex scenarios

### For Users
- **Intuitive Interface**: Clear, badge-based UI for assignments
- **Immediate Feedback**: See assignments update in real-time
- **Contextual Access**: Only see relevant schools and teams

### For Developers
- **Reusable Components**: SchoolTeamAssignment can be used anywhere
- **Type-Safe**: Full TypeScript support
- **Extensible**: Easy to add more assignment types (divisions, leagues, etc.)
- **Testable**: Components are isolated and easy to test

## Migration Notes

### Existing Data
For existing users without `assignedSchools` or `teamIds`:
1. Run a migration script to infer assignments from existing data
2. Check `rosters` collection for team memberships
3. Derive school assignments from team schools
4. Update user documents with new fields

### Backward Compatibility
- Components gracefully handle missing `assignedSchools`/`teamIds`
- Defaults to empty arrays if not present
- Existing forms continue to work without modifications

## Future Enhancements

1. **Bulk Assignment UI**: Drag-and-drop interface for assigning multiple users
2. **Assignment History**: Track when users were assigned/removed
3. **Temporary Assignments**: Time-limited access for guest coaches, etc.
4. **Assignment Requests**: Allow users to request access to schools/teams
5. **Smart Suggestions**: AI-powered suggestions based on user profile
6. **Assignment Templates**: Pre-defined assignment sets for common roles
