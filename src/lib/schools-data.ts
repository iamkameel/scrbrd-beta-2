
export interface SchoolTeam {
  id: string; // Could link to teamId later
  name: string;
  ageGroup: string;
  division: string;
}

export interface SchoolProfile {
  id: number;
  name: string;
  location: string;
  crestUrl: string;
  fields: string[];
  bannerImageUrl?: string;
  about?: string;
  awardsAndAccolades?: string[];
  teams?: SchoolTeam[]; // More structured team info
  records?: string[];
}

export const schoolsData: SchoolProfile[] = [
  {
    id: 1,
    name: "Michaelhouse",
    location: "Balgowan",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Roy Gathorne Oval", "Hannahs Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Michaelhouse is a leading independent senior boarding school for boys, located in the Midlands of KwaZulu-Natal, South Africa. It has a strong cricket tradition.",
    teams: [{ id: "mhs_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 2,
    name: "Hilton College",
    location: "Hilton",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Weightman-Smith Oval", "Hart-Davis Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Hilton College is an independent boarding school for boys, renowned for its beautiful campus and sporting excellence.",
    teams: [{ id: "hc_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 3,
    name: "Maritzburg College",
    location: "Pietermaritzburg",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Goldstones", "Varsity Oval", "Bavers"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Maritzburg College is one of the oldest boys' schools in KwaZulu-Natal, with a rich history in cricket.",
    teams: [{ id: "mc_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 4,
    name: "Glenwood High School",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Dixons", "The Subway"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "ghs_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 5,
    name: "Durban High School (DHS)",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["The Memorial Ground", "Seabreeze Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "dhs_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 6,
    name: "Kearsney College",
    location: "Botha's Hill",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["AH Smith Oval", "Matterson Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "kc_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 7,
    name: "Westville Boys' High School",
    location: "Westville",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Bowsden's Field", "Commons Field", "Roy Couzens Oval", "Lutge Field", "Main Astro (practice nets)"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Westville Boys' High School, established in 1955, is a prominent public school for boys located in Westville, KwaZulu-Natal, South Africa. The school is renowned for its strong academic record, diverse sporting programs, and commitment to developing well-rounded young men. Cricket is a major sport at WBHS, with a proud history and numerous teams participating across various age groups and divisions. WBHS aims to instill values of sportsmanship, discipline, and teamwork through its comprehensive cricket program, catering to players of all skill levels.",
    awardsAndAccolades: [
      "Cricket Team of the Year 2022 (KZN Inland Schools Cricket Association)",
      "U15 National T20 Champions 2019",
      "Top 10 Cricket Schools in South Africa (SA Schools Sports Magazine 2023 Ranking)",
      "Consistently producing Provincial and National age-group representatives"
    ],
    teams: [
      { id: "wbhs_1st", name: "1st XI", ageGroup: "Open", division: "A" },
      { id: "wbhs_2nd", name: "2nd XI", ageGroup: "Open", division: "B" },
      { id: "wbhs_3rd", name: "3rd XI", ageGroup: "Open", division: "C" },
      { id: "wbhs_u16a", name: "U16A", ageGroup: "U16", division: "A" },
      { id: "wbhs_u16b", name: "U16B", ageGroup: "U16", division: "B" },
      { id: "wbhs_u15a", name: "U15A", ageGroup: "U15", division: "A" },
      { id: "wbhs_u15b", name: "U15B", ageGroup: "U15", division: "B" },
      { id: "wbhs_u15c", name: "U15C", ageGroup: "U15", division: "C" },
      { id: "wbhs_u14a", name: "U14A", ageGroup: "U14", division: "A" },
      { id: "wbhs_u14b", name: "U14B", ageGroup: "U14", division: "B" },
      { id: "wbhs_u14c", name: "U14C", ageGroup: "U14", division: "C" },
      { id: "wbhs_u14d", name: "U14D", ageGroup: "U14", division: "Social" }
    ],
    records: [
      "Highest 1st XI Partnership: 255 runs (A. Smith & B. Jones, 2021 vs Hilton College)",
      "Most Wickets in a Season (1st XI): 72 wickets (P. Adams, 2018)",
      "Most Centuries for 1st XI: 7 (K. Peters, Career: 2019-2022)",
      "Most Runs in a Season (1st XI): 1058 runs (J. Miller, 2023)",
      "Best Bowling Figures (1st XI): 8/15 (S. Khan, 2017 vs Michaelhouse)"
    ]
  },
  {
    id: 8,
    name: "Northwood School",
    location: "Durban North",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Northwood Crusaders Main Oval", "Knights Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "nw_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 9,
    name: "Clifton School",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Clifton Riverside Sports Campus", "College Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "cs_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 10,
    name: "St Charles College",
    location: "Pietermaritzburg",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Samke Khumalo Oval", "College Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "scc_1st", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: 11,
    name: "Crawford College La Lucia",
    location: "La Lucia",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Main Cricket Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "ccll_1st", name: "1st XI", ageGroup: "Open", division: "B" }],
  },
  {
    id: 12,
    name: "Ashton International College Ballito",
    location: "Ballito",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Main Sports Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "aicb_1st", name: "1st XI", ageGroup: "Open", division: "B" }],
  },
];
