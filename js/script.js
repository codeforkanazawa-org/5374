var list_data = new Array();
var center_data = new Array();
var dayEnum = ["日", "月", "火", "水", "木", "金", "土"];

function getDayIndex(str) {
  for (var i = 0; i < dayEnum.length; i++) {
    if (dayEnum[i] == str) {
      return i;
    }
  };
  return -1;
}

$(function() {
  $.getJSON("description.json", function(data) {
    for (var i in data) {
      var targets = data[i].target;
      var target_tag = '<ul>';
      for (var j in targets) {
        target_tag += '<li>' + targets[j].name + '</li>';
      }
      target_tag += '</ul>';

      $("#accordion").append(
        '<div class="accordion-group' + i + '">' +
        '<div class="accordion-heading">' +
        '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse' + i + '">' +
        '<h2><p class="text-center">' + data[i].label + '</p></h2>' +
        '<h4><p class="text-center">' + data[i].sublabel + '</p></h4>' +
        '<h6><p class="text-left date"></p></h6>' +
        '</a>' +
        '</div>' +
        '<div id="collapse' + i + '" class="accordion-body collapse">' +
        '<div class="accordion-inner">' +
        data[i].description + '<br />' + target_tag +
        '</div>' +
        '</div>' +
        '</div>');
    }
    $.get("center.csv", function(tmp_center_data) {
      var tmp = tmp_center_data.split(String.fromCharCode(10));

      $.get("data.csv", function(csvdata) {
        csvdata = csvdata.replace(/¥r/g, "");
        var tmp = csvdata.split(String.fromCharCode(10));
        for (var i in tmp) {
          var row = tmp[i].split(",");
          center_data.push(row);

        };

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
    });
  });
});

function onChangeSelect(row_index) {
  for (var i = 2; i < list_data[row_index].length; i++) {
    var day_list = "<ul>";

    var day_mix = list_data[row_index][i].split(" ");
    var result_text = "";
    // 12月 +3月　を表現
    for (var month = 4; month <= 12 + 3; month++) {
      for (var j in day_mix) {
        //week=0が第1週目です。
        for (var week = 0; week < 5; week++) {

          //4月1日を起点として第n曜日などを計算する。
          var date = new Date(2013, month - 1, 1);
          var d = new Date(date);
          //毎週
          if (day_mix[j].length == 1) {

            //コンストラクタでやろうとするとうまく行かなかった。。
            //
            //4月1日を基準にして曜日の差分で時間を戻し、最大５週までの増加させて毎週を表現
            d.setMilliseconds(date.getMilliseconds() + 1000 * 60 * 60 * 24 *
              ((7 + getDayIndex(day_mix[j]) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
            );
            //同じ月の時
            if ((d.getMonth() + 1) == month) {
              day_list += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";
            }

          } else {
            if (week == day_mix[j].charAt(1) - 1) {

              d.setMilliseconds(date.getMilliseconds() + 1000 * 60 * 60 * 24 *
                ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
              );
              day_list += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";
            }
          }
        }


      }
    }

    for (var j in day_mix) {
      if (day_mix[j].length == 1) {
        result_text += "毎週" + day_mix[j] + "曜日 ";
      } else {
        result_text += "第" + day_mix[j].charAt(1) + day_mix[j].charAt(0) + "曜日 ";
      }

    }
    day_list += "</ul>"

    // result_text = "2013/08/xx （" + result_text + "）";

    $(".accordion-group" + (i - 2) + " .date").text(result_text);
    $(".accordion-group" + (i - 2) + " .accordion-inner").append(day_list);

  }
  $("select.form-control").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });
}