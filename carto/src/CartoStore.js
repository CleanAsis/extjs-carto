Ext.define('Carto.CartoStore',{
    extend: 'Ext.data.Store',
    alias: 'store.carto',
    requires: [
        'Carto.CartoProxy'
    ],

    listeners: {
        filterchange: function(store, filters) {
            var storeConfig    = this.getProxy().getCurrentConfig();
            storeConfig.filter = [];
            filters.forEach(function(item){
                storeConfig.filter.push({
                    operator: (item._operator) ? item._operator : "like", 
                    value: (item._convert) ? item._value.toLocaleDateString() :item._value, 
                    property: item._property
                });
            }.bind(this));
            if(this._subLayer){
                this._subLayer.setSQL(this.sqlBuilder(storeConfig));
            }
        }
    },

    constructor: function(config) {
        var table = config.table;
        if (table) {
            config.select = {
                tables: [table]
            };
            delete config.table;
        }
        this.callParent([config]);
    },

    applySelect: function(select) {
        if (select && !select.isCartoSelect) {
            select = Ext.create('Carto.sql.CartoSelect', select);
        }
        return select;
    },

    proxy: {
        type: 'carto'
    },
    
    remoteFilter: true,
    remoteSort: true,

    config: {
        style: null,
        storeId: null,
        groupBy: null,
        select: null,
        distinct: false,
        applyFilterToLayer: true,
        onlyTiles: false
    },

    addSubLayerToProxy: function(subLayer) {
        this.getProxy().addSubLayer(subLayer, this.autoLoad || this.isLoaded() || this.isLoading());
    },
    
    getSubLayer: function() {
        return this._subLayer;
    },

    destroy: function() {
        var subLayer = this.getSubLayer();
        subLayer.store = null;
        subLayer.remove();
        this.callParent();
    },

    privates: {
        setLoadOptions: function(options) {
            var me = this,
                groupBy = me.getGroupBy(),
                onlyTiles = me.getOnlyTiles(),
                distinct = me.getDistinct();
            if (groupBy) {
                options.groupBy = groupBy;
            }
            if (onlyTiles) {
                options.onlyTiles = true;
            }
            me.callParent([options]);
        }
    }
});