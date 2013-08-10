var list_data = new Array();

$(function() {
  $.getJSON("description.json", function(data) {
    for (var i in data) {

      $("#accordion").append(
        '<div class="accordion-group' + i + '">' +
        '<div class="accordion-heading">' +
        '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse' + i + '">' +
        '<h2><p class="text-center">' + data[i].label + '</p></h2>' +
        '<h4><p class="text-center">' + data[i].sublabel + '</p></h4>' +
        '<h6><p class="text-left date">2013.09.02 月曜日 AM 08:30</p></h6>' +
        '</a>' +
        '</div>' +
        '<div id="collapse' + i + '" class="accordion-body collapse">' +
        '<div class="accordion-inner">' +
        data[i].description
 +
        '</div>' +
        '</div>' +
        '</div>');
    }



    $.get("data.csv", function(csvdata) {
      csvdata = csvdata.replace(/¥r/g, "");
      var tmp = csvdata.split(String.fromCharCode(10));
      for (var i in tmp) {
        var row = tmp[i].split(",");
        list_data.push(row);
      }

      for (var row_index in list_data) {
        $("select.form-control").append("<option value=" + row_index + ">" + list_data[row_index][0] + "</option>");
      }
      //デフォルトのインデックスの表示  
      onChangeSelect(0);
    });
  });

  function onChangeSelect(row_index) {
    for (var i = 1; i < list_data[row_index].length; i++) {
      var day_mix = list_data[row_index][i].split(" ");
      var result_text = "";
      for (var j in day_mix) {
        if (day_mix[j].length == 1) {
          result_text += "毎週" + day_mix[j] + "曜日 ";
        } else {
          result_text += "第" + day_mix[j].charAt(1) + day_mix[j].charAt(0) + "曜日 ";
        }

      }

      result_text = "2013/08/xx （" + result_text + "）";

      $(".accordion-group" + (i - 1) + " .date").text(result_text);

    }
  }
  $("select.form-control").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });
});