/**
 * jQuery grider
 * Versión 2.0
 * @author: Boris Barroso Camberos
 * @email: boriscyber@gmail.com
 * @license
 */

(function($) {
  $.fn.extend({
    'grider': function(config) {
      return this.each(function() {
        new $.Grider(this, config);
      });
    }
  });

  /**
   * Constructor
   * @param DOM div
   * @param Object config
   */
  $.Grider = function(div, config) {
    this.defaults = $.extend(Grider.defaults, config);

    this.$div = $(div);
    this.$table = this.$div.find("table:first");
    if(this.$table.length <= 0)
      throw(this.defaults.errors.tableTagName + ': on line 29' );
    // Add the class to the table
    this.$table.addClass(this.defaults.griderTableClass);

    this.$div.find("div.grider-control").hide().css({'position': 'absolute'});
    // set the Fields
    this.setFields();
    // set the controls for editing
    this.setControls();
    // set the Events
    this.setEvents();

    console.log(this);////////////////////
  }

  $.Grider.prototype = {
    '$div': '',
    '$table': '',
    'fields': {},
    /**
     * Atributes for each name
     * @param name: Indicates the name of the column
     * @param summary: Indicates the summary type for the column 
     *   "min": minimun value in the column, 
     *   "max": maximun value in the column, 
     *   "sum": sum the column,
     *   "avg": average value of the column
     * @param numerate: Indicates if the column is for numeration
     * @param formula: Indicates the formula that should be applied to the column
     */
    'thAttributes': ["name", "summary", "numerate", "formula"],
    /**
     * Object where all data is stored
     */
    'data': {},
    '':'',
    /**
     * Set the fields according to thAtributes
     */
    'setFields': function() {
      var self = this;
      this.$table.find("tr:first th").each(function(i, el) {
        var name;

        $(self.thAttributes).each(function(j, elem) {
          var attr = $(el).attr(elem);

          if(elem == "name" && attr != undefined) {
            var w = $(el).width() + 7;
            self.fields[attr] = {'pos': i, 'name': attr, 'width': w };
            var pos = i + 1;
            self.$table.find('tr td:nth-child(' + pos + ')').attr('name', attr);
            name = attr;
          }else if(attr != undefined) {
            self.fields[name][elem] = attr;
          }else if(attr == undefined && elem == "name" ) {
            // Create a name
            var tmpName = new Date().getTime();
            $(el).attr("name", tmpName);
            var w = $(el).width() + 7;
            self.fields[tmpName] = {'pos': i, 'name': tmpName, 'width': w}
            var pos = i + 1;
            self.$table.find('tr td:nth-child(' + pos + ')').attr('name', tmpName);
          }
        });
      });
    },
    /**
     * Defines the controls that are editable
     */
    'setControls': function() {
      var self = this;
      this.$div.find("div.grider-control").each(function(i, el) {
        var name = $(el).attr("name");
        var control = $(el).find("input, select, textarea");
        self.fields[name]['editable'] = true;
        var pos = self.fields[name].pos + 1;
        self.$table.find('tr td:nth-child(' + pos + ')').addClass(self.defaults.tdEditableClass);
      });
    },
    /**
     * Sets the events for the cells that have a class
     */
    'setEvents': function() {
    }
  }

  Grider = {};
  $.extend(Grider, {'defaults':
    {
      'griderTableClass': 'grider-table',
      'tdEditableClass': 'editable',
      'errors': {
        'tableTagName': 'The selected item must be a Table'
      }

    }
  });
  
 })(jQuery)
