// All records here are FICTIONAL demo data. No real doctors, clinics, or patients.
import type { Community, Doctor, Review, Specialty } from "./types";

export const SPECIALTIES: Specialty[] = [
  { key: "dermatology", label: "Dermatologist", plural: "Dermatologists", field: "Dermatology" },
  { key: "orthopedics", label: "Orthopedic", plural: "Orthopedics", field: "Orthopedics" },
  { key: "ent", label: "ENT Specialist", plural: "ENT Specialists", field: "ENT" },
  { key: "dentistry", label: "Dentist", plural: "Dentists", field: "Dentistry" },
  { key: "cardiology", label: "Cardiologist", plural: "Cardiologists", field: "Cardiology" },
  { key: "general-medicine", label: "General Physician", plural: "General Physicians", field: "General Medicine" },
  { key: "gynecology", label: "Gynecologist", plural: "Gynecologists", field: "Gynecology" },
];

export const CITIES = ["Bangalore", "Bhopal", "Mumbai", "Delhi", "Pune", "Hyderabad"];

export const COMMUNITIES: Community[] = [
  {
    id: "c-nit",
    name: "NIT Alumni",
    type: "alumni",
    verified: true,
    description: "Alumni of the National Institutes of Technology. Membership verified privately.",
  },
  {
    id: "c-microsoft",
    name: "Microsoft Community",
    type: "workplace",
    verified: true,
    description: "Current and former Microsoft employees. Verified via work email.",
  },
  {
    id: "c-friends",
    name: "Friends",
    type: "friends",
    verified: true,
    description: "A private circle of friends you have added.",
  },
  {
    id: "c-family",
    name: "Family",
    type: "family",
    verified: true,
    description: "Your family circle.",
  },
];

/** Communities the demo user is pre-verified into. */
export const DEFAULT_USER_COMMUNITY_IDS = ["c-nit", "c-microsoft"];

type DoctorBase = Omit<Doctor, "qualifications" | "specializations">;

const DOCTOR_BASE: DoctorBase[] = [
  {
    id: "meera-sharma",
    name: "Dr. Meera Sharma",
    specialty: "dermatology",
    clinicName: "Skinwell Clinic",
    city: "Bangalore",
    area: "Indiranagar",
    consultationFee: 800,
    yearsExperience: 12,
    languages: ["English", "Hindi", "Kannada"],
    demoVerified: true,
    insights: {
      communication: 91,
      listening: 89,
      feeTransparency: 82,
      waitTime: 61,
      summary:
        "Patients frequently mention clear explanations and attentive, unhurried consultations. Waiting time at the clinic is the most common concern.",
      positiveThemes: ["Clear communication", "Patient consultation", "Transparent fees"],
      concerns: ["Clinic waiting time"],
    },
  },
  {
    id: "rohan-mehta",
    name: "Dr. Rohan Mehta",
    specialty: "dermatology",
    clinicName: "Glow Derma Care",
    city: "Bangalore",
    area: "Koramangala",
    consultationFee: 700,
    yearsExperience: 8,
    languages: ["English", "Hindi"],
    demoVerified: true,
    insights: {
      communication: 84,
      listening: 80,
      feeTransparency: 88,
      waitTime: 90,
      summary:
        "Reviewers describe short waits and a well-organised clinic. A few mention consultations felt brief.",
      positiveThemes: ["Short waiting time", "Convenient location", "Clear fees"],
      concerns: ["Consultations can feel rushed"],
    },
  },
  {
    id: "ananya-iyer",
    name: "Dr. Ananya Iyer",
    specialty: "dermatology",
    clinicName: "Whitefield Skin Studio",
    city: "Bangalore",
    area: "Whitefield",
    consultationFee: 600,
    yearsExperience: 6,
    languages: ["English", "Tamil", "Kannada"],
    demoVerified: true,
    insights: {
      communication: 88,
      listening: 92,
      feeTransparency: 75,
      waitTime: 70,
      summary:
        "Reviewers highlight a patient, listening-first approach. Some wished fees had been explained up front.",
      positiveThemes: ["Careful listening", "Friendly staff"],
      concerns: ["Fees not always explained in advance"],
    },
  },
  {
    id: "kavita-rao",
    name: "Dr. Kavita Rao",
    specialty: "orthopedics",
    clinicName: "Jayanagar Bone & Joint Centre",
    city: "Bangalore",
    area: "Jayanagar",
    consultationFee: 900,
    yearsExperience: 15,
    languages: ["English", "Kannada", "Hindi"],
    demoVerified: true,
    insights: {
      communication: 86,
      listening: 84,
      feeTransparency: 90,
      waitTime: 55,
      summary:
        "Patients describe thorough explanations, with imaging and options discussed clearly. Long waits on weekday evenings are mentioned often.",
      positiveThemes: ["Thorough explanations", "Transparent fees"],
      concerns: ["Long evening waits"],
    },
  },
  {
    id: "arjun-verma",
    name: "Dr. Arjun Verma",
    specialty: "orthopedics",
    clinicName: "Lakeview Ortho Clinic",
    city: "Bhopal",
    area: "MP Nagar",
    consultationFee: 500,
    yearsExperience: 10,
    languages: ["Hindi", "English"],
    demoVerified: true,
    insights: {
      communication: 93,
      listening: 90,
      feeTransparency: 85,
      waitTime: 80,
      summary:
        "Consistently described as approachable and clear, with a well-run clinic and reasonable waits.",
      positiveThemes: ["Approachable", "Clear explanations", "Reasonable waits"],
      concerns: [],
    },
  },
  {
    id: "sunita-patel",
    name: "Dr. Sunita Patel",
    specialty: "gynecology",
    clinicName: "Bandra Women's Health Clinic",
    city: "Mumbai",
    area: "Bandra West",
    consultationFee: 1000,
    yearsExperience: 18,
    languages: ["English", "Hindi", "Gujarati", "Marathi"],
    demoVerified: true,
    insights: {
      communication: 90,
      listening: 95,
      feeTransparency: 78,
      waitTime: 50,
      summary:
        "Reviewers repeatedly mention feeling heard and never rushed. Waiting time is the main drawback raised.",
      positiveThemes: ["Feeling heard", "Unhurried consultations"],
      concerns: ["Waiting time", "Fee clarity"],
    },
  },
  {
    id: "vikram-nair",
    name: "Dr. Vikram Nair",
    specialty: "cardiology",
    clinicName: "Saket Heart Care",
    city: "Delhi",
    area: "Saket",
    consultationFee: 1200,
    yearsExperience: 20,
    languages: ["English", "Hindi", "Malayalam"],
    demoVerified: true,
    insights: {
      communication: 80,
      listening: 78,
      feeTransparency: 85,
      waitTime: 60,
      summary:
        "Reviewers describe a structured, to-the-point consultation style. Some wanted more time for questions.",
      positiveThemes: ["Structured consultation", "Clear fees"],
      concerns: ["Limited time for questions"],
    },
  },
  {
    id: "priya-desai",
    name: "Dr. Priya Desai",
    specialty: "dentistry",
    clinicName: "Kothrud Smile Studio",
    city: "Pune",
    area: "Kothrud",
    consultationFee: 400,
    yearsExperience: 7,
    languages: ["Marathi", "Hindi", "English"],
    demoVerified: true,
    insights: {
      communication: 82,
      listening: 80,
      feeTransparency: 70,
      waitTime: 85,
      summary:
        "Short waits and a friendly manner come up often. A few reviewers were surprised by add-on costs.",
      positiveThemes: ["Short waits", "Friendly"],
      concerns: ["Add-on costs not explained"],
    },
  },
  {
    id: "farhan-qureshi",
    name: "Dr. Farhan Qureshi",
    specialty: "ent",
    clinicName: "Banjara ENT Centre",
    city: "Hyderabad",
    area: "Banjara Hills",
    consultationFee: 600,
    yearsExperience: 11,
    languages: ["Telugu", "Urdu", "Hindi", "English"],
    demoVerified: true,
    insights: {
      communication: 87,
      listening: 85,
      feeTransparency: 88,
      waitTime: 75,
      summary: "Reviewers describe patient explanations and a calm clinic environment.",
      positiveThemes: ["Patient explanations", "Calm clinic"],
      concerns: [],
    },
  },
  {
    id: "neha-kulkarni",
    name: "Dr. Neha Kulkarni",
    specialty: "general-medicine",
    clinicName: "HSR Family Clinic",
    city: "Bangalore",
    area: "HSR Layout",
    consultationFee: 500,
    yearsExperience: 9,
    languages: ["English", "Hindi", "Marathi", "Kannada"],
    demoVerified: true,
    insights: {
      communication: 92,
      listening: 90,
      feeTransparency: 92,
      waitTime: 72,
      summary:
        "Frequently described as warm and clear, with fees explained before the consultation.",
      positiveThemes: ["Warm manner", "Clear fees", "Clear explanations"],
      concerns: ["Occasional waits"],
    },
  },
  {
    id: "sameer-joshi",
    name: "Dr. Sameer Joshi",
    specialty: "dentistry",
    clinicName: "Indiranagar Dental Studio",
    city: "Bangalore",
    area: "Indiranagar",
    consultationFee: 500,
    yearsExperience: 5,
    languages: ["English", "Hindi", "Kannada"],
    demoVerified: true,
    insights: {
      communication: 85,
      listening: 83,
      feeTransparency: 80,
      waitTime: 88,
      summary: "Reviewers mention a modern clinic and short waits.",
      positiveThemes: ["Short waits", "Modern clinic"],
      concerns: [],
    },
  },
];

/** Qualifications and areas of focus, shown on the doctor profile. */
const DOCTOR_DETAILS: Record<string, Pick<Doctor, "qualifications" | "specializations">> = {
  "meera-sharma": {
    qualifications: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    specializations: ["Acne & scarring", "Pigmentation", "Hair loss", "Cosmetic dermatology"],
  },
  "rohan-mehta": {
    qualifications: "MBBS, DDVL",
    specializations: ["General dermatology", "Eczema & allergies", "Laser procedures"],
  },
  "ananya-iyer": {
    qualifications: "MBBS, MD (Dermatology)",
    specializations: ["Pediatric dermatology", "Psoriasis", "Skin allergies"],
  },
  "kavita-rao": {
    qualifications: "MBBS, MS (Orthopaedics), Fellowship in Joint Replacement",
    specializations: ["Knee & hip replacement", "Sports injuries", "Arthritis care"],
  },
  "arjun-verma": {
    qualifications: "MBBS, MS (Orthopaedics)",
    specializations: ["Fracture care", "Spine", "Sports injuries"],
  },
  "sunita-patel": {
    qualifications: "MBBS, MD (Obstetrics & Gynaecology)",
    specializations: ["High-risk pregnancy", "PCOS", "Menopause care", "Laparoscopic surgery"],
  },
  "vikram-nair": {
    qualifications: "MBBS, MD (Medicine), DM (Cardiology)",
    specializations: ["Preventive cardiology", "Hypertension", "Echocardiography"],
  },
  "priya-desai": {
    qualifications: "BDS, MDS (Conservative Dentistry)",
    specializations: ["Root canal", "Cosmetic dentistry", "Teeth whitening"],
  },
  "farhan-qureshi": {
    qualifications: "MBBS, MS (ENT)",
    specializations: ["Sinus & allergy", "Hearing", "Pediatric ENT"],
  },
  "neha-kulkarni": {
    qualifications: "MBBS, MD (General Medicine)",
    specializations: ["Family medicine", "Diabetes & thyroid", "Preventive health"],
  },
  "sameer-joshi": {
    qualifications: "BDS, MDS (Orthodontics)",
    specializations: ["Braces & aligners", "Dental implants", "Preventive dentistry"],
  },
};

export const DOCTORS: Doctor[] = DOCTOR_BASE.map((d) => ({
  ...d,
  ...(DOCTOR_DETAILS[d.id] ?? { qualifications: "", specializations: [] }),
}));

// Helper to keep the review list readable.
type R = Omit<Review, "id" | "safeToPublish" | "reviewerDisplayLabel"> & {
  reviewerDisplayLabel?: string;
};
let seq = 1;
const COMMUNITY_REVIEWER_LABEL: Record<string, string> = {
  "c-nit": "NIT Alumni",
  "c-microsoft": "Microsoft community",
  "c-friends": "Friends circle",
  "c-family": "Family circle",
};
function r(x: R): Review {
  return {
    id: `rv-${String(seq++).padStart(3, "0")}`,
    safeToPublish: true,
    reviewerDisplayLabel:
      x.reviewerDisplayLabel ??
      (x.communityId ? COMMUNITY_REVIEWER_LABEL[x.communityId] : "Verified visit"),
    ...x,
  };
}

export const REVIEWS: Review[] = [
  // ---------- Dr. Meera Sharma: 6 NIT (5 rec), 2 Workplace (2 rec), 2 general ----------
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "She listened carefully and explained everything clearly without rushing. Fees were told up front.", aiThemes: ["Clear communication", "Patient consultation", "Transparent fees"], aiSummary: "Attentive, clear consultation with fees explained in advance.", createdAt: "2026-07-14" }),
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Very thorough. I waited about 40 minutes but the consultation itself was worth it.", aiThemes: ["Thorough consultation", "Waiting time"], aiSummary: "Thorough consultation; noted a 40-minute wait.", createdAt: "2026-06-30" }),
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Explained the options patiently and answered all my questions. Staff were polite.", aiThemes: ["Clear communication", "Polite staff"], aiSummary: "Patient explanations and polite staff.", createdAt: "2026-06-02" }),
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "somewhat", explanation: "yes", feesClear: false, waitTime: "30-60", wouldRecommend: "maybe", writtenExperience: "Good doctor but the clinic was crowded and the wait was long. Fees were higher than I expected.", aiThemes: ["Waiting time", "Fee clarity"], aiSummary: "Positive on the doctor; concerns about wait and fee clarity.", createdAt: "2026-05-18" }),
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Got an early slot and was seen almost immediately. Clear, practical advice on what to expect.", aiThemes: ["Short waiting time", "Clear communication"], aiSummary: "Quick appointment with clear, practical communication.", createdAt: "2026-04-22" }),
  r({ doctorId: "meera-sharma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Calm and reassuring. Did not push unnecessary procedures.", aiThemes: ["Reassuring manner", "No upselling"], aiSummary: "Reassuring, no pressure for extra procedures.", createdAt: "2026-03-09" }),
  r({ doctorId: "meera-sharma", communityId: "c-microsoft", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "A colleague recommended her and I see why. Explained things in plain language.", aiThemes: ["Clear communication"], aiSummary: "Plain-language explanations.", createdAt: "2026-07-01" }),
  r({ doctorId: "meera-sharma", communityId: "c-microsoft", listening: "yes", explanation: "somewhat", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Attentive, though I had to ask a couple of follow-up questions to fully understand. Long wait.", aiThemes: ["Attentive", "Waiting time"], aiSummary: "Attentive consultation; long wait noted.", createdAt: "2026-05-05" }),
  r({ doctorId: "meera-sharma", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Professional and kind. The clinic is easy to find.", aiThemes: ["Professional", "Convenient location"], aiSummary: "Professional manner, convenient location.", createdAt: "2026-02-11" }),
  r({ doctorId: "meera-sharma", communityId: null, listening: "yes", explanation: "yes", feesClear: false, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Good experience overall. Would have liked the fee explained before the visit.", aiThemes: ["Fee clarity"], aiSummary: "Good overall; fee not explained in advance.", createdAt: "2026-01-20" }),

  // ---------- Dr. Rohan Mehta: general only ----------
  r({ doctorId: "rohan-mehta", communityId: null, listening: "somewhat", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "In and out in 20 minutes. Efficient, though it felt a bit quick.", aiThemes: ["Short waiting time", "Brief consultation"], aiSummary: "Efficient visit; consultation felt brief.", createdAt: "2026-07-10" }),
  r({ doctorId: "rohan-mehta", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Convenient location and no waiting. Fees clearly listed at reception.", aiThemes: ["Convenient location", "Transparent fees"], aiSummary: "Convenient, no wait, clear fees.", createdAt: "2026-06-15" }),
  r({ doctorId: "rohan-mehta", communityId: null, listening: "yes", explanation: "somewhat", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Friendly and quick. I would have appreciated a bit more explanation.", aiThemes: ["Friendly", "Brief consultation"], aiSummary: "Friendly, quick; wanted more explanation.", createdAt: "2026-05-01" }),
  r({ doctorId: "rohan-mehta", communityId: null, listening: "no", explanation: "somewhat", feesClear: true, waitTime: "<15", wouldRecommend: "no", writtenExperience: "Felt rushed and did not get to ask my questions.", aiThemes: ["Rushed consultation"], aiSummary: "Felt rushed.", createdAt: "2026-03-28" }),
  r({ doctorId: "rohan-mehta", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Well-organised clinic, on-time appointment.", aiThemes: ["Short waiting time", "Organised clinic"], aiSummary: "On-time, organised.", createdAt: "2026-02-02" }),

  // ---------- Dr. Ananya Iyer: 1 Friends, 1 Family, 1 general ----------
  r({ doctorId: "ananya-iyer", communityId: "c-friends", listening: "yes", explanation: "yes", feesClear: false, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Really listens. Only downside: I found out the fee at the counter.", aiThemes: ["Careful listening", "Fee clarity"], aiSummary: "Listens carefully; fee not shared in advance.", createdAt: "2026-07-05" }),
  r({ doctorId: "ananya-iyer", communityId: "c-family", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Took her time and made my mother comfortable. Friendly staff.", aiThemes: ["Careful listening", "Friendly staff"], aiSummary: "Unhurried, friendly.", createdAt: "2026-05-22" }),
  r({ doctorId: "ananya-iyer", communityId: null, listening: "yes", explanation: "somewhat", feesClear: false, waitTime: "30-60", wouldRecommend: "maybe", writtenExperience: "Kind doctor, but the wait was long and fee was unclear.", aiThemes: ["Waiting time", "Fee clarity"], aiSummary: "Kind; wait and fee concerns.", createdAt: "2026-04-01" }),

  // ---------- Dr. Kavita Rao: 3 Workplace (2 rec), 2 general ----------
  r({ doctorId: "kavita-rao", communityId: "c-microsoft", listening: "yes", explanation: "yes", feesClear: true, waitTime: ">60", wouldRecommend: "yes", writtenExperience: "Walked me through the scan images and options carefully. Wait was over an hour on a weekday evening.", aiThemes: ["Thorough explanations", "Waiting time"], aiSummary: "Thorough explanations; very long evening wait.", createdAt: "2026-07-12" }),
  r({ doctorId: "kavita-rao", communityId: "c-microsoft", listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Clear about costs before anything was done. Explained the plan step by step.", aiThemes: ["Transparent fees", "Clear communication"], aiSummary: "Transparent fees, step-by-step explanation.", createdAt: "2026-06-08" }),
  r({ doctorId: "kavita-rao", communityId: "c-microsoft", listening: "somewhat", explanation: "yes", feesClear: true, waitTime: ">60", wouldRecommend: "maybe", writtenExperience: "Competent and clear but the wait was exhausting.", aiThemes: ["Waiting time"], aiSummary: "Clear communication; exhausting wait.", createdAt: "2026-04-15" }),
  r({ doctorId: "kavita-rao", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Explained everything in simple terms.", aiThemes: ["Clear communication"], aiSummary: "Simple, clear explanations.", createdAt: "2026-03-03" }),
  r({ doctorId: "kavita-rao", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Morning slot meant a short wait. Very professional.", aiThemes: ["Professional", "Short waiting time"], aiSummary: "Professional, short morning wait.", createdAt: "2026-01-30" }),

  // ---------- Dr. Arjun Verma (Bhopal): 4 NIT (4 rec), 1 Family ----------
  r({ doctorId: "arjun-verma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Half our hostel went to him back in the day. Approachable and explains clearly.", aiThemes: ["Approachable", "Clear explanations"], aiSummary: "Approachable, clear.", createdAt: "2026-06-20" }),
  r({ doctorId: "arjun-verma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Barely any wait. Fees very reasonable and stated up front.", aiThemes: ["Short waiting time", "Transparent fees"], aiSummary: "Short wait, transparent fees.", createdAt: "2026-05-11" }),
  r({ doctorId: "arjun-verma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Patient with questions, never made me feel rushed.", aiThemes: ["Patient consultation"], aiSummary: "Patient, unhurried.", createdAt: "2026-03-17" }),
  r({ doctorId: "arjun-verma", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Clear about what to expect and when to follow up.", aiThemes: ["Clear explanations"], aiSummary: "Clear expectations set.", createdAt: "2026-02-08" }),
  r({ doctorId: "arjun-verma", communityId: "c-family", listening: "yes", explanation: "somewhat", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Took my father here. Good manner, somewhat busy clinic.", aiThemes: ["Good manner", "Waiting time"], aiSummary: "Good manner; busy clinic.", createdAt: "2026-01-12" }),

  // ---------- Dr. Sunita Patel (Mumbai): 3 Family (3 rec), 1 Friends ----------
  r({ doctorId: "sunita-patel", communityId: "c-family", listening: "yes", explanation: "yes", feesClear: false, waitTime: ">60", wouldRecommend: "yes", writtenExperience: "Never rushes. Worth the long wait, though fee clarity could be better.", aiThemes: ["Unhurried consultations", "Waiting time", "Fee clarity"], aiSummary: "Unhurried; long wait and unclear fees.", createdAt: "2026-07-08" }),
  r({ doctorId: "sunita-patel", communityId: "c-family", listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Felt genuinely heard. Explained everything twice to make sure I understood.", aiThemes: ["Feeling heard", "Clear communication"], aiSummary: "Felt heard; clear explanations.", createdAt: "2026-05-29" }),
  r({ doctorId: "sunita-patel", communityId: "c-family", listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Very reassuring, answers every question.", aiThemes: ["Reassuring manner"], aiSummary: "Reassuring and thorough.", createdAt: "2026-04-10" }),
  r({ doctorId: "sunita-patel", communityId: "c-friends", listening: "yes", explanation: "yes", feesClear: false, waitTime: ">60", wouldRecommend: "maybe", writtenExperience: "Excellent listener, but two hours of waiting is hard to plan around.", aiThemes: ["Feeling heard", "Waiting time"], aiSummary: "Great listener; very long wait.", createdAt: "2026-02-25" }),

  // ---------- Dr. Vikram Nair (Delhi): general only ----------
  r({ doctorId: "vikram-nair", communityId: null, listening: "somewhat", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Structured and to the point. Would have liked more time for questions.", aiThemes: ["Structured consultation", "Limited time for questions"], aiSummary: "Structured; limited question time.", createdAt: "2026-06-25" }),
  r({ doctorId: "vikram-nair", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Clear and efficient. Fees shown clearly.", aiThemes: ["Clear communication", "Transparent fees"], aiSummary: "Clear, efficient, transparent.", createdAt: "2026-04-18" }),
  r({ doctorId: "vikram-nair", communityId: null, listening: "no", explanation: "somewhat", feesClear: true, waitTime: "30-60", wouldRecommend: "no", writtenExperience: "Felt like a very quick visit for the fee.", aiThemes: ["Brief consultation"], aiSummary: "Brief visit relative to fee.", createdAt: "2026-02-14" }),

  // ---------- Dr. Priya Desai (Pune): 2 Workplace (1 rec), 1 general ----------
  r({ doctorId: "priya-desai", communityId: "c-microsoft", listening: "yes", explanation: "yes", feesClear: false, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Friendly, no wait. Some add-on charges were a surprise.", aiThemes: ["Short waits", "Friendly", "Add-on costs"], aiSummary: "Friendly, quick; surprise add-on costs.", createdAt: "2026-06-11" }),
  r({ doctorId: "priya-desai", communityId: "c-microsoft", listening: "somewhat", explanation: "somewhat", feesClear: false, waitTime: "<15", wouldRecommend: "maybe", writtenExperience: "Quick appointment but the final bill was more than quoted.", aiThemes: ["Add-on costs"], aiSummary: "Bill exceeded quote.", createdAt: "2026-04-05" }),
  r({ doctorId: "priya-desai", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Gentle and efficient.", aiThemes: ["Gentle manner", "Short waits"], aiSummary: "Gentle, efficient.", createdAt: "2026-01-27" }),

  // ---------- Dr. Farhan Qureshi (Hyderabad): general only ----------
  r({ doctorId: "farhan-qureshi", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Calm clinic, explained things patiently.", aiThemes: ["Patient explanations", "Calm clinic"], aiSummary: "Calm, patient explanations.", createdAt: "2026-05-15" }),
  r({ doctorId: "farhan-qureshi", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Clear about fees and next steps.", aiThemes: ["Transparent fees", "Clear communication"], aiSummary: "Transparent, clear.", createdAt: "2026-03-20" }),

  // ---------- Dr. Neha Kulkarni (Bangalore GP): 2 NIT (2 rec), 1 Friends ----------
  r({ doctorId: "neha-kulkarni", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "Warm, clear, and fees explained before the consultation.", aiThemes: ["Warm manner", "Clear fees"], aiSummary: "Warm; fees explained first.", createdAt: "2026-07-02" }),
  r({ doctorId: "neha-kulkarni", communityId: "c-nit", listening: "yes", explanation: "yes", feesClear: true, waitTime: "30-60", wouldRecommend: "yes", writtenExperience: "Explained everything in simple language. Some wait.", aiThemes: ["Clear explanations", "Waiting time"], aiSummary: "Clear; some wait.", createdAt: "2026-05-20" }),
  r({ doctorId: "neha-kulkarni", communityId: "c-friends", listening: "yes", explanation: "yes", feesClear: true, waitTime: "15-30", wouldRecommend: "yes", writtenExperience: "My go-to GP recommendation for anyone moving to HSR.", aiThemes: ["Warm manner"], aiSummary: "Strongly recommended by a friend.", createdAt: "2026-03-30" }),

  // ---------- Dr. Sameer Joshi (Bangalore dentist): general only ----------
  r({ doctorId: "sameer-joshi", communityId: null, listening: "yes", explanation: "yes", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Modern clinic, on time.", aiThemes: ["Short waits", "Modern clinic"], aiSummary: "On time, modern.", createdAt: "2026-06-05" }),
  r({ doctorId: "sameer-joshi", communityId: null, listening: "yes", explanation: "somewhat", feesClear: true, waitTime: "<15", wouldRecommend: "yes", writtenExperience: "Quick and painless visit. Fees clear.", aiThemes: ["Short waits", "Transparent fees"], aiSummary: "Quick, clear fees.", createdAt: "2026-04-12" }),
];
