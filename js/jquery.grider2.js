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
      'selectedCellClass': 'selected',
      'noEditClass': 'noEdit'
    }

    defaults = $.extend(defaults, config);

    var columns = {};
    ret['columns'] = columns;

    /**
     * Constructor function
     */
    function init() {
      $table.addClass("grider");
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
        var hash = {'pos': i, 'width': parseInt( $(el).css("width") ) || $(el).width()} ;

        // set the editor
        var editor = $(el).attr("editor");
        if(editor != null && editor != undefined) {
          hash['editor'] = editor;
          $table.find("td:nth-child(" + (i + 1) + ")").addClass("editable").attr("col", col).css({'width': hash.width + 'px'});
          $editor = $('#' + editor);

          if( $editor.length <= 0)
            throw('You need to create an editor:"' +  + '" for the column "' + col + '"');
          //else {
            //$editor.hide().css("position", "absolute");
            //$editor.find("input:text, textarea, select").css("width", hash.width);
          //}
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
        var editor = columns[$(this).attr("col")].editor;
        $('#' + editor).trigger("hide");//, [getCellValue(this)]);
      }).live("click", function(e) {
        var editor = columns[$(this).attr("col")].editor;
        $('#' + editor).trigger("show", [this, getCellValue(this)]);
      });

      // Tabl events
      $table.bind({
        'addRow': function() {
            addNewRow();
        }
      });

    }

    /**
     * Returns the value inside a custom input
     * @param DOM TD
     * @return String
     */
    function getCellValue(node) {
      return $(node).find("input:text").val();
    }

    /**
     * Creates the editor based on the attribute "type" from the editor
     */
    function createEditors() {
      for(var k in columns) {
        if(columns[k].editor) {
          var $containerEditor = $('#' + columns[k].editor);
          var editorID = columns[k].editor;
          var dataEditor = $containerEditor.attr("data-editor");
          /*if(dataEditor == undefined || dataEditor == null)
            throw("You must set the type for editor: " + editorID);
          */
          var evalText = 'new ' + $containerEditor.attr("data-editor") + '("' + editorID + '", ' + columns[k].width+ ')';
          try{
            columns[k]['editorObject'] = eval(evalText);
          }catch(e) {
            throw("there is not a class:" + $containerEditor.attr("data-editor") + " for editor: " + editorID + "; Line 124");
          }
          setEditorEvent($containerEditor);
        }
      }

      $(document).keyup(function(e) { navigateCells(e) });
    }

    /**
     * Sets the event t listen from a editor
     */
    function setEditorEvent(editor) {
      $(editor).bind({
        ////
        // Event excuted when pressend ENTER
        // @param Event e
        // @param String value // the value stored in the input:text field
        // @param String rendered // The format in whick the text has to be presented
        // @param DOM placeholder // Original cell send to the editor
        'enter': function(e, value, rendered, placeholder){ 
          setValueAndText(value, rendered, placeholder);
        },
        'tab': function(e, value, rendered, placeholder) {
          setValueAndText(value, rendered);
          changeToNextField(e);
        }
      });
    }

    /**
     * Sets the value and text for the current cell
     * @param String value
     * @param String rendered
     * @param String dataNameFormat
     * @param DOM placeholder
     */
    function setValueAndText(value, rendered, placeholder) {
      var selected = $(placeholder || $sel);
      var input = selected.find("input:text");
      $(input).val(value);
      selected.find("span.displayFormat").html(rendered);
    }

    /**
     * Changes to the next field
     * @param Event e
     */
    function changeToNextField(e) {
      $sel = $sel.next("td.editable");
      if($sel.length  < 1) {
        $sel = $sel.parent("tr.griderRow").siblings("tr:first").find("td.editable:first");
      }
      setSelectedCell($sel);
      $sel.trigger("click");
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
      if($("div.griderEditor[style*=block]").length > 0)
        return false;

      var $td = $table.find('.' + defaults.selectedCellClass);
      var col = $td.attr("col");
      switch(e.keyCode) {
        case $.ui.keyCode.DOWN:
          //console.log($td);
          setSelectedCell($td.parent("tr:first").next().find('td[col=' + col + ']') );
        break;
        case $.ui.keyCode.UP:
          setSelectedCell($td.parent("tr").previous().find('td[col=' + col + ']') );
        break;
        case $.ui.keyCode.LEFT:
          //console.log("left");
        break;
        case $.ui.keyCode.RIGHT:
          //console.log("right");
        break;
      }
    }

    /**
     * Set the row number
     */
    function setRows() {
      $table.find("tr").each(function(i, el) {
        $(el).attr("row", i);
        if(i > 0 && !$(el).hasClass(defaults.noEditClass)) {
          $(el).addClass("griderRow");
        }
      });
    }
    
    /**
     * Adds a new line
     */
    function addNewRow() {
      var tr = $table.find("tr.griderRow:first").clone();
      var name = ["[", new Date().getTime(), "]"].join("");
      tr.find("input:text").each(function(i, el) {
        name = $(el).attr("name").replace(/\[\d+\]/, name);
        $(el).attr("name", name);
      });
      $table.find("tr.griderRow:last").after(tr);
    }

    /**
     * Deletes a row
     */
    function deleteRow(tr) {
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
