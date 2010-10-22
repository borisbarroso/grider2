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
    #console.log(self.columns)

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
        'editor_id': el.editor_id || (new Date()).getTime()
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
    if !col.editorID
      col['editorID'] = self.id + '_' + col.name
      params = {
        attr: { id: col.editorID, value: self.getEditorValue(col, cell) },
        css: { width: (col.width - 3) + 'px', position: 'absolute' }
      }
      funcName = 'construct' + col.editor[0].toUpperCase() + col.editor.replace(/^[a-z]/, '')
      # Calls the function to create the editor
      editor = self[funcName].call(this, params)
      editor.addClass('griderEditor')
    else
      editor = $('#' + col.editorID).val(self.getEditorValue(col, cell))

    pos = cell.position()
    editor.css({ top: pos.top + 'px', left: pos.left + 'px'}).show().focus()

  # gets the value formated for the editor
  getEditorValue: (col, cell)->
    if col.editor == 'input'
      cell.find('input:text').val()
    else if col.editor == 'combo'
      cell.find('input:text').val()
    else
      'otro'

  # Constructs the Input text editor
  constructInput: (params)->
    params.attr['type'] = 'text'
    params.attr['data-editor'] = 'input'

    editor = $('<input/>').attr(params.attr).css(params.css)
    $('body').append(editor)
    editor

  # Constructs the combo editor
  constructCombo: ->
    ''

  # gets the columns with the name
  getColumn: (name)->
    for col in this.columns
      if( col.name == name )
        return col

  hideEditor: (editorType)->
    if(editorType == 'input')
      $('.griderEditor').hide()

$.fn.extend(
  'grider': (config)->
    new Grider(this, config)
)
