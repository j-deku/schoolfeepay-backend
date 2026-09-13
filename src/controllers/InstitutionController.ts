import { Request, Response } from "express";
import { Institution } from "../models/InstitutionModel";
import { Programme } from "../models/ProgrammeModel";

// ==============================
// GET INSTITUTIONS + PROGRAMMES
// ==============================
// Powers the Register page's Institution/Programme dropdowns.

export const getInstitutions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const institutions = await Institution.find({ isActive: true })
      .select("name shortName institutionCode logo")
      .sort({ name: 1 });

    const programmes = await Programme.find({ isActive: true }).select(
      "institution name code"
    );

    const programmesByInstitution = programmes.reduce<
      Record<string, { name: string; code: string }[]>
    >((acc, programme) => {
      const key = programme.institution.toString();

      if (!acc[key]) acc[key] = [];

      acc[key].push({ name: programme.name, code: programme.code });

      return acc;
    }, {});

    const payload = institutions.map((institution) => ({
      code: institution.institutionCode,
      name: institution.name,
      shortName: institution.shortName,
      logo: institution.logo,
      programmes: programmesByInstitution[institution._id.toString()] ?? [],
    }));

    res.status(200).json({
      success: true,
      institutions: payload,
    });
  } catch (error) {
    console.error("Fetch institutions error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load institutions at this time.",
    });
  }
};