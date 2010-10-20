# Class to create a simple grid for editing
class Grider
  defaults:
    noEditClass: 'noedit',
    'colWidth': 100
  # Init function
  constructor: (table, config)->
    self = this
    self['$table'] = $(table)
    self.$table.addClass('griderTable')
    self['config'] = config

    self.setRows()
    columns = config.cols || config.columns
    self.setColumns(columns)
    self.setColAttributes()
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
    )
  # Creates the editor for each col
  createEditor: ->
    []

$.fn.extend(
  'grider': (config)->
    new Grider(this, config)
)
