# Multiple Roles Support - Implementation Summary

## Overview
Updated the user management system to support users holding multiple roles simultaneously. Users now have a **primary role** (for default permissions and UI behavior) and can have **additional roles** that grant cumulative permissions.

## Changes Made

### 1. Data Model Updates

#### `src/lib/userService.ts`
- Added `roles?: string[]` field to `UserData` interface
- Added `roles?: string[]` field to `InvitationData` interface
- Updated `getUsers()` to initialize `roles` array for users without accounts
- Updated `updateUser()` to ensure primary role is always included in roles array
- Updated `inviteUser()` to accept and store multiple roles

### 2. Authentication Context

#### `src/contexts/AuthContext.tsx`
- Already had support for multiple roles via `roles` array field
- Fetches `roles` from Firestore user document
- Ensures primary role is included in `availableRoles`
- System Architect gets special handling

### 3. User Management UI

#### `src/app/user-management/page.tsx`
- **Form State**: Added `roles: string[]` to formData
- **Table Display**: Updated role column to show all roles as badges
  - Primary role highlighted with default variant and border
  - Additional roles shown with secondary variant
- **Edit Dialog**: Complete redesign with:
  - **Primary Role Selector**: Dropdown to select the main role
  - **Additional Roles**: Scrollable checklist grouped by role categories
  - Prevents removal of primary role from additional roles
  - Auto-includes primary role when changed
- **Submit Handler**: Passes `roles` array to UserService

#### `src/components/user-management/InviteUserDialog.tsx`
- Added `selectedRoles` state to track multiple role selection
- Updated form to include:
  - Primary role dropdown
  - Additional roles checklist (same UI as edit dialog)
- Prevents removal of primary role
- Auto-includes primary role in selected roles
- Passes multiple roles to `UserService.inviteUser()`

## User Experience

### Creating/Editing Users
1. **Select Primary Role**: Choose the main role that defines default behavior
2. **Add Additional Roles**: Check any additional roles the user should have
3. **Visual Feedback**: 
   - Primary role is marked as "(Primary)" and disabled in checklist
   - Cannot be unchecked
   - Changing primary role auto-checks it in additional roles

### Viewing Users
- Users with multiple roles show all roles as badges
- Primary role is visually distinguished (darker badge with border)
- Additional roles shown with lighter secondary badges

## Data Structure

### Firestore `users` Collection
```typescript
{
  uid: string;
  email: string;
  role: string;           // Primary role
  roles: string[];        // All roles (includes primary)
  displayName: string;
  // ... other fields
}
```

### Example User Document
```json
{
  "uid": "abc123",
  "email": "coach@school.com",
  "role": "Coach",
  "roles": ["Coach", "Team Manager", "Scorer"],
  "displayName": "John Smith"
}
```

## RBAC Implementation

### Permission Resolution
When a user has multiple roles, they receive the **union** of all permissions from all their roles. This is handled by:

1. **AuthContext**: Provides `availableRoles` array to components
2. **Permission Checks**: Components can check against all roles:
   ```typescript
   const hasPermission = availableRoles.some(role => 
     PERMISSIONS_MATRIX[role]?.includes(permission)
   );
   ```

### Role Hierarchy
- Primary role determines default UI behavior and navigation
- Additional roles grant supplementary permissions
- System Architect has access to all roles and permissions

## Migration Notes

### Existing Users
Users with only a `role` field will automatically get:
- `roles` array initialized with their primary role
- No data migration script needed - handled at runtime in `UserService.getUsers()`

### New Users
All new users created via:
- Invite dialog
- Manual creation
- Sign up flow

Will have both `role` and `roles` fields properly initialized.

## Testing Checklist

- [x] Create new user with multiple roles
- [x] Edit existing user to add/remove roles
- [x] Verify primary role cannot be removed from additional roles
- [x] Verify role badges display correctly in table
- [x] Verify invite dialog supports multiple roles
- [x] Verify form validation prevents removing primary role
- [x] Verify roles array always includes primary role

## Future Enhancements

1. **Dynamic Permissions**: Store permissions in Firestore instead of hardcoded matrix
2. **Role Templates**: Pre-defined role combinations for common scenarios
3. **Audit Log**: Track role changes for compliance
4. **Bulk Role Assignment**: Assign roles to multiple users at once
5. **Role Expiry**: Time-limited role assignments
6. **Custom Roles**: Allow admins to create custom roles with specific permissions
