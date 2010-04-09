/**
 * Main class editor
 */
var TextEditor = Class.extend({
  'editor': null,
  'id': null,
  'container': null,
  'type': 'input:text',
  'containerCSS': 'griderEditor', // CSS class of the DIV, P or anything that contains the editor field
  'containerCSSActive': 'griderActiveEditor', // Indicates when the editor is active
  'isFocus': false,
  /**
   * Constructor
   * @param String id
   */
  'init': function(id, width) {
    this.id = '#' + id;
    this.container = $(this.id);
    this.container.addClass(this.containerCSS).css({'position':'absolute'}).hide();
    this.editor = this.container.find(this.type);
    this.setEditorSize(width);
    this.setEvents();
  },
  /**
   * sets the editor focus for the current editor, might deppend on the editor created
   */
  'setEditorFocus': function() {
    this.isFocus = true;
    var base = this;
    // Hack for IE
    if($.browser.msie) {
      setTimeout( function () { base.editor.get()[0].focus();}, 50);
    }else{
      base.editor.get()[0].focus();
    }
  },
  /**
   *
   */
  'setEditorValue': function(value) {
    this.editor.val(value);
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
      'focus': function(e, placeholder, value) {
        $(base.containerCSSActive).trigger("hide");
        var pos = $(placeholder).position();
        // Set position and activate
        base.container.css({'left': pos.left, 'top': pos.top}).addClass(base.containerCSSActive).show();
        base.setEditorValue(value);
        base.setEditorFocus();
      },
      // Hide the editor container
      'hide': function() {
        base.container.hide();
        base.isFocus = false
      }
    });

    ////
    // Editor events
    this.editor.bind({
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
        base.container.trigger("hide");
      }
    });
  },
  /**
   * Sets the Editor size
   * @param Integer width
   */
  'setEditorSize': function(width) {
    if( $.browser.msie) {
      this.editor.css({'width': (width -1) + 'px'});
    }else{
      this.editor.css({'width': (width + 1) + 'px'});
    }
  },
  /**
   * Sets the key events for the input:text
   */
  'setKeyEvents': function(e) {
    switch(e.keyCode){
      case jQuery.ui.keyCode.TAB:
        this.container.trigger("tab", [this.getValue(), this.renderer()] );
        this.container.hide();
      break;
      case jQuery.ui.keyCode.ENTER:
        this.container.trigger("enter", [this.getValue(), this.renderer()] );
      break;
      case jQuery.ui.keyCode.ESCAPE:
        this.container.hide();
      break;
    }
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
    return this.editor.val();
  }

});


/**
 * Just and extension of the original TextEditor
 */
TextAreaEditor = TextEditor.extend({
  'type': 'textarea',
  /**
   * Sets the Editor size
   * @param Integer width
   */
  'setEditorSize': function(width) {
    this.editor.css({'width': width + 'px'});
  }
});


/**
 * For select fields
 */
SelectFieldEditor = TextEditor.extend({
  'type': 'select'
});

/**
 * For select fields with autocomplete
 */
ComboEditor = TextEditor.extend({
  'type': 'input:text',
  'originalEditorWidth': null,
  'isFocus': false, // Indicates if it has been focused
  'combo': null,
  'comboID': null,
  'init': function(id, width) {
    this.id = '#' + id;
    this.container = $(this.id);
    this.container.addClass(this.containerCSS).css({'position':'absolute'}).hide();
    this.editor = this.container.find('select');
    this.originalEditorWidth = this.editor.width();
    this.setEditorSize(width);
    // ufd
    this.editor.ufd();//{'allowLR': true});
    this.comboID = this.editor.attr("id") + "_ufd";
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
      'focus': function(e, placeholder, value) {
      //console.log("focus %o", arguments);
        // return false if the container is focused
        if(base.isFocus)
          return false;

        console.log("focus");/////////
        $('.griderEditor').hide();
        var pos = $(placeholder).position();
        base.container.css({'left':pos.left, 'top':pos.top}).show();
        base.setEditorValue(value);
        base.setEditorFocus();
        this.isFocus = true;
      },
      'hide': function() {
      console.log("hide combo");///
        base.isFocus = false;
        base.container.hide();
      }
    });

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
      //console.log("combo blur %o, Combo: %o, %s", e.target.id, base.combo.attr("id"), base.comboID );
      console.log(arguments);
        var target = e.target || e.srcElement;
        if(target.id == base.comboID) {
          console.log("NO era");
          e.stopPropagation();
          return false;
        }
        base.container.hide();
      }
    });
  },
  /**
   * Sets the key events for the input:text
   */
  'setKeyEvents': function(e) {
    switch(e.keyCode){
      case jQuery.ui.keyCode.TAB:
        console.log(this.getValue());
        this.container.trigger("tab", [this.getValue(), this.renderer()] );
        this.isFocus = false;
        this.container.hide();
      break;
      case jQuery.ui.keyCode.ENTER:
        this.container.trigger("enter", [this.getValue(), this.renderer()] );
      break;
      case jQuery.ui.keyCode.ESCAPE:
        this.container.hide();
      break;
    }
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
    console.log($(this.editor.attr("id")).ufd("getCurrentTextValue"));
    return this.editor.find("option[value=" + this.editor.val() + "]").text();
  }
});
