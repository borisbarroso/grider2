/**
 * Main class editor
 */
var TextEditor = Class.extend({
  'editor': null,
  'id': null,
  'div': null,
  'type': 'input:text',
  /**
   * Constructor
   * @param String id
   */
  'init': function(id) {
    this.id = '#' + id;
    this.div = $(this.id);
    this.editor = this.div.find(this.type);
    this.setEvents();
  },
  /**
   * sets the editor focus for the current editor, might deppend on the editor created
   */
  'setEditorFocus': function() {
    this.editor.get()[0].focus();
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
    // div events
    this.div.bind({
      ////
      // Actives when focus
      'focus': function(e, placeholder, value) {
        $('.griderEditor').hide();
        var pos = $(placeholder).position();
        base.div.css({left:pos.left, top:pos.top}).show();
        base.setEditorValue(value);
        base.setEditorFocus();
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
      'blur': function() {
        base.div.trigger('execute', [base.getValue(), base.renderer()]);
      }
    });
  },
  /**
   * Sets the key events for the input:text
   */
  'setKeyEvents': function(e) {
    switch(e.keyCode){
      case jQuery.ui.keyCode.TAB:
        this.div.trigger("tab", [this.getValue(), this.renderer(), this.editor.attr("data-name-format")]);
        this.div.hide();
      break;
      case jQuery.ui.keyCode.ENTER:
        this.div.trigger("enter", [this.getValue(), this.renderer(), this.editor.attr("data-name-format")]);
      break;
      case jQuery.ui.keyCode.ESCAPE:
        this.div.hide();
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
  'type': 'textarea'
});
