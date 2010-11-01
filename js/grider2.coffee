# Class to create a simple grid for editing
class Grider
  defaults:
    noEditClass: 'noedit',
    'colWidth': 100
  # Init function
  constructor: (table, config)->
    config = $.extend({delrow: true, delrowText: 'delete', delrowTitle: 'Delete row'}, config)
    self = this
    self['id'] = table.attr('id')
    self['$table'] = self['table'] = table
    self.$table.addClass('griderTable')
    self['config'] = config
    self['currentCell'] = false

    self.setRows()
    columns = config.cols || config.columns
    self.setColumns(columns)
    self.$table.data('columns', columns)
    self.setColAttributes()
    self.setEvents()
    self.addDelCol() if config.delrow
    #self.createEditors()

  # Set rows for the grid
  setRows: ->
    self = this
    self.$table.find("tr").each((i, el)->
      if(i > 0 && !$(el).hasClass(self.defaults.noEditClass))
        $(el).addClass("griderRow")
    )

  # Set columns for the grid
  setColumns: (columns)->
    self = this
    self['formulas'] = []
    self.columns = $(columns).map( (i, el)->
      self.formulas.push( { name: el.name, formula: el.formula } ) if not not el.formula
      {
        'name': el.name
        'editor': el.editor,
        'editor_id': el.editor_id
        'renderer': el.renderer || 'text',
        'width': el.width || self.defaults.colWidth,
        'pos': el.pos,
        'formula': el.formula || false
        'summary': el.summary || false
      }
    )

  # Sets the col attributes
  setColAttributes: ->
    self = this
    $(self.columns).each((i, el)->
      css_sel = 'tr:first th:eq(' + el.pos + ')'
      self.$table.find(css_sel).css({ 'width': el.width + 'px' })
      self.$table.find('tr.griderRow').find('td:nth-child(' + ( el.pos + 1 ) + ')').attr('data-name', el.name).css('width', el.width + 'px')
      if !!el.editor
        self.$table.find('tr.griderRow').find('td:nth-child(' + ( el.pos + 1 ) + ')').addClass('editable')

    )

  # Create events
  setEvents: ->
    self = this
    self.$table.find('td.editable').live('click', (el)->
      self.startEditor($(this))
    )
    $('.griderEditor').live('focusout', ->
      self.hideEditor( $(this).attr('data-editor') )
      self.setCellValue(this)
      #self.checkFormula()
      self.$table.trigger("grider:editor:blur", self.currentCell)
    )
    self.$table.live( 'addrow' , (el)->
      self.addRow()
    )

  ###
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
  ###

  # Adds col and events for deleting rows
  addDelCol: ->
    self = this
    html = ['<td>', '<a href="javascript:" title="', self.config.delrowTitle ,'" class="delrow">',
      self.config.delrowText, '</a>',  '</td>'].join("")
    self.$table.find('.griderRow').append(html)
    $('#' + self.id + ' .delrow').live('click', ->
      $(this).parents('tr:first').detach() if self.$table.find('tr.griderRow').length > 1
    )

  # sets the value for a cell and the display
  setCellValue: (elem)->
    self = this
    editorType = $(elem).attr("data-editor")
    input = self.currentCell.find("input:text")
    disp = self.currentCell.find(".display")
    if editorType == 'input' or editorType == 'textarea'
      value = $(elem).val()
      input.val(value)
      disp.html(value)
    else if editorType == 'combo'
      select = $('#' + self.getColumn($(self.currentCell).attr("data-name")).editor_id )
      value = select.val()
      input.val( value )
      disp.html( select.ufd("getCurrentTextValue") )
      #$(self.currentCell).data("name")])

  # Starts the editor for the clicked cell
  startEditor: (cell)->
    self = this
    self.currentCell = cell
    $('.griderEditor').hide()
    col = self.getColumn( cell.attr('data-name') )
    self.getOrCreateEditor(col, cell)

  # Creates an editor if none is selected or returns one that was already created
  getOrCreateEditor: (col, cell)->
    self = this
    if !col.editor_id
      col['editor_id'] = self.id + '_' + col.name
      params = {
        attr: { id: col.editor_id, value: cell.find(":text").val() },
        css: { width: (col.width) + 'px', position: 'absolute' }
      }
      # Calls the function to create the editor
      func_name = 'create' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1)
      editor = self[func_name].call(this, params)
      editor.addClass('griderEditor')
    else if col.editor == 'combo' and !col.editor_grid
      editor = self.createCombo(col)

    func_name = 'show' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1)
    self[func_name].apply(this, [cell, col] )

  # Constructs the Input text editor
  createInput: (params)->
    params.attr['type'] = 'text'
    params.attr['data-editor'] = 'input'

    editor = $('<input/>').attr(params.attr).css(params.css)
    $('body').append(editor)
    editor

  # Creates a combo based on ufd the combo editor
  createCombo: (col)->
    self = this
    $('#' + col.editor_id).blur(->
      $(this).parent(".griderEditor").hide()
      self.setComboValue(this)
    )
    .siblings('input:text').css({'width': (col.width - 25) + 'px'})
    .parent("span.ufd").addClass("griderEditor")
    .css({position: 'absolute', width: col.width + 'px' })
    .attr({'data-editor': 'combo'}).show()

  # Creates a date editor
  createDate: (params)->
    this.createInput(params)

  # Creates a textarea editor
  createTextarea: (params)->
    params.attr['data-editor'] = 'textarea'

    editor = $('<textarea/>').attr(params.attr).css(params.css)
    $('body').append(editor)
    editor

  # gets the columns with the name
  getColumn: (name)->
    for col in this.columns
      if( col.name == name )
        return col

  # show for combo
  showCombo: (cell, col)->
    pos = cell.position()
    value = cell.find("input:text").val()
    select = $('#' + col.editor_id)
    select.val(value)
    index = select[0].selectedIndex

    editor = $('#' + col.editor_id).parent("span.ufd")
    editor.css({ top: pos.top + 'px', left: pos.left + 'px'}).show()
    editor.find("input:text").focus()
    li = $('#states').ufd("getDropdownContainer").find("li:eq(" + index + ")")[0]
    $('#states').ufd("setActive", li)
    $('#states').ufd("setInputFromMaster")
    $('#states').ufd("scrollTo")
    editor

  # Show for input
  showInput: (cell, col)->
    pos = cell.position()
    value = cell.find("input:text").val()
    editor = $('#' + col.editor_id)
    editor.css({ top: pos.top + 'px', left: pos.left + 'px'}).val(value).show().focus()

  # show for date
  showDate: (cell, col)->
    this.showInput(cell, col)

  # show for textarea
  showTextarea: (cell, col)->
    this.showInput(cell, col)

  hideEditor: (editorType)->
    if(editorType == 'input' or editorType == 'textarea')
      $('.griderEditor').hide()

  # Adds a new row to the grid
  addRow: ->
    self = this
    tr = self.$table.find(".griderRow").last().clone()
    tr.find(':text').each((i, el)->
      tmp_name = ['[', new Date().getTime() ,']' ].join("")
      $(el).attr('name', el.name.replace(/\[\d\]/, tmp_name ) )
    )
    self.$table.append(tr)

$.fn.extend(
  'grider': (config)->
    new Grider(this, config)
)
