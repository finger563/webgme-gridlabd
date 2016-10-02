/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'text!./HLADecorator.DiagramDesignerWidget.html',
    'css!./HLADecorator.DiagramDesignerWidget.css'
], function (CONSTANTS, nodePropertyNames, DiagramDesignerWidgetDecoratorBase, HLADecoratorTemplate) {

    'use strict';

    var HLADecorator,
        __parent__ = DiagramDesignerWidgetDecoratorBase,
        __parent_proto__ = DiagramDesignerWidgetDecoratorBase.prototype,
        DECORATOR_ID = 'HLADecorator';

    HLADecorator = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.name = '';
        this.type = '';
        this.isInteraction = true;

        this._attributeNames = [];
        this._parameterNames = [];
        this._attributes = {};
        this._parameters = {};
        this._skinParts = {
            $name: undefined,
            $type: undefined,
            $attributesTitle: undefined,
            $parametersTitle: undefined,
            $attributesContainer: undefined,
            $parametersContainer: undefined
        };

        this.logger.debug('HLADecorator ctor');
    };

    _.extend(HLADecorator.prototype, __parent_proto__);
    HLADecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    HLADecorator.prototype.$DOMBase = $(HLADecoratorTemplate);

    HLADecorator.prototype.on_addTo = function () {
        var self = this;

        this._renderContent();

        // set title editable on double-click
        this.skinParts.$name.on('dblclick.editOnDblClick', null, function (event) {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
                $(this).editInPlace({
                    class: '',
                    onChange: function (oldValue, newValue) {
                        self._onNodeTitleChanged(oldValue, newValue);
                    }
                });
            }
            event.stopPropagation();
            event.preventDefault();
        });

        //let the parent decorator class do its job first
        __parent_proto__.on_addTo.apply(this, arguments);
    };

    HLADecorator.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            typeObj = client.getNode(nodeObj.getBaseId()),
            metaObj = client.getNode(nodeObj.getMetaTypeId());

        //render GME-ID in the DOM, for debugging
        this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});

        if (nodeObj) {
            this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
        }
        if(typeObj){
            this.type = typeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
        }
        if(metaObj){
            this.isInteraction = (metaObj.getAttribute(nodePropertyNames.Attributes.name) || '').startsWith('Interaction');
        }

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');
        this.skinParts.$name.text(this.name);
        //find name placeholder
        this.skinParts.$type = this.$el.find('.type');
        this.skinParts.$type.text("<" + this.type + ">");

        this.skinParts.$attributesTitle = this.$el.find('.attributes-title');
        this.skinParts.$parametersTitle = this.$el.find('.parameters-title');
        this.skinParts.$attributesContainer = this.$el.find('.attributes');
        this.skinParts.$parametersContainer = this.$el.find('.parameters');

        if(!this.isInteraction){
            this.skinParts.$parametersTitle.detach();
            this.skinParts.$parametersContainer.detach();
        }else{
            this.skinParts.$attributesTitle.detach();
            this.skinParts.$attributesContainer.detach();
        }        
        
        this.update();
        
    };

    HLADecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);
            if(!nodeObj){
                return;
            }
        var typeObj = client.getNode(nodeObj.getBaseId()),
            newName = '',
            newType = '';

        if (nodeObj) {
            newName = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';

            if (this.name !== newName) {
                this.name = newName;
                this.skinParts.$name.text(this.name);
            }
        }

        if(typeObj){
            newType = typeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
            
            if (this.type !== newType) {
                this.type = newType;
                this.skinParts.$type.text("<" + this.type + ">");
            }
        }

        if(this.isInteraction){
            this._updateList(nodeObj, 'parameters', this.skinParts.$parametersContainer);
        }else{
            this._updateList(nodeObj, 'attributes', this.skinParts.$attributesContainer);
        }

    };

    HLADecorator.prototype._updateList = function(nodeObj, cls, $list){
        var client = this._control._client,
            listLIBase = $('<li/>'),
            entryBase = $('<div class='+cls+'" data-name="__ID__"><span class="n"></span><span class="t"></span></div>');
        
        $list.empty();
        try{
            nodeObj.getChildrenIds().forEach(function(childId){
                var child = client.getNode(childId),
                    name = child.getAttribute(nodePropertyNames.Attributes.name),
                    type = child.getAttribute('ParameterType'),
                    $entry = entryBase.clone();

                $entry.attr({
                    'data-name': name,
                    title: name
                });
                $entry.find('.n').text(name + ':');
                $entry.find('.t').text(type);

                $list.append(
                    listLIBase.clone().append($entry));
            });
        }catch(err){}
    }

    HLADecorator.prototype.getConnectionAreas = function (id /*, isEnd, connectionMetaInfo*/) {
        var result = [],
            edge = 10,
            LEN = 20;

        //by default return the bounding box edge's midpoints

        if (id === undefined || id === this.hostDesignerItem.id) {
            //NORTH
            result.push({
                id: '0',
                x1: edge,
                y1: 0,
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: 0,
                angle1: 270,
                angle2: 270,
                len: LEN
            });

            //EAST
            result.push({
                id: '1',
                x1: this.hostDesignerItem.getWidth(),
                y1: edge,
                x2: this.hostDesignerItem.getWidth(),
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 0,
                angle2: 0,
                len: LEN
            });

            //SOUTH
            result.push({
                id: '2',
                x1: edge,
                y1: this.hostDesignerItem.getHeight(),
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: this.hostDesignerItem.getHeight(),
                angle1: 90,
                angle2: 90,
                len: LEN
            });

            //WEST
            result.push({
                id: '3',
                x1: 0,
                y1: edge,
                x2: 0,
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 180,
                angle2: 180,
                len: LEN
            });
        }

        return result;
    };

    /**** Override from *Widget.DecoratorBase ****/
    /*
     * Specifies the territory rule for the decorator
     * By default the Decorator that displays ports needs to have the children of the node loaded
     * NOTE: can be overridden
     */
    HLADecorator.prototype.getTerritoryQuery = function () {
        var territoryRule = {},
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            client = this._control._client,
            hasAspect = this._aspect && this._aspect !== CONSTANTS.ASPECT_ALL &&
                client.getMetaAspectNames(gmeID).indexOf(this._aspect) !== -1;

        if (hasAspect) {
            territoryRule[gmeID] = client.getAspectTerritoryPattern(gmeID, this._aspect);
            territoryRule[gmeID].children = 1;
        } else {
            territoryRule[gmeID] = {children: 1};
        }

        return territoryRule;
    };


    /**************** EDIT NODE TITLE ************************/

    HLADecorator.prototype._onNodeTitleChanged = function (oldValue, newValue) {
        var client = this._control._client;

        client.setAttributes(this._metaInfo[CONSTANTS.GME_ID], nodePropertyNames.Attributes.name, newValue);
    };

    /**************** END OF - EDIT NODE TITLE ************************/

    HLADecorator.prototype.doSearch = function (searchDesc) {
        var searchText = searchDesc.toString();
        if (this.name && this.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
            return true;
        }

        return false;
    };

    return HLADecorator;
});