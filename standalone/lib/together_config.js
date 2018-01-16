var TogetherJSConfig_siteName = 'UD Annotatrix';
var TogetherJSConfig_toolName = 'Collaboration';
TogetherJS.config("dontShowClicks", true);
TogetherJS.config("suppressJoinConfirmation", true);

TogetherJS.hub.on("conlluDraw", function (msg) {
    console.log('WORKS');
    if (! msg.sameUrl) {
        return;
    }
    // Removes the previous tree if there is one
    try {cy.destroy()} catch (err) {};
    
    var msgSentence = msg.sentence;
    conlluDraw(msgSentence);
    
    $('#indata').val('' + msgSentence);
    
    var inpSupport = $("<div id='mute'>"
        + "<input type='text' id='edit' class='hidden-input'/></div>");
    $("#cy").prepend(inpSupport);
    
    fitTable();
    showProgress();
    bindCyHandlers();
    saveData();
});