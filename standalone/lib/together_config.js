var TogetherJSConfig_siteName = 'UD Annotatrix';
var TogetherJSConfig_toolName = 'Collaboration';
var TogetherJSConfig_autoStart = true;
var TogetherJSConfig_suppressJoinConfirmation = true;
var TogetherJSConfig_dontShowClicks = true;

TogetherJS.hub.on("conlluDraw", function (msg) {
    if (! msg.sameUrl) {
        return;
    }
    conlluDraw(msg.sentence);
    $("#indata").val(msg.sentence);
    fitTable();
    showProgress();
    updateTable();
});