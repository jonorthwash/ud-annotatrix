export interface Options {
  allowBookendWhitespace?: boolean;
  allowEmptyList?: boolean;
  allowEmptyString?: boolean;
  allowLeadingWhitespace?: boolean;
  allowMissingLemma?: boolean;
  allowNewlines?: boolean;
  allowNoDependencies?: boolean;
  allowTrailingWhitespace?: boolean;
  allowZeroFields?: boolean;
  allowZeroTokens?: boolean;
  bracketsAllowanceTreshold?: number;
  enhanced?: boolean;
  interpretAs?: string;
  omitIndices?: boolean;
  requireOne?: boolean;
  requireTenParams?: boolean;
  trimChunks?: boolean;
}
