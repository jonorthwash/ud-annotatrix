import {Options} from "../../nx/options";
import {SplitterError} from "../../utils/errors";

export function split(text: string, options: Options): void {
  throw new SplitterError("Can't split notatrix serial", text, options);
}
