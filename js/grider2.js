(function() {
  var Grider;
  Grider = function(table, config) {
    var columns, self;
    self = this;
    self['$table'] = $(table);
    self['config'] = config;
    self.setRows();
    columns = config.cols || config.columns;
    self.setColumns(columns);
    self.setColAttributes();
    console.log(self.columns);
    return this;
  };
  Grider.prototype.defaults = {
    noEditClass: 'noedit',
    'colWidth': 100
  };
  Grider.prototype.setRows = function() {
    var self;
    self = this;
    return self.$table.find("tr").each(function(i, el) {
      return (i > 0 && !$(el).hasClass(self.defaults.noEditClass)) ? $(el).addClass("griderRow") : null;
    });
  };
  Grider.prototype.setColumns = function(columns) {
    var self;
    self = this;
    return (self.columns = $(columns).map(function(i, el) {
      return {
        'name': el.name,
        'editor': el.editor,
        'editor_id': el.editor_id || (new Date()).getTime(),
        'renderer': el.renderer || 'text',
        'width': el.width || self.defaults.colWidth,
        'pos': el.pos,
        'formula': el.formula || false,
        'summary': el.summary || false
      };
    }));
  };
  Grider.prototype.setColAttributes = function() {
    var self;
    self = this;
    return $(self.columns).each(function(i, el) {
      var css_sel;
      css_sel = 'tr:first th:eq(' + el.pos + ')';
      return self.$table.find(css_sel).css({
        'width': el.width + 'px'
      });
    });
  };
  Grider.prototype.createEditor = function() {
    return [];
  };
  $.fn.extend({
    'grider': function(config) {
      return new Grider(this, config);
    }
  });
})();
