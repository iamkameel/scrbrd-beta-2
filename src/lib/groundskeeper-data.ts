
export interface AssignedField {
  fieldName: string;
  location: string; // e.g., School Name or specific venue
  conditionNotes?: string; // Optional notes about the field condition
}

export interface GroundskeeperProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  experienceYears: number;
  expertiseAreas: string[]; // e.g., "Pitch Preparation", "Outfield Maintenance", "Irrigation Systems"
  assignedFields: AssignedField[];
  bio?: string;
  availability?: "Full-time" | "Part-time" | "Contract";
}

export const groundkeepersData: GroundskeeperProfile[] = [
  {
    id: "gk-1",
    name: "Arthur Weasley",
    avatar: "https://placehold.co/100x100.png",
    email: "arthur.w@example.com",
    phone: "555-0301",
    experienceYears: 15,
    expertiseAreas: ["Pitch Preparation", "Outfield Maintenance", "Cricket Square Management"],
    assignedFields: [
      { fieldName: "Northwood Main Oval", location: "Northwood School", conditionNotes: "Excellent condition, well-drained." },
      { fieldName: "Knights Field B", location: "Northwood School", conditionNotes: "Good for practice sessions." },
    ],
    bio: "Arthur is a highly experienced groundskeeper with a passion for creating perfect playing surfaces. He has managed top-tier school cricket grounds for over a decade.",
    availability: "Full-time",
  },
  {
    id: "gk-2",
    name: "Bertha Jorkins",
    avatar: "https://placehold.co/100x100.png",
    email: "bertha.j@example.com",
    phone: "555-0302",
    experienceYears: 8,
    expertiseAreas: ["Irrigation Systems", "Pest Control", "General Turf Management"],
    assignedFields: [
      { fieldName: "Hilton College Main Field", location: "Hilton College" },
      { fieldName: "Weightman-Smith Oval", location: "Hilton College", conditionNotes: "Currently undergoing minor aeration." },
    ],
    bio: "Bertha specializes in sustainable turf management and advanced irrigation techniques, ensuring fields remain playable throughout the season.",
    availability: "Full-time",
  },
  {
    id: "gk-3",
    name: "Cedric Diggory",
    avatar: "https://placehold.co/100x100.png",
    email: "cedric.d@example.com",
    phone: "555-0303",
    experienceYears: 5,
    expertiseAreas: ["Outfield Mowing Patterns", "Soil Health", "Seasonal Field Renovation"],
    assignedFields: [
      { fieldName: "Kingsmead Stadium (Contract)", location: "Durban" },
      { fieldName: "Chatsworth Oval (Consultant)", location: "Chatsworth" },
    ],
    bio: "Cedric is known for his meticulous attention to detail in outfield presentation and seasonal field renovations. He also consults for several prominent clubs.",
    availability: "Contract",
  },
  {
    id: "gk-4",
    name: "Doris Crockford",
    avatar: "https://placehold.co/100x100.png",
    email: "doris.c@example.com",
    phone: "555-0304",
    experienceYears: 20,
    expertiseAreas: ["Head Groundskeeper", "Budget Management", "Team Leadership", "Major Tournament Preparation"],
    assignedFields: [
      { fieldName: "All Westville Boys' High Fields", location: "Westville Boys' High School" },
    ],
    bio: "Doris is a veteran Head Groundskeeper with two decades of experience managing multi-field school sports complexes and preparing grounds for major tournaments.",
    availability: "Full-time",
  },
];
