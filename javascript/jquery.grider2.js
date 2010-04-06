/**
 * jQuery grider
 * Versión 2.0
 * @author: Boris Barroso Camberos
 * @email: boriscyber@gmail.com
 * @license
 */

(function($) {
  $.fn.extend({
    'grider': function(config, renderOptions) {
      var grids = [];
      return new Grider(this, config, renderOptions);
    }
  });

  /**
   * Constructor
   * @param DOM div
   * @param Object config
   * @param Object renderOptions
   */
  function Grider(table, config, renderOptions) {

    // Variable that helps to set which variables or functions should return
    var ret = {};

    var $table = $(table);
    // Global selected cell variable
    var $sel;
    // settings
    var defaults = {
      'selectedCellClass': 'selected'
    };

    defaults = $.extend(defaults, config);

    var columns = {};
    ret['columns'] = columns;

    // const
    
    // private

    /**
     * Constructor function
     */
    function init() {
      setRows();
      setColumns();
      setGridEvents();
      createEditors();
    }

    /**
     * Defines columns and positions
     */
    function setColumns() {
      $table.find("tr:first th").each(function(i, el) {
        var col = $(el).attr("col");
        if(col == null || col == undefined) {
          col = (new Date()).getTime();
        }
        var hash = {'pos': i, 'width': $(el).width()};

        // set the editor
        var editor = $(el).attr("editor");
        if(editor != null && editor != undefined) {
          hash['editor'] = editor;
          $table.find("td:nth-child(" + (i + 1) + ")").addClass("editable").attr("col", col);
          $editor = $('#' + editor);

          if( $editor.length <= 0)
            throw('You need to create an editor:"' +  + '" for the column "' + col + '"');
          else {
            $editor.hide().css("position", "absolute");
            $editor.find("input:text, textarea, select").css("width", hash.width);
          }
        }else{
          $table.find("td:nth-child(" + (i + 1) + ")").attr("col", col);
        }
        
        columns[col] = hash;

      });
    }

    /**
     * Set the event for the grid
     */
    function setGridEvents() {
      $table.find("td.editable").live("mousedown", function() {
        $sel = $(this);
        setSelectedCell($sel);
      }).live("click", function(e) {
        var editor = columns[$(this).attr("col")].editor;
        $('#' + editor).trigger("focus", [this, 33]); // Should return value form the cell if it has one
      });

    }

    /**
     * Creates the editor based on the attribute "type" from the editor
     */
    function createEditors() {
      for(var k in columns) {
        if(columns[k].editor) {
          var $divEditor = $('#' + columns[k].editor);
          var editorID = columns[k].editor;
          var evalText = 'new ' + $divEditor.attr("type") + '("' + editorID + '")';
          columns[k]['editorObject'] = eval(evalText);
          setEditorEvent($divEditor);
        }
      }

      $(document).keyup(function(e) { navigateCells(e) });
    }

    /**
     * Sets the event t listen from a editor
     */
    function setEditorEvent(editor) {
      $(editor).bind({
        'execute': function() { console.log(arguments); },
        'tab': function(e, value, text) {
          setValueText(value, text);
          changeToNextField();
        }
      });
    }

    /**
     * Sets the value and text for the current cell
     */
    function setValueText(value, text) {
      $('div', {
          'innerHTML': value,
       });
      $sel.html(value);
    }

    /**
     * Changes to the next field
     */
    function changeToNextField() {
      console.log($sel.next() ); ///////////
    }

    /**
     * set the current TD cell
     * @param DOM cell
     */
    function setSelectedCell(cell) {
        $('.' + defaults.selectedCellClass).removeClass(defaults.selectedCellClass);
        $(cell).addClass(defaults.selectedCellClass);
    }

    /**
     * Set Editor positions
     */

    /**
     * Funcion to navigate through cells
     */
    function navigateCells(e) {
      if($(".griderEditor[style*=block]").length > 0)
        return false;

      var $td = $table.find('.' + defaults.selectedCellClass);
      var col = $td.attr("col");
      switch(e.keyCode) {
        case $.ui.keyCode.DOWN:
          console.log($td);
          setSelectedCell($td.parent("tr:first").next().find('td[col=' + col + ']') );
        break;
        case $.ui.keyCode.UP:
          setSelectedCell($td.parent("tr").previous().find('td[col=' + col + ']') );
        break;
        case $.ui.keyCode.LEFT:
          console.log("left");
        break;
        case $.ui.keyCode.RIGHT:
          console.log("right");
        break;
      }
    }

    /**
     * Set the row number
     */
    function setRows() {
      $table.find("tr").each(function(i, el) {
        $(el).attr("row", i);
      });
    }


    /******************************************************
     * List of funtions used to render the display
     */
    var renderers = {
      dateRenderer: function(val) {
      },
      percentageRenderer: function(val) {
      }
    }
    
    // Override defaults
    renderers = $.extend(renderers, renderOptions);

    defaults = $.extend(defaults, config);

    init();

    // Sets all the functions that will be available
    return ret;

  }
   
 })(jQuery)
/*
*/
