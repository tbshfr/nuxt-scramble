import { useRuntimeConfig } from "#app";
import {
  encode,
  decode,
  getAllPatterns,
  createRegex,
  getLinkPrefix,
  normalizePhone,
} from "../utils/scramble";
import type { ScrambleOptions, ScramblePattern } from "../utils/scramble";

export interface UseScrambleReturn {
  encode: (text: string) => string;
  decode: (encoded: string) => string;
  matches: (text: string) => boolean;
  // link prefix is either mailto: tel: or null
  getLinkPrefix: (type: ScramblePattern["name"]) => string | null;
  normalizePhone: (phone: string) => string;
  patterns: ScramblePattern[];
  options: ScrambleOptions;
}

export function useScramble(): UseScrambleReturn {
  const config = useRuntimeConfig();
  const options = config.public.scramble as ScrambleOptions;
  const patterns = getAllPatterns(options);

  function matches(text: string): boolean {
    for (const pattern of patterns) {
      const regex = createRegex(pattern);
      if (regex.test(text)) {
        return true;
      }
    }
    return false;
  }

  return {
    encode: (text: string) => encode(text, options.key),
    decode: (encoded: string) => decode(encoded, options.key),
    matches,
    getLinkPrefix,
    normalizePhone,
    patterns,
    options,
  };
}
