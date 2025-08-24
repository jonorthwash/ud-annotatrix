// external format tools first
require("./splitter");
require("./detector");
require("./parser");

// then internal stuff
require("./relation-sets");
require("./sentence");
require("./merge");
require("./combine");
require("./split");

// then externalizers
require("./generator");
require("./loss");

// then editing stuff
require("./enhance");
require("./setEmpty");

// integration
require("./examples");
