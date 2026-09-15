import mongoose from "mongoose";
import { Institution } from "../models/InstitutionModel";
import { Programme } from "../models/ProgrammeModel";
import dotenv from 'dotenv';

dotenv.config();

const institutions = [
  {
    name: "Ghana Communication Technology University",
    shortName: "GCTU",
    institutionCode: "GCTU",
    email: "info@gctu.edu.gh",
    phone: "+233302221234",
    address: "Tesano, Accra, Ghana",
    website: "https://www.gctu.edu.gh",
    isActive: true,
    programmes: [
      "BSc Computer Science",
      "BSc Information Technology",
      "BSc Telecommunication Engineering",
      "BSc Business Administration",
    ],
  },
  {
    name: "University of Ghana",
    shortName: "UG",
    institutionCode: "UG",
    email: "info@ug.edu.gh",
    phone: "+233302213241",
    address: "Legon, Accra, Ghana",
    website: "https://www.ug.edu.gh",
    isActive: true,
    programmes: [
      "BSc Computer Science",
      "BA Economics",
      "BSc Nursing",
      "LLB Law",
    ],
  },
  {
    name: "University of Professional Studies, Accra",
    shortName: "UPSA",
    institutionCode: "UPSA",
    email: "info@upsa.edu.gh",
    phone: "+233302815616",
    address: "Madina, Accra, Ghana",
    website: "https://www.upsa.edu.gh",
    isActive: true,
    programmes: [
      "BSc Computer Engineering",
      "BSc Architecture",
      "BSc Pharmacy",
      "BA Publishing Studies",
    ],
  },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI is not set");

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  for (const entry of institutions) {
    const { programmes, ...institutionFields } = entry;

    // Upsert institution
    const institution = await Institution.findOneAndUpdate(
      { institutionCode: institutionFields.institutionCode },
      institutionFields,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert programmes scoped to this institution
    for (const programmeName of programmes) {
      await Programme.findOneAndUpdate(
        {
          institution: institution._id,
          name: programmeName,
        },
        {
          institution: institution._id,
          name: programmeName,
          code: programmeName
            .replace(/[^A-Za-z0-9 ]/g, "")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase(),
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `✅ Seeded ${institution.institutionCode} with ${programmes.length} programme(s)`
    );
  }

  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});