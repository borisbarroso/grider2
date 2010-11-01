(function() {
  var Grider;
  Grider = function(table, config) {
    var columns, self;
    config = $.extend({
      delrow: true,
      delrowText: 'delete',
      delrowTitle: 'Delete row'
    }, config);
    self = this;
    self['id'] = table.attr('id');
    self['$table'] = (self['table'] = table);
    self.$table.addClass('griderTable');
    self['config'] = config;
    self['currentCell'] = false;
    self.setRows();
    columns = config.cols || config.columns;
    self.setColumns(columns);
    self.$table.data('columns', columns);
    self.setColAttributes();
    self.setEvents();
    if (config.delrow) {
      self.addDelCol();
    }
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
    self['formulas'] = [];
    return (self.columns = $(columns).map(function(i, el) {
      if (!!el.formula) {
        self.formulas.push({
          name: el.name,
          formula: el.formula
        });
      }
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
      self.$table.find('tr.griderRow').find('td:nth-child(' + (el.pos + 1) + ')').attr('data-name', el.name).css('width', el.width + 'px');
      return !!el.editor ? self.$table.find('tr.griderRow').find('td:nth-child(' + (el.pos + 1) + ')').addClass('editable') : null;
    });
  };
  Grider.prototype.setEvents = function() {
    var self;
    self = this;
    self.$table.find('td.editable').live('click', function(el) {
      return self.startEditor($(this));
    });
    $('.griderEditor').live('focusout', function() {
      self.hideEditor($(this).attr('data-editor'));
      self.setCellValue(this);
      return self.$table.trigger("grider:editor:blur", self.currentCell);
    });
    return self.$table.live('addrow', function(el) {
      return self.addRow();
    });
  };
  /*
  # check if the current cell triggers a formula
  checkFormula: ->
    name = self.currentCell.attr('data-name')
    for formula in self.formulas
      reg = new RegExp('\\b'+ col.name +'\\b')
      calculateFormula(formula.name, formula.formula) if formula.formula.match(reg)

  # calculates the formula
  calculateFormula: (col, formula)->
    self = this
    tr = self.currentCell.parents("tr:first")
    #
  */
  Grider.prototype.addDelCol = function() {
    var html, self;
    self = this;
    html = ['<td>', '<a href="javascript:" title="', self.config.delrowTitle, '" class="delrow">', self.config.delrowText, '</a>', '</td>'].join("");
    self.$table.find('.griderRow').append(html);
    return $('#' + self.id + ' .delrow').live('click', function() {
      return self.$table.find('tr.griderRow').length > 1 ? $(this).parents('tr:first').detach() : null;
    });
  };
  Grider.prototype.setCellValue = function(elem) {
    var disp, editorType, input, select, self, value;
    self = this;
    editorType = $(elem).attr("data-editor");
    input = self.currentCell.find("input:text");
    disp = self.currentCell.find(".display");
    if (editorType === 'input' || editorType === 'textarea') {
      value = $(elem).val();
      input.val(value);
      return disp.html(value);
    } else if (editorType === 'combo') {
      select = $('#' + self.getColumn($(self.currentCell).attr("data-name")).editor_id);
      value = select.val();
      input.val(value);
      return disp.html(select.ufd("getCurrentTextValue"));
    }
  };
  Grider.prototype.startEditor = function(cell) {
    var col, self;
    self = this;
    self.currentCell = cell;
    $('.griderEditor').hide();
    col = self.getColumn(cell.attr('data-name'));
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
          value: cell.find(":text").val()
        },
        css: {
          width: (col.width) + 'px',
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
    var editor, index, li, pos, select, value;
    pos = cell.position();
    value = cell.find("input:text").val();
    select = $('#' + col.editor_id);
    select.val(value);
    index = select[0].selectedIndex;
    editor = $('#' + col.editor_id).parent("span.ufd");
    editor.css({
      top: pos.top + 'px',
      left: pos.left + 'px'
    }).show();
    editor.find("input:text").focus();
    li = $('#states').ufd("getDropdownContainer").find("li:eq(" + index + ")")[0];
    $('#states').ufd("setActive", li);
    $('#states').ufd("setInputFromMaster");
    $('#states').ufd("scrollTo");
    return editor;
  };
  Grider.prototype.showInput = function(cell, col) {
    var editor, pos, value;
    pos = cell.position();
    value = cell.find("input:text").val();
    editor = $('#' + col.editor_id);
    return editor.css({
      top: pos.top + 'px',
      left: pos.left + 'px'
    }).val(value).show().focus();
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
  Grider.prototype.addRow = function() {
    var self, tr;
    self = this;
    tr = self.$table.find(".griderRow").last().clone();
    tr.find(':text').each(function(i, el) {
      var tmp_name;
      tmp_name = ['[', new Date().getTime(), ']'].join("");
      return $(el).attr('name', el.name.replace(/\[\d\]/, tmp_name));
    });
    return self.$table.append(tr);
  };
  $.fn.extend({
    'grider': function(config) {
      return new Grider(this, config);
    }
  });
}).call(this);
