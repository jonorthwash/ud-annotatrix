export {ConverterError} from "./utils/errors";
export {DBError} from "./utils/errors";
export {DetectorError} from "./utils/errors";
export {GeneratorError} from "./utils/errors";
export {NotatrixError} from "./utils/errors";
export {NxError} from "./utils/errors";
export {ParserError} from "./utils/errors";
export {SplitterError} from "./utils/errors";
export {ToolError} from "./utils/errors";

export {Analysis} from "./nx/analysis";
export {BaseToken, ConlluIndex, Cg3Index} from "./nx/base-token";
export {Comment} from "./nx/comment";
export {Corpus, CorpusSerial} from "./nx/corpus";
export {Labeler} from "./nx/labeler";
export {NxBaseClass} from "./nx/base-class";
export {RelationItem, RelationSet} from "./nx/relation-set";
export {RootToken} from "./nx/root-token";
export {Sentence, SentenceSerial} from "./nx/sentence";
export {SubToken} from "./nx/sub-token";
export {Token} from "./nx/token";

export * as constants from "./utils/constants";
export * as errors from "./utils/errors";
export * as formats from "./formats";
export * as funcs from "./utils/funcs";
export * as regex from "./utils/regex";
export {detect, DETECT_BY_NAME as detectAs} from "./detector";
export {GENERATE_BY_NAME as generate} from "./generator";
export {parse, PARSE_BY_NAME as parseAs} from "./parser";
export {split} from "./splitter";

// @ts-ignore: Don't store our data files in the bundle!
import data = require("../data");
export {data};
