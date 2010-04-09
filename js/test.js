/**
 * Grider2 tests
 */

jQuery(document).ready(function($) {

    $table = $('#grid1');

    module("Initial configuration grider2");

    test("should add row attribute to table rows", function() {
      $table.find("tr").each(function(i, el) {
        equals(i.toString(), $(el).attr("row"));
      });
    });

    test("should add the col attribute to each cell", function() {
      for(var i =1; i < 3; i++) {
        equal( $table.find("tr:eq(" + i + ") td:eq(1)").attr("col"), "name" );
        equal( $table.find("tr:eq(" + i + ") td:eq(2)").attr("col"), "description" );
        equal( $table.find("tr:eq(" + i + ") td:eq(3)").attr("col"), "price" );
        equal( $table.find("tr:eq(" + i + ") td:eq(7)").attr("col"), "subtotal" );
      }
    });

    test("should ad editable to name, description, price, quantity, state, date", function() {
      $([1,2,3,4,5,6]).each(function(i, el) {
        ok($table.find("tr:eq(1) td:eq(" + el + ")").hasClass("editable"), "editable");
      });

      ok(!$table.find("tr:eq(1) td:eq(7)").hasClass("editable"), "not editable");
    });

    test("editors should have the width specified", function() {
      var w = $table.find("th[col=name]").width();
      equals($("#nameEditor input").css("width"), (w) + 'px', "width of editor nameEditor");
      w = $table.find("th[col=description]").width();
      equals($("#descriptionEditor textarea").css("width"), (w) + 'px') ;
    });

    test("editor should be hidden", function() {
      equals( $("#nameEditor").css("display"), "none");
      equals( $("#descriptionEditor").css("display"), "none");
    });


    module("Test functionality");

    test("Selected cell TD", function() {
      $table.find("td.editable:first").trigger("mousedown");
      ok($table.find("td.editable:first").hasClass("editable"));
      equals( $table.find("td.selected").length, 1);
      $table.find("td.editable:eq(3)").trigger("mousedown");
      ok($("td.editable:eq(3)").hasClass("editable"));
      equals( $("td.selected").length, 1);
    });

    function findVisibleEditor() {
      return jQuery('.griderEditor').filter(function(index){ 
        return jQuery(this).css("display") == "block";
      });
    }

    module("Test editor");

    test("show editor", function() {
      $table.find("td.editable:first").trigger("click");
      var editor = findVisibleEditor();
      equals(editor.attr("id"), "nameEditor", "Should be set the nameEditor");
      $table.find("td.editable:eq(1)").trigger("click");

      editor = findVisibleEditor();
      equals(editor.length, 1, "only one editor should be displayed");
    });

    module("Test keys");

    test("test ESC", function() {
      editor = findVisibleEditor();
      editor.find("textarea, input, select").trigger("keydown", $.ui.keyCode.ESCAPE);
    });

/*
    test("test tr", function() {
        ok( $table.hasClass(Grider.defaults.griderTableClass), "default table class");
    });

    test("test td attribute name is set", function(){
        for(var k in GriderTest.cols) {
            equals( GriderTest.cols[k].name, $table.find('tr.edit td:eq(' + k + ')').attr("name") );
        }
    });
 
    module("Operations");
    test("should number rows", function() {
        $table.find("tr.edit").each(function(i, el) {
            var num = parseInt( $(el).find('td:first').text() );
            equals((i + 1), num);
        });
    });
*/
        //console.log(GriderTest.cols[k].name);
});
