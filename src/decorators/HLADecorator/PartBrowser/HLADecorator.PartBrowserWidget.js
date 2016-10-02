/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/HLADecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/HLADecorator.DiagramDesignerWidget.css',
    'css!./HLADecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             HLADecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var HLADecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'HLADecoratorPartBrowserWidget';

    HLADecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.name = "";
        this.isInteraction = false;

        this.logger.debug('HLADecoratorPartBrowserWidget ctor');
    };

    _.extend(HLADecoratorPartBrowserWidget.prototype, __parent__.prototype);
    HLADecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    HLADecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(HLADecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the HLADecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    HLADecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');
        this.skinParts.$attributesTitle = this.$el.find('.attributes-title');
        this.skinParts.$parametersTitle = this.$el.find('.parameters-title');
        this.skinParts.$attributesContainer = this.$el.find('.attributes');
        this.skinParts.$parametersContainer = this.$el.find('.parameters');

        this._renderContent();
    };

    HLADecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    HLADecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            typeObj = client.getNode(nodeObj.getBaseId());

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name);
            this.skinParts.$name.text(this.name || '');
        }

        this.isInteraction = this.name.startsWith('Interaction');

        if(this.isInteraction){
            this.skinParts.$attributesTitle.detach();   
            this.skinParts.$attributesContainer.detach();       
        }else{
            this.skinParts.$parametersTitle.detach();
            this.skinParts.$parametersContainer.detach();
        }

    };

    HLADecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return HLADecoratorPartBrowserWidget;
});