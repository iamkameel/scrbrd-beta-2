"use strict";
// This is a placeholder for the migrateSchools script.
// It was previously showing an error message related to src/app/players/page.tsx.
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
var scrbrd_beta_2_firebase_adminsdk_fbsvc_4c0a94b7bc_json_1 = require("./scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json");
var schools_data_js_1 = require("./src/lib/schools-data.js");
// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(scrbrd_beta_2_firebase_adminsdk_fbsvc_4c0a94b7bc_json_1.default)
    });
}
var db = admin.firestore();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var schoolsCollectionRef, _i, schoolsData_1, school, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting school data migration to Firebase...");
                    console.log("Found ".concat(schools_data_js_1.schoolsData.length, " schools to migrate."));
                    schoolsCollectionRef = db.collection('schools');
                    _i = 0, schoolsData_1 = schools_data_js_1.schoolsData;
                    _a.label = 1;
                case 1:
                    if (!(_i < schoolsData_1.length)) return [3 /*break*/, 6];
                    school = schoolsData_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, schoolsCollectionRef.doc(String(school.id)).set(school)];
                case 3:
                    _a.sent();
                    console.log("Successfully migrated school: ".concat(school.name, " (ID: ").concat(school.id, ")"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error migrating school ".concat(school.name, " (ID: ").concat(school.id, "):"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("School data migration complete.");
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("migrateSchools.ts script failed:", error);
    process.exit(1);
});
