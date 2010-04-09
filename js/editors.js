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
  'placeholder': null,
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
    base.editor.get()[0].focus();
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
      'show': function(e, placeholder, value) {
        base.placeholder = placeholder;
        $(base.containerCSSActive).trigger("hide");
        var pos = $(placeholder).position();
        // Set position and activate
        base.container.css({'left': pos.left, 'top': pos.top}).addClass(base.containerCSSActive).show();
        base.setEditorValue(value);
        base.setEditorFocus();
      },
      // Hide the editor container
      'hide': function(e) {
        base.container.hide();
      },
      'blur': function(e) {
        base.container.hide();
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
        base.container.trigger("enter", [base.getValue(), base.renderer(), base.placeholder] );
        base.container.trigger("hide");
      }
    });
  },
  /**
   * 
   */
  'setEditorFocus': function() {
    this.editor.get()[0].focus();
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
SelectEditor = TextEditor.extend({
  'type': 'select',
  /*
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
        base.placeholder;
        $(base.containerCSSActive).trigger("hide");
        var pos = $(placeholder).position();
        // Set position and activate
        base.container.css({'left': pos.left, 'top': pos.top}).addClass(base.containerCSSActive).show();
        base.setEditorValue(value);
        base.setEditorFocus();
      },
      // Hide the editor container
      'hide': function(e) {
        base.container.hide();
      },
      'blur': function(e) {
        base.container.hide();
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
      },
      'change': function(e) {
        base.container.trigger("enter", [base.getValue(), base.renderer()] );
      }
    });
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
  'setEditorFocus': function() {
    this.editor.trigger("click");
  }
});

