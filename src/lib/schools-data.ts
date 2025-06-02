
export interface SchoolTeam {
  id: string; // Could link to teamId later
  name: string;
  ageGroup?: string; // Added to better define teams within a school context
  division?: string; // Added for more team detail
}

export interface SchoolProfile {
  id: string; // Changed from number to string
  divisionId: string; // Link to Division entity
  name: string;
  location: string;
  crestUrl: string;
  fields: string[];
  bannerImageUrl?: string;
  about?: string;
  awardsAndAccolades?: string[];
  teams?: SchoolTeam[];
  records?: string[];
}

export const schoolsData: SchoolProfile[] = [
  {
    id: "school-1-michaelhouse",
    divisionId: "div_placeholder",
    name: "Michaelhouse",
    location: "Balgowan",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Roy Gathorne Oval", "Hannahs Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Michaelhouse is a leading independent senior boarding school for boys, located in the Midlands of KwaZulu-Natal, South Africa. It has a strong cricket tradition.",
    teams: [{ id: "mhs_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-2-hilton-college",
    divisionId: "div_placeholder",
    name: "Hilton College",
    location: "Hilton",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Weightman-Smith Oval", "Hart-Davis Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Hilton College is an independent boarding school for boys, renowned for its beautiful campus and sporting excellence.",
    teams: [{ id: "hc_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-3-maritzburg-college",
    divisionId: "div_placeholder",
    name: "Maritzburg College",
    location: "Pietermaritzburg",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Goldstones", "Varsity Oval", "Bavers"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    about: "Maritzburg College is one of the oldest boys' schools in KwaZulu-Natal, with a rich history in cricket.",
    teams: [{ id: "mc_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-4-glenwood-high-school",
    divisionId: "div_placeholder",
    name: "Glenwood High School",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Dixons", "The Subway"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "ghs_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-5-durban-high-school",
    divisionId: "div_placeholder",
    name: "Durban High School (DHS)",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["The Memorial Ground", "Seabreeze Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "dhs_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-6-kearsney-college",
    divisionId: "div_placeholder",
    name: "Kearsney College",
    location: "Botha's Hill",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["AH Smith Oval", "Matterson Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "kc_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-7-westville-boys-high-school",
    divisionId: "div_placeholder",
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
      { id: "wbhs_1stXI", name: "1st XI", ageGroup: "Open", division: "A" },
      { id: "wbhs_2ndXI", name: "2nd XI", ageGroup: "Open", division: "B" },
      { id: "wbhs_3rdXI", name: "3rd XI", ageGroup: "Open", division: "C" },
      { id: "wbhs_u16a", name: "U16A", ageGroup: "U16", division: "A" },
      { id: "wbhs_u16b", name: "U16B", ageGroup: "U16", division: "B" },
      { id: "wbhs_u15a", name: "U15A", ageGroup: "U15", division: "A" },
      { id: "wbhs_u15b", name: "U15B", ageGroup: "U15", division: "B" },
      { id: "wbhs_u15c", name: "U15C", ageGroup: "U15", division: "C" },
      { id: "wbhs_u14a", name: "U14A", ageGroup: "U14", division: "A" },
      { id: "wbhs_u14b", name: "U14B", ageGroup: "U14", division: "B" },
      { id: "wbhs_u14c", name: "U14C", ageGroup: "U14", division: "C" },
      { id: "wbhs_u14d", name: "U14D", ageGroup: "U14", division: "D" }
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
    id: "school-8-northwood-school",
    divisionId: "div_placeholder",
    name: "Northwood School",
    location: "Durban North",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Northwood Crusaders Main Oval", "Knights Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "nw_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-9-clifton-school",
    divisionId: "div_placeholder",
    name: "Clifton School",
    location: "Durban",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Clifton Riverside Sports Campus", "College Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "cs_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-10-st-charles-college",
    divisionId: "div_placeholder",
    name: "St Charles College",
    location: "Pietermaritzburg",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Samke Khumalo Oval", "College Oval"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "scc_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-11-crawford-college-la-lucia",
    divisionId: "div_placeholder",
    name: "Crawford College La Lucia",
    location: "La Lucia",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Main Cricket Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "ccll_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
  {
    id: "school-12-ashton-international-college-ballito",
    divisionId: "div_placeholder",
    name: "Ashton International College Ballito",
    location: "Ballito",
    crestUrl: "https://placehold.co/80x80.png",
    fields: ["Main Sports Field"],
    bannerImageUrl: "https://placehold.co/1200x400.png",
    teams: [{ id: "aicb_1stXI", name: "1st XI", ageGroup: "Open", division: "A" }],
  },
];

    