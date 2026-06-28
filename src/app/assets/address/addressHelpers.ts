/**
 * Address helpers – loaded once at module scope.
 *
 * province.json structure:
 * {
 *   "Bắc": { "tỉnh": ["Lào Cai", "Yên Bái", ...] },
 *   "Trung": { "tỉnh": ["Thanh Hóa", ...] },
 *   "Nam": { "tỉnh": ["Bình Phước", ..., "TP. Hồ Chí Minh", ...] }
 * }
 *
 * dvhc.json structure:
 * {
 *   "data": [
 *     {
 *       "level1_id": "01",
 *       "name": "Thành phố Hà Nội",
 *       "type": "Thành phố Trung ương",
 *       "level2s": [
 *         {
 *           "level2_id": "001",
 *           "name": "Quận Ba Đình",
 *           "type": "Quận",
 *           "level3s": [
 *             { "level3_id": "00001", "name": "Phường Phúc Xá", "type": "Phường" },
 *             ...
 *           ]
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 *
 * Mapping: province short name → dvhc province data.
 * Short names like "TP. Hồ Chí Minh", "Hải Phòng", "Hà Nội" are normalized
 * by stripping "Tỉnh ", "Thành phố ", "TP. " prefix, then matched against
 * the dvhc full name (e.g. "Thành phố Hồ Chí Minh").
 *
 * For unaccented search we use a simple ASCII fold.
 */
import provinceData from "./province.json";
import dvhcData from "./dvhc.json";

/* ────────── one-time lookup builder ────────── */

interface Level3 {
  level3_id: string;
  name: string;
  type: string;
}

interface Level2 {
  level2_id: string;
  name: string;
  type: string;
  level3s: Level3[];
}

interface ProvinceEntry {
  level1_id: string;
  name: string;
  type: string;
  level2s: Level2[];
}

/** Normalise a province name for matching: strip prefix, trim, lowercase. */
function stripPrefix(name: string): string {
  return name
    .replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.?)\s*/i, "")
    .trim()
    .toLowerCase();
}

/** Minimal ASCII fold for Vietnamese search (covers most common cases). */
export function fold(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

type ProvinceMap = Record<string, ProvinceEntry>;

const dvhcEntries: ProvinceEntry[] = (dvhcData as { data: ProvinceEntry[] }).data;

/**
 * Build a mapping from short province name → dvhc ProvinceEntry.
 * Keys are the normalised short names as they appear in province.json.
 */
function buildProvinceMap(): ProvinceMap {
  const map: ProvinceMap = {};

  // Collect all short names from province.json grouped by region.
  const shortNames: string[] = [];
  const regions = provinceData as Record<string, { tỉnh: string[] }>;
  for (const regionKey of Object.keys(regions)) {
    const region = regions[regionKey];
    if (region && Array.isArray(region.tỉnh)) {
      for (const name of region.tỉnh) {
        shortNames.push(name);
      }
    }
  }

  // Build reverse index from dvhc: normalised dvhc name → entry
  const dvhcIndex: Record<string, ProvinceEntry> = {};
  for (const entry of dvhcEntries) {
    dvhcIndex[stripPrefix(entry.name)] = entry;
  }

  // Special case: "Hòa Bình" in province.json vs "Hoà Bình" in dvhc.json
  // Normalise the key by removing accents entirely for lookup.
  const dvhcFolded: Record<string, ProvinceEntry> = {};
  for (const entry of dvhcEntries) {
    dvhcFolded[fold(stripPrefix(entry.name))] = entry;
  }

  for (const sn of shortNames) {
    const key = stripPrefix(sn);
    // Try exact key first
    let entry = dvhcIndex[key];
    // Fallback: folded match
    if (!entry) {
      entry = dvhcFolded[fold(key)] ?? null;
    }
    if (entry) {
      map[sn] = entry;
    }
  }

  return map;
}

const provinceMap: ProvinceMap = buildProvinceMap();

/* ────────── exported helpers ────────── */

export interface ProvinceOption {
  shortName: string; // from province.json (e.g. "TP. Hồ Chí Minh")
  fullName: string;  // from dvhc.json   (e.g. "Thành phố Hồ Chí Minh")
  entry: ProvinceEntry;
}

/** All provinces sorted alphabetically by short name. */
export function getAllProvinces(): ProvinceOption[] {
  return Object.keys(provinceMap)
    .sort((a, b) => a.localeCompare(b, "vi"))
    .map((shortName) => ({
      shortName,
      fullName: provinceMap[shortName].name,
      entry: provinceMap[shortName],
    }));
}

/**
 * Get districts for a province short name.
 * Returns empty array if province not found (handles fallback gracefully).
 */
export function getDistricts(provinceShortName: string): Level2[] {
  const entry = provinceMap[provinceShortName];
  if (!entry) return [];
  return entry.level2s;
}

/**
 * Get wards for a district by its full name (e.g. "Quận Ba Đình").
 * Returns empty array if district not found.
 */
export function getWards(districtName: string, provinceShortName: string): Level3[] {
  const entry = provinceMap[provinceShortName];
  if (!entry) return [];
  const district = entry.level2s.find(
    (d) => d.name === districtName
  );
  if (!district) return [];
  return district.level3s;
}

/**
 * Resolve a province short name from a dvhc full name.
 * Used when editing an existing address that stores the dvhc full name.
 */
export function findProvinceShortName(dvhcFullName: string): string | null {
  const key = stripPrefix(dvhcFullName);
  for (const [shortName, entry] of Object.entries(provinceMap)) {
    if (stripPrefix(entry.name) === key) return shortName;
    // Folded fallback
    if (fold(stripPrefix(entry.name)) === fold(key)) return shortName;
  }
  return null;
}