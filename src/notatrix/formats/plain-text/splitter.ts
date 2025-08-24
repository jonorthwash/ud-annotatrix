import {Options} from "../../nx/options";
import * as re from "../../utils/regex";
import {thin} from "../../utils/funcs";

export function split(text: string, options: Options): string[] {
  options = {trimChunks: true, ...options};

  return text.split(re.sentenceThenPunctuation)
      .map(chunk => {
        if (options.trimChunks) {
          return chunk.trim();
        } else {
          return chunk;
        }
      })
      .filter(thin);
}
