# Class to create a simple grid for editing
class Grider
  defaults:
    noEditClass: 'noedit',
    'colWidth': 100
  # Init function
  constructor: (table, config)->
    self = this
    self['id'] = table.attr('id')
    self['$table'] = self['table'] = table
    self.$table.addClass('griderTable')
    self['config'] = config
    self['currentCell'] = false

    self.setRows()
    columns = config.cols || config.columns
    self.setColumns(columns)
    self.setColAttributes()
    self.setEvents()
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
    self.columns = $(columns).map( (i, el)->
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
      self.$table.find('tr.griderRow td:nth-child(' + ( el.pos + 1 ) + ')').attr('name', el.name)
      if !!el.editor
        self.$table.find('tr.griderRow td:nth-child(' + ( el.pos + 1 ) + ')').addClass('editable', el.name)

    )

  # Create events
  setEvents: ->
    self = this
    self.$table.find('td.editable').live('click', (el)->
      self.startEditor($(this))
    )
    $('.griderEditor').live('focusout', ->
      self.hideEditor( $(this).attr('data-editor') )
      $(this).trigger("grider:blur", this)
    )

  # Starts the editor for the clicked cell
  startEditor: (cell)->
    self = this
    self.currentCell = cell
    $('.griderEditor').hide()
    col = self.getColumn( cell.attr('name') )
    self.getOrCreateEditor(col, cell)

  # Creates an editor if none is selected or returns one that was already created
  getOrCreateEditor: (col, cell)->
    self = this
    if !col.editor_id
      col['editor_id'] = self.id + '_' + col.name
      params = {
        attr: { id: col.editor_id, value: self.getEditorValue(col, cell) },
        css: { width: (col.width - 3) + 'px', position: 'absolute' }
      }
      # Calls the function to create the editor
      func_name = 'create' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1)
      editor = self[func_name].call(this, params)
      editor.addClass('griderEditor')
    else if col.editor == 'combo' and !col.editor_grid
      editor = self.createCombo(col)

    func_name = 'show' + col.editor.charAt(0).toUpperCase() + col.editor.substring(1)
    self[func_name].apply(this, [cell, col] )


  # gets the value formated for the editor
  getEditorValue: (col, cell)->
    if col.editor == 'input'
      cell.find('input:text').val()
    else if col.editor == 'combo'
      cell.find('input:text').val()
    else
      'otro'

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
      $(this).parents(".griderEditor").hide()
      self.setComboValue(this)
    )
    .siblings('input:text').css({'width': (col.width - 25) + 'px'})
    .parents("span.ufd").addClass("griderEditor")
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
    editor = $('#' + col.editor_id).parents("span.ufd")
    editor.css({ top: pos.top + 'px', left: pos.left + 'px'}).show()
    editor.find("input:text").focus()
    editor

  # Show for input
  showInput: (cell, col)->
    pos = cell.position()
    editor = $('#' + col.editor_id)
    editor.css({ top: pos.top + 'px', left: pos.left + 'px'}).show().focus()

  # show for date
  showDate: (cell, col)->
    this.showInput(cell, col)

  # show for textarea
  showTextarea: (cell, col)->
    this.showInput(cell, col)

  hideEditor: (editorType)->
    if(editorType == 'input' or editorType == 'textarea')
      $('.griderEditor').hide()

$.fn.extend(
  'grider': (config)->
    new Grider(this, config)
)
