"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var team_data_1 = require("./src/lib/team-data");
// Initialize Firebase Admin SDK
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // Add other Firebase configuration if needed, e.g., databaseURL
        // databaseURL: 'https://your-project-id.firebaseio.com',
    });
}
catch (error) {
    // Optionally, handle the error differently if it's not due to re-initialization
    // process.exit(1); // Exit if initialization failed for another reason
}
var db = admin.firestore();
function migrateTeams() {
    return __awaiter(this, void 0, void 0, function () {
        var playerPlaceholderIdToFirebaseIdMap, schoolsSnapshot, schoolNameToIdMap_1, divisionsSnapshot, divisionMap_1, _i, detailedTeamsData_1, teamData, actualSchoolId, schoolName, actualDivisionId, potentialDivisionIdentifier, teamToMigrate, teamDocRef, batch, playerRefs, _a, _b, player, placeholderPlayerId, firebasePlayerId, playerDocRef, batchError_1, error_1, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    playerPlaceholderIdToFirebaseIdMap = {
                    // Example: "P101": "actual_firebase_player_id_for_P101",
                    };
                    console.log('Starting team data migration to Firebase...');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 18, , 19]);
                    return [4 /*yield*/, db.collection('schools').get()];
                case 2:
                    schoolsSnapshot = _c.sent();
                    schoolNameToIdMap_1 = {};
                    schoolsSnapshot.forEach(function (doc) {
                        var schoolData = doc.data();
                        schoolNameToIdMap_1[schoolData.name] = doc.id;
                    });
                    return [4 /*yield*/, db.collection('divisions').get()];
                case 3:
                    divisionsSnapshot = _c.sent();
                    divisionMap_1 = {};
                    divisionsSnapshot.forEach(function (doc) {
                        divisionMap_1[doc.id] = doc.id; // Map division ID to document ID
                        var divisionData = doc.data();
                        divisionMap_1[divisionData.name] = doc.id; // Map division name to document ID
                    });
                    console.log("Found ".concat(team_data_1.detailedTeamsData.length, " teams to migrate."));
                    _i = 0, detailedTeamsData_1 = team_data_1.detailedTeamsData;
                    _c.label = 4;
                case 4:
                    if (!(_i < detailedTeamsData_1.length)) return [3 /*break*/, 17];
                    teamData = detailedTeamsData_1[_i];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 15, , 16]);
                    actualSchoolId = schoolNameToIdMap_1[teamData.schoolId] || null;
                    // If schoolId is still a placeholder or not found, try to infer from teamName (less reliable)
                    if (!actualSchoolId) {
                        for (schoolName in schoolNameToIdMap_1) {
                            if (teamData.teamName.includes(schoolName) || teamData.id.includes(schoolNameToIdMap_1[schoolName])) {
                                actualSchoolId = schoolNameToIdMap_1[schoolName];
                                break;
                            }
                        }
                    }
                    if (!actualSchoolId) {
                        console.warn("Could not find a matching school for team ".concat(teamData.teamName, ". Skipping migration for this team."));
                        return [3 /*break*/, 16]; // Skip this team if school ID cannot be determined
                    }
                    actualDivisionId = divisionMap_1[teamData.divisionId];
                    if (!actualDivisionId && teamData.ageGroup && teamData.division) {
                        potentialDivisionIdentifier = "".concat(teamData.ageGroup.toLowerCase()).concat(teamData.division.toLowerCase());
                        actualDivisionId = divisionMap_1[potentialDivisionIdentifier];
                        if (!actualDivisionId) {
                            actualDivisionId = divisionMap_1["".concat(teamData.ageGroup, " ").concat(teamData.division)]; // Example: U16 A
                        }
                    }
                    teamToMigrate = {
                        id: teamData.id,
                        teamName: teamData.teamName,
                        schoolId: actualSchoolId, // Add the missing schoolId
                        divisionId: actualDivisionId || 'unassigned_division', // Use found divisionId or a default
                        ageGroup: teamData.ageGroup,
                        division: teamData.division,
                        mascot: teamData.mascot,
                        performanceStats: teamData.performanceStats,
                        players: [] // We will add player references here
                    };
                    teamDocRef = db.collection('teams').doc(teamToMigrate.id);
                    return [4 /*yield*/, teamDocRef.set(teamToMigrate)];
                case 6:
                    _c.sent();
                    console.log("Successfully migrated team: ".concat(teamToMigrate.teamName, " (ID: ").concat(teamToMigrate.id, ")"));
                    if (!(teamData.squad && teamData.squad.length > 0)) return [3 /*break*/, 13];
                    console.log("Updating ".concat(teamData.squad.length, " player documents for team ").concat(teamToMigrate.teamName, "..."));
                    batch = db.batch();
                    playerRefs = [];
                    for (_a = 0, _b = teamData.squad; _a < _b.length; _a++) {
                        player = _b[_a];
                        placeholderPlayerId = player.id;
                        firebasePlayerId = playerPlaceholderIdToFirebaseIdMap[placeholderPlayerId];
                        if (firebasePlayerId) {
                            playerDocRef = db.collection('players').doc(firebasePlayerId);
                            batch.update(playerDocRef, {
                                teamId: teamToMigrate.id,
                                teamRef: teamDocRef // Add a reference to the team document
                            });
                            playerRefs.push(playerDocRef);
                            console.log("Successfully matched player with placeholder ID \"".concat(placeholderPlayerId, "\" to Firebase ID \"").concat(firebasePlayerId, "\"."));
                        }
                        else {
                            console.warn("Could not find a Firebase ID mapping for placeholder player ID \"".concat(placeholderPlayerId, "\" from team \"").concat(teamToMigrate.teamName, "\". Skipping linking for this player."));
                        }
                    }
                    if (!(playerRefs.length > 0)) return [3 /*break*/, 11];
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, batch.commit()];
                case 8:
                    _c.sent();
                    console.log("Successfully committed batch update for players for team: ".concat(teamToMigrate.teamName));
                    return [3 /*break*/, 10];
                case 9:
                    batchError_1 = _c.sent();
                    console.error("Error committing batch update for team ".concat(teamToMigrate.teamName, ":"), batchError_1);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 12];
                case 11:
                    console.log("No players found with valid Firebase IDs for team ".concat(teamToMigrate.teamName, ". No batch update needed."));
                    _c.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    console.log("Team ".concat(teamToMigrate.teamName, " has no players in the squad data. Skipping player document updates."));
                    _c.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _c.sent();
                    console.error("Error migrating team ".concat(teamData.teamName, " (ID: ").concat(teamData.id, "):"), error_1);
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 4];
                case 17: return [3 /*break*/, 19];
                case 18:
                    error_2 = _c.sent();
                    // Catch any errors during the initial fetch of schools or the overall migration loop
                    console.error('Error during team migration process:', error_2);
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
migrateTeams();
