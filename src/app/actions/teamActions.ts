'use server';

import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { TeamSchema } from '@/lib/schemas/teamSchemas';
import { Team } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

export type TeamActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    // Extract and prepare data
    const rawData: Record<string, unknown> = {
      name: formData.get('name') || '',
      abbreviatedName: formData.get('abbreviatedName') || undefined,
      nickname: formData.get('nickname') || undefined,
      schoolId: formData.get('schoolId') || '',
      divisionId: formData.get('divisionId') || undefined,
      suffix: formData.get('suffix') || undefined,
      defaultCaptainId: formData.get('defaultCaptainId') || undefined,
      defaultViceCaptainId: formData.get('defaultViceCaptainId') || undefined,
      defaultScorerId: formData.get('defaultScorerId') || undefined,
    };

    // Parse coachIds if provided
    const coachIdsValue = formData.get('coachIds');
    if (coachIdsValue && typeof coachIdsValue === 'string' && coachIdsValue.trim()) {
      rawData.coachIds = coachIdsValue.split(',').map(id => id.trim()).filter(Boolean);
    }

    // Validate with Zod
    const validatedData = TeamSchema.parse(rawData);

    // Prepare data for Firestore
    const newTeamData: Omit<Team, 'id'> = {
      name: validatedData.name,
      schoolId: validatedData.schoolId,
      divisionId: validatedData.divisionId || undefined,
      abbreviatedName: validatedData.abbreviatedName || undefined,
      nickname: validatedData.nickname || undefined,
      suffix: validatedData.suffix || undefined,
      coachIds: validatedData.coachIds || [],
      defaultCaptainId: validatedData.defaultCaptainId || undefined,
      defaultViceCaptainId: validatedData.defaultViceCaptainId || undefined,
      defaultScorerId: validatedData.defaultScorerId || undefined,
      teamColors: { primary: '#000000', secondary: '#ffffff' }, // Default colors
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedData.name)}&background=random&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined keys to prevent Firestore errors
    Object.keys(newTeamData).forEach(key => {
      if ((newTeamData as any)[key] === undefined) {
        delete (newTeamData as any)[key];
      }
    });

    // Add to Firestore
    await createDocument<Omit<Team, 'id'>>('teams', newTeamData);

    revalidatePath('/teams');
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod validation errors
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Create team error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create team' };
  }
  redirect('/teams');
}

export async function updateTeamAction(
  teamId: string,
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    // Extract and prepare data
    const rawData: Record<string, unknown> = {
      name: formData.get('name') || '',
      abbreviatedName: formData.get('abbreviatedName') || undefined,
      nickname: formData.get('nickname') || undefined,
      schoolId: formData.get('schoolId') || '',
      divisionId: formData.get('divisionId') || undefined,
      suffix: formData.get('suffix') || undefined,
      defaultCaptainId: formData.get('defaultCaptainId') || undefined,
      defaultViceCaptainId: formData.get('defaultViceCaptainId') || undefined,
      defaultScorerId: formData.get('defaultScorerId') || undefined,
    };

    // Parse coachIds if provided
    const coachIdsValue = formData.get('coachIds');
    if (coachIdsValue && typeof coachIdsValue === 'string' && coachIdsValue.trim()) {
      rawData.coachIds = coachIdsValue.split(',').map(id => id.trim()).filter(Boolean);
    }

    // Validate with Zod
    const validatedData = TeamSchema.parse(rawData);

    // Update in Firestore
    const updateData: Partial<Team> = {
      name: validatedData.name,
      schoolId: validatedData.schoolId,
      divisionId: validatedData.divisionId || undefined,
      abbreviatedName: validatedData.abbreviatedName || undefined,
      nickname: validatedData.nickname || undefined,
      suffix: validatedData.suffix || undefined,
      coachIds: validatedData.coachIds || [],
      defaultCaptainId: validatedData.defaultCaptainId || undefined,
      defaultViceCaptainId: validatedData.defaultViceCaptainId || undefined,
      defaultScorerId: validatedData.defaultScorerId || undefined,
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });

    await updateDocument<Team>('teams', teamId, updateData);

    revalidatePath('/teams');
    revalidatePath(`/teams/${teamId}`);
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod validation errors
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update team error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update team' };
  }
  redirect(`/teams/${teamId}`);
}

export async function deleteTeamAction(teamId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument('teams', teamId);
    revalidatePath('/teams');
    return { success: true };
  } catch (error) {
    console.error('Delete team error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete team' };
  }
}

// ============================================
// Smart Team Creator Actions
// ============================================

import { fetchCoachesBySchool, fetchCollection } from '@/lib/firestore';
import { where } from 'firebase/firestore';
import { Person, AgeGroup } from '@/types/firestore';
import { checkDuplicateTeam } from '@/lib/utils/DuplicateTeamChecker';


/**
 * Get coaches assigned to a school
 * Fetches people with coach-related roles for the selected school
 */
export async function getCoachesBySchoolAction(schoolId: string): Promise<Person[]> {
  try {
    return await fetchCoachesBySchool(schoolId);
  } catch (error) {
    console.error('Error fetching coaches by school:', error);
    return [];
  }
}

/**
 * Get all teams for a school (optionally filtered by season)
 */
export async function getTeamsForSchoolAction(
  schoolId: string,
  seasonId?: string
): Promise<Team[]> {
  try {
    const teams = await fetchCollection<Team>('teams', [
      where('schoolId', '==', schoolId)
    ]);

    // Note: If seasonId filtering is needed, add additional logic
    // For now, return all teams for the school
    return teams;
  } catch (error) {
    console.error('Error fetching teams for school:', error);
    return [];
  }
}

/**
 * Check if a team with the same school + suffix already exists
 * Returns suggested alternative suffix if duplicate found
 */
export async function checkDuplicateTeamAction(
  schoolId: string,
  ageGroup: AgeGroup | string,
  suffix: string
): Promise<{ exists: boolean; suggestedSuffix?: string; existingSuffixes: string[] }> {
  try {
    const teams = await fetchCollection<Team>('teams', [
      where('schoolId', '==', schoolId)
    ]);

    const result = checkDuplicateTeam(teams, schoolId, ageGroup, suffix);

    return {
      exists: result.exists,
      suggestedSuffix: result.suggestedSuffix,
      existingSuffixes: result.existingSuffixes
    };
  } catch (error) {
    console.error('Error checking duplicate team:', error);
    return { exists: false, existingSuffixes: [] };
  }
}

/**
 * Create a new team with smart validation
 */
export async function createSmartTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  // Reuse the standard create action logic but we could add extra server-side checks here
  // For now, we'll just delegate to the standard create action
  // In a real implementation, we might want to re-run the duplicate check here to be safe
  return createTeamAction(prevState, formData);
}

