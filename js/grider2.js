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
        'editor_id': el.editor_id,
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
    var editor, func_name, params, self;
    self = this;
    if (!col.editor_id) {
      col['editor_id'] = self.id + '_' + col.name;
      params = {
        attr: {
          id: col.editor_id,
          value: self.getEditorValue(col, cell)
        },
        css: {
          width: (col.width - 3) + 'px',
          position: 'absolute'
        }
      };
      func_name = 'create' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1);
      editor = self[func_name].call(this, params);
      editor.addClass('griderEditor');
    } else if (col.editor === 'combo' && !col.editor_grid) {
      editor = self.createCombo(col);
    }
    func_name = 'show' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1);
    return self[func_name].apply(this, [cell, col]);
  };
  Grider.prototype.getEditorValue = function(col, cell) {
    return col.editor === 'input' ? cell.find('input:text').val() : (col.editor === 'combo' ? cell.find('input:text').val() : 'otro');
  };
  Grider.prototype.createInput = function(params) {
    var editor;
    params.attr['type'] = 'text';
    params.attr['data-editor'] = 'input';
    editor = $('<input/>').attr(params.attr).css(params.css);
    $('body').append(editor);
    return editor;
  };
  Grider.prototype.createCombo = function(col) {
    var self;
    self = this;
    return $('#' + col.editor_id).blur(function() {
      $(this).parent(".griderEditor").hide();
      return self.setComboValue(this);
    }).siblings('input:text').css({
      'width': (col.width - 25) + 'px'
    }).parent("span.ufd").addClass("griderEditor").css({
      position: 'absolute',
      width: col.width + 'px'
    }).attr({
      'data-editor': 'combo'
    }).show();
  };
  Grider.prototype.createDate = function(params) {
    return this.createInput(params);
  };
  Grider.prototype.createTextarea = function(params) {
    var editor;
    params.attr['data-editor'] = 'textarea';
    editor = $('<textarea/>').attr(params.attr).css(params.css);
    $('body').append(editor);
    return editor;
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
  Grider.prototype.showCombo = function(cell, col) {
    var editor, pos;
    pos = cell.position();
    editor = $('#' + col.editor_id).parent("span.ufd");
    editor.css({
      top: pos.top + 'px',
      left: pos.left + 'px'
    }).show();
    editor.find("input:text").focus();
    return editor;
  };
  Grider.prototype.showInput = function(cell, col) {
    var editor, pos;
    pos = cell.position();
    editor = $('#' + col.editor_id);
    return editor.css({
      top: pos.top + 'px',
      left: pos.left + 'px'
    }).show().focus();
  };
  Grider.prototype.showDate = function(cell, col) {
    return this.showInput(cell, col);
  };
  Grider.prototype.showTextarea = function(cell, col) {
    return this.showInput(cell, col);
  };
  Grider.prototype.hideEditor = function(editorType) {
    return (editorType === 'input' || editorType === 'textarea') ? $('.griderEditor').hide() : null;
  };
  $.fn.extend({
    'grider': function(config) {
      return new Grider(this, config);
    }
  });
}).call(this);
