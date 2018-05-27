'use strict';

function updateGraph() {
    log.critical(`called updateGraph()`);

    convert2Conllu();

    _.graph_options.layout = {
        name: 'tree',
        padding: 0,
        nodeDimensionsIncludeLabels: false,
        cols: (_.is_vertical ? 2 : undefined),
        rows: (_.is_vertical ? undefined : 2),
        sort: (_.is_vertical ? vertAlSort
            : _.is_ltr ? simpleIdSorting : rtlSorting )
    };
    _.graph_options.layout = { name: 'random' };
    _.graph_options.elements = _.graph( getGraphElements() );

    console.log(_.graph_options);
    window.cy = cytoscape(_.graph_options);

    cy.minZoom(0.1)
        .maxZoom(10.0)
        .fit()
        .center()
        .zoom();

    return;

    /*
    // zooming, fitting, centering
    cy.minZoom(0.1);
    cy.maxZoom(10.0);
    cy.fit();
    const zoom = cy.zoom();
    CURRENT_ZOOM = (zoom >= 1.7 ? 1.7 : zoom <= 0.7 ? 0.7 : zoom); // pick a reasonable zoom level
    cy.zoom(CURRENT_ZOOM);
    cy.center();

    // bind pan event
    cy.on('pan', () => {

        log.debug(`called cy->onPan(): (old) CURRENT_PAN: ${JSON.stringify(CURRENT_PAN)}`);
        CURRENT_PAN = window.cy.pan();

    });
    cy.pan(CURRENT_PAN);

    // bind some window-level events
    $(window)
        .resize(() => {

            // change browser window size
            log.debug(`called window->resize()`);

            cy.fit();
            cy.resize();
            cy.reset();

            CURRENT_ZOOM = cy.zoom(); // Get the current zoom factor

            if (!IS_VERTICAL)
                $('#cy').css('height', $(window).height()-$('.inarea').height()-80);

            cy.pan(CURRENT_PAN);

        }).bind('DOMMouseScroll wheel mousewheel', (e) => { // different browsers have different events

            const delta = (-e.originalEvent.wheelDelta || e.originalEvent.detail || e.originalEvent.deltaY);
            log.debug(`called window->wheel(delta: ${delta}, shift: ${e.shiftKey})`);

            if (e.shiftKey) {
                CURRENT_ZOOM += (delta < 0 ? 1 : -1) * SCROLL_ZOOM_INCREMENT;
                cy.zoom(CURRENT_ZOOM);
                cy.center();
            } else {
                cy.pan(CURRENT_PAN);
            }

        });

    return window.cy;*/
}
