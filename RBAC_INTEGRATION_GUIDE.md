# Integration Example: User Management with Enhanced RBAC

## Quick Integration Steps

### Step 1: Update User Management Page

Replace the dialog section in `src/app/user-management/page.tsx`:

```tsx
// Add this import at the top
import { EnhancedUserEditDialog } from "@/components/user-management/EnhancedUserEditDialog";

// Replace the existing <Dialog> component (lines 469-597) with:
<EnhancedUserEditDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  user={editingUser}
  onSave={async (data) => {
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.uid, data);
        toast.success("User updated successfully");
      } else {
        await UserService.inviteUser(data.email!, data.role, data.roles);
        toast.success("User invited successfully");
      }
      await fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
      throw error;
    }
  }}
/>
```

### Step 2: Update UserService

Add support for school/team assignments in `src/lib/userService.ts`:

```typescript
// In updateUser method, add these fields:
export async function updateUser(uid: string, updates: Partial<UserData>) {
  const userRef = doc(db, 'users', uid);
  
  // Also update the person document if it exists
  if (updates.personId) {
    const personRef = doc(db, 'people', updates.personId);
    await updateDoc(personRef, {
      assignedSchools: updates.assignedSchools || [],
      teamIds: updates.teamIds || [],
      roles: updates.roles || [],
      // ... other fields
    });
  }
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
```

### Step 3: Update Person Edit Page

In `src/app/people/[id]/edit/page.tsx`, add the SchoolTeamAssignment component:

```tsx
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

// In the return statement, add after the PlayerForm:
<div className="mt-6">
  <SchoolTeamAssignment
    initialSchools={person.assignedSchools || []}
    initialTeams={person.teamIds || []}
    mode="card"
  />
</div>
```

### Step 4: Update PlayerForm to Handle Assignments

In `src/components/players/PlayerForm.tsx`, add the component before the submit button:

```tsx
import { SchoolTeamAssignment } from "@/components/common/SchoolTeamAssignment";

// Add state for assignments
const [assignments, setAssignments] = useState({
  schools: initialData.assignedSchools || [],
  teams: initialData.teamIds || [],
});

// In the form, before the CardFooter:
<div className="mt-6">
  <SchoolTeamAssignment
    initialSchools={initialData.assignedSchools || []}
    initialTeams={initialData.teamIds || []}
    onChange={setAssignments}
    mode="card"
  />
</div>
```

## Testing the Integration

### Test Case 1: Create New User with Assignments
1. Go to User Management
2. Click "Add User"
3. Fill in basic info (name, email)
4. Go to "Roles & Access" tab
5. Select "Player" as primary role
6. Add "Coach" as additional role
7. Go to "Assignments" tab
8. Add "Westville Boys' High School"
9. Add "Royal Challengers" team
10. Save and verify user is created with all assignments

### Test Case 2: Edit Existing User
1. Find a user in the table
2. Click the menu → "Edit Details"
3. Modify assignments in the "Assignments" tab
4. Save and verify changes persist

### Test Case 3: Automatic School Assignment
1. Edit a user
2. Go to "Assignments" tab
3. Add a team WITHOUT adding its school first
4. Verify the school is automatically added
5. Remove the school
6. Verify the team is also removed

## Common Issues and Solutions

### Issue 1: "Cannot read property 'assignedSchools' of undefined"
**Solution:** Ensure the Person/User type includes the new fields:
```typescript
interface Person {
  assignedSchools?: string[];
  teamIds?: string[];
  roles?: string[];
}
```

### Issue 2: Schools/Teams not loading in dropdown
**Solution:** Check that `fetchSchools()` and `fetchTeams()` are working:
```typescript
// In SchoolTeamAssignment component
useEffect(() => {
  const loadData = async () => {
    try {
      const [schoolsData, teamsData] = await Promise.all([
        fetchSchools(),
        fetchTeams(),
      ]);
      console.log('Loaded schools:', schoolsData.length);
      console.log('Loaded teams:', teamsData.length);
      setSchools(schoolsData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Failed to load schools/teams:", error);
    }
  };
  loadData();
}, []);
```

### Issue 3: Form submission not including assignments
**Solution:** The SchoolTeamAssignment component generates hidden inputs. Ensure your form action reads them:
```typescript
// In server action
export async function updatePlayerAction(id: string, prevState: any, formData: FormData) {
  const assignedSchools = formData.getAll('assignedSchools[]');
  const teamIds = formData.getAll('teamIds[]');
  
  // Update the person document
  await updateDoc(doc(db, 'people', id), {
    assignedSchools: assignedSchools,
    teamIds: teamIds,
    // ... other fields
  });
}
```

## Visual Preview

### Before Enhancement
```
┌─────────────────────────────────────┐
│ Edit User                           │
├─────────────────────────────────────┤
│ First Name: [John        ]          │
│ Last Name:  [Doe         ]          │
│ Email:      [john@...    ]          │
│ Role:       [Player ▼    ]          │
│ Status:     [Active ▼    ]          │
│                                     │
│           [Cancel] [Save]           │
└─────────────────────────────────────┘
```

### After Enhancement
```
┌─────────────────────────────────────────────┐
│ Edit User                                   │
├─────────────────────────────────────────────┤
│ [Basic Info] [Roles & Access] [Assignments] │
├─────────────────────────────────────────────┤
│ Assigned Schools                      [2]   │
│ [Select school...        ] [+]              │
│                                             │
│ 🏫 Westville Boys' High School    [×]       │
│ 🏫 St Stithians College           [×]       │
│                                             │
│ Assigned Teams                        [3]   │
│ [Select team...          ] [+]              │
│                                             │
│ 👥 Royal Challengers (WBHS)       [×]       │
│ 👥 Mumbai Indians (Saints)        [×]       │
│ 👥 Super Kings (WBHS)             [×]       │
│                                             │
│                    [Cancel] [Save Changes]  │
└─────────────────────────────────────────────┘
```

## Next Steps

1. **Integrate components** into existing pages
2. **Update server actions** to handle new fields
3. **Test thoroughly** with different user roles
4. **Update Firestore security rules** for RBAC
5. **Create migration script** for existing users
6. **Add bulk assignment features** for efficiency
