/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/HLADecorator.DiagramDesignerWidget',
    './PartBrowser/HLADecorator.PartBrowserWidget'
], function (DecoratorBase, HLADecoratorDiagramDesignerWidget, HLADecoratorPartBrowserWidget) {

    'use strict';

    var HLADecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'HLADecorator';

    HLADecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('HLADecorator ctor');
    };

    _.extend(HLADecorator.prototype, __parent_proto__);
    HLADecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    HLADecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: HLADecoratorDiagramDesignerWidget,
            PartBrowser: HLADecoratorPartBrowserWidget
        };
    };

    return HLADecorator;
});