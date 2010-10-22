(function() {
  var Grider;
  Grider = function(table, config) {
    var columns, self;
    self = this;
    self['id'] = table.attr('id');
    self['$table'] = (self['table'] = table);
    self.$table.addClass('griderTable');
    self['config'] = config;
    self['currentCell'] = false;
    self.setRows();
    columns = config.cols || config.columns;
    self.setColumns(columns);
    self.setColAttributes();
    self.setEvents();
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
      self.$table.find(css_sel).css({
        'width': el.width + 'px'
      });
      self.$table.find('tr.griderRow td:nth-child(' + (el.pos + 1) + ')').attr('name', el.name);
      return !!el.editor ? self.$table.find('tr.griderRow td:nth-child(' + (el.pos + 1) + ')').addClass('editable', el.name) : null;
    });
  };
  Grider.prototype.setEvents = function() {
    var self;
    self = this;
    self.$table.find('td.editable').live('click', function(el) {
      return self.startEditor($(this));
    });
    return $('.griderEditor').live('focusout', function() {
      self.hideEditor($(this).attr('data-editor'));
      return $(this).trigger("grider:blur", this);
    });
  };
  Grider.prototype.startEditor = function(cell) {
    var col, self;
    self = this;
    self.currentCell = cell;
    $('.griderEditor').hide();
    col = self.getColumn(cell.attr('name'));
    return self.getOrCreateEditor(col, cell);
  };
  Grider.prototype.getOrCreateEditor = function(col, cell) {
    var editor, funcName, params, pos, self;
    self = this;
    if (!col.editorID) {
      col['editorID'] = self.id + '_' + col.name;
      params = {
        attr: {
          id: col.editorID,
          value: self.getEditorValue(col, cell)
        },
        css: {
          width: (col.width - 3) + 'px',
          position: 'absolute'
        }
      };
      funcName = 'construct' + col.editor[0].toUpperCase() + col.editor.replace(/^[a-z]/, '');
      editor = self[funcName].call(this, params);
      editor.addClass('griderEditor');
    } else {
      editor = $('#' + col.editorID).val(self.getEditorValue(col, cell));
    }
    pos = cell.position();
    return editor.css({
      top: pos.top + 'px',
      left: pos.left + 'px'
    }).show().focus();
  };
  Grider.prototype.getEditorValue = function(col, cell) {
    if (col.editor === 'input') {
      return cell.find('input:text').val();
    } else if (col.editor === 'combo') {
      return cell.find('input:text').val();
    } else {
      return 'otro';
    }
  };
  Grider.prototype.constructInput = function(params) {
    var editor;
    params.attr['type'] = 'text';
    params.attr['data-editor'] = 'input';
    editor = $('<input/>').attr(params.attr).css(params.css);
    $('body').append(editor);
    return editor;
  };
  Grider.prototype.constructCombo = function() {
    return '';
  };
  Grider.prototype.getColumn = function(name) {
    var _i, _len, _ref, _result, col;
    _result = []; _ref = this.columns;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      col = _ref[_i];
      if (col.name === name) {
        return col;
      }
    }
    return _result;
  };
  Grider.prototype.hideEditor = function(editorType) {
    return (editorType === 'input') ? $('.griderEditor').hide() : null;
  };
  $.fn.extend({
    'grider': function(config) {
      return new Grider(this, config);
    }
  });
})();
