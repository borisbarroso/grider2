
/**
 * For select fields with autocomplete
 */
ComboEditor = TextEditor.extend({
  'type': 'input:text',
  'originalEditorWidth': null,
  'isFocus': false, // Indicates if it has been focused
  'combo': null,
  'comboID': null,
  'currentValue': null,
  'editorChanged': false,
  'editorID': null,
  'blurTimeOut': 200, // Timeout before it hides
  'placeholder': null,
  /**
   * constructor
   */
  'init': function(id, width) {
    this.id = '#' + id;
    this.container = $(this.id);
    this.container.addClass(this.containerCSS).css({'position':'absolute'}).hide();
    this.editor = this.container.find('select');
    this.editorID = this.editor.attr("id");
    this.originalEditorWidth = this.editor.width();
    this.setEditorSize(width);
    // ufd
    this.editor.ufd({'skin': 'plain'});//{'allowLR': true});
    this.comboID = this.editorID + "_ufd";
    this.combo = $('#' + this.comboID);
    //$('#ufd-container ul:last').css({'width', this.originalEditorWidth + 'px'});
    this.setEvents();
  },
  /**
   * Sets the editor container width
   */
  'setContainerWidth': function(width) {
    this.container.css({'position': 'absolute', 'width': width + 'px'});
  },
  /**
   * function that sets the events for the class
   */
  'setEvents': function() {
    var base = this;
    ////
    // container events
    this.container.bind({
      ////
      // Actives when focus
      'show': function(e, placeholder, value) {
        base.stopEvent(e);
        if(base.isFocus) return false;

        base.setEditorValue(value);
        $('.griderEditor').hide();
        base.placeholder = placeholder;
        var pos = $(placeholder).position();
        base.container.css({'left':pos.left, 'top':pos.top}).show();
        base.setEditorFocus();
        /***
         * REVIEW THIS CODE TO WORK WITH IE, GOOGLE CHROME
         *
         */
        // To set the correct value
        setTimeout(function() {
          $('#' + base.editorID).ufd('inputFocus'); 
          var index = $('#' + base.editorID + ' option[value=' + value + ']').index();
          var list = $('div.list-wrapper', '#ufd-container').not("div.invisible").find("ul");
          $('#' + base.editorID).ufd('setActive', list.find("li:eq(" + index + ")") );
          //console.log(list.find("li.active"));
          var li = list.find("li[name="+index+"]").addClass("active");
        }, 100);
        this.isFocus = true;
      },
      'hide': function() {
        base.isFocus = false;
        base.container.hide();
      }
    });

    // Editor events
    this.editor.bind({
      'change': function(e) {
        base.editorChanged = true;
        base.stopEvent(e)
      }
    });

// $('#ufd-container div.list-wrapper').not(".invisible");
    ////
    // Editor events
    this.combo.bind({
      ////
      // set all the events for keys
      'keydown': function(e) {
        base.setKeyEvents(e);
        if(e.keyCode == jQuery.ui.keyCode.TAB) {
          e.stopPropagation();
          return false;
        }
      },
      'keyup': function(e) {
        e.stopPropagation();
      },
      'blur': function(e) {
        base.editorChanged = false;
        // timeOut
        setTimeout(function() {
          if(!base.editorChanged) {
            base.container.hide();
            base.container.trigger("enter", [base.getValue(), base.renderer(), base.placeholder] );
            //base.isFocus = false;
          }
        }, base.blurTimeOut);
      }
    });
  },
  /**
   * Sets the key events for the input:text
   */
  'setKeyEvents': function(e) {
    switch(e.keyCode){
      case jQuery.ui.keyCode.TAB:
        this.container.trigger("tab", [this.getValue(), this.renderer(), this.placeholder] );
        this.isFocus = false;
        this.container.hide();
      break;
      case jQuery.ui.keyCode.ENTER:
        this.container.trigger("enter", [this.getValue(), this.renderer(), this.placeholder] );
      break;
      case jQuery.ui.keyCode.ESCAPE:
        $('#' + this.editorID).ufd("hideList"); // hide ufd list
        this.container.hide();
      break;
    }
  },
  'setEditorValue': function(value) {
    this.editor.val(value).trigger("change");
  },
  /**
   * Gets the value from the current editor
   */
  'getValue': function() {
    return this.editor.val();
  },
  /**
   * Function that renders the values of the editor
   */
  'renderer': function() {
    return this.editor.find("option[value=" + this.editor.val() + "]").text();
  },
  /**
   * Stops the events, bubbling
   */
	'stopEvent': function(e) {
		e = e ? e : window.event;
		e.cancel = true;
		e.cancelBubble = true;
		e.returnValue = false;
		if (e.stopPropagation) {e.stopPropagation(); }
		if( e.preventDefault ) { e.preventDefault(); }
	},
});
