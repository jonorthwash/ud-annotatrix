import type {Options} from "./nx/options";
import type {Sentence, SentenceSerial} from "./nx/sentence";

export type Input = string|SentenceSerial|any[];  // :^(

export type DetectOutput = string;
export type Detect = (input: Input, options: Options) => DetectOutput;
export type DetectByName = {[name: string]: Detect};

export type SplitOutput = string[]|void;
export type Split = (text: string, options: Options) => SplitOutput;
export type SplitByName = {[name: string]: Split};

export type ParseOutput = SentenceSerial|void;
export type Parse = (input: Input, options: Options) => ParseOutput;
export type ParseByName = {[name: string]: Parse};

export interface ParamsOutput {
  form: string;
  lemma: string;
  upostag: string;
  xpostag: string;
  feats: string|null|undefined;
  misc: string|null|undefined;
  head: string;
}
export interface GenerateResult<Output> {
  output: Output;
  loss: string[];
}
export type GenerateOutput = GenerateResult<string>|GenerateResult<SentenceSerial>|GenerateResult<Partial<ParamsOutput>[]>|void;  // :^(
export type Generate = (sent: Sentence, options: Options) => GenerateOutput;
export type GenerateByName = {[name: string]: Generate};

interface Format {
  name: string;
  fields: {
    FIELDS: string[];
    HAS_COMMENTS: boolean;
  };
  split: Split;
  detect: Detect;
  parse: Parse;
  generate: Generate;
}
export type FormatByName = {[name: string]: Format};
