$(function() {
  var list_data = new Array();
  var center_data = new Array();
  var day_enum = ["日", "月", "火", "水", "木", "金", "土"];
  var descriptionClassification = new Array();
  var area_days_label;

  function getDayIndex(str) {
    for (var i = 0; i < day_enum.length; i++) {
      if (day_enum[i] == str) {
        return i;
      }
    };
    return -1;
  }

  function isBlankDay(currentDate, center_name) {
    function getCenterData(center_name) {
      for (var i = 0; i < center_data.length; i++) {
        if (center_data[i][0] == center_name) {
          return center_data[i];
        }
      };
      return -1;
    }

    function getStartAndEndDay(center) {
      function getDay(center, index) {
        var tmp = center[index].split("/");
        return new Date(tmp[0], tmp[1] - 1, tmp[2])
      }
      return [getDay(center, 1), getDay(center, 2)];
    }

    var center = getCenterData(center_name);

    var period = getStartAndEndDay(center);
    // console.log(period[0].getTime(),currentDate.getTime(),period[1].getTime());


    if (period[0].getTime() <= currentDate.getTime() &&
      currentDate.getTime() <= period[1].getTime()) {
      return true;
    }
    return false;
  }


  $.getJSON("description.json", function(data) {
    for (var i in data) {
      descriptionClassification.push({
        "label": data[i].label
      });
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
        '<h2><p class="text-center">' + '<center><img src="' + data[i].styles.svg + '" /></center>' + '</p></h2>' +
        '<h4><p class="text-center">' + data[i].sublabel + '</p></h4>' +
        '<h6><p class="text-left date"></p></h6>' +
        '</a>' +
        '</div>' +
        '<div id="collapse' + i + '" class="accordion-body collapse">' +
        '<div class="accordion-inner">' +
        data[i].description + '<br />' + target_tag +
        '<div class="targetDays"></div></div>' +
        '</div>' +
        '</div>');
    }
    $.get("CSV/center.csv", function(tmp_center_data) {
      var tmp = tmp_center_data.split(String.fromCharCode(10));
      for (var i in tmp) {
        var row = tmp[i].split(",");
        center_data.push(row);
      }

      $.get("CSV/area_days.csv", function(csvdata) {
        csvdata = csvdata.replace("/¥r/gm", "");
        var tmp = csvdata.split(String.fromCharCode(10));
        area_days_label = tmp.shift().split(",");
        for (var i in tmp) {
          var row = tmp[i].split(",");
          list_data.push(row);
        }

        for (var row_index in list_data) {
          $("select.form-control").append("<option value=" + row_index + ">" + list_data[row_index][0] + "</option>");
        }
        //デフォルトのインデックスの表示  
        onChangeSelect(0);

        //テストケース

        if (!isBlankDay(new Date(2014, 0, 1), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (!isBlankDay(new Date(2014, 0, 2), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (!isBlankDay(new Date(2014, 0, 7), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (isBlankDay(new Date(2014, 0, 8), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (isBlankDay(new Date(2014, 0, 10), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (isBlankDay(new Date(2014, 1, 14), "東部管理センター")) {
          console.log("テストエラー");
        }
        if (isBlankDay(new Date(2014, 1, 5), "東部管理センター")) {
          console.log("テストエラー");
        }

      });
    });
  });


  function onChangeSelect(row_index) {
    //直近の日時を更新
    var now = new Date();

    for (var i = 2; i < list_data[row_index].length; i++) {
      var day_list = "<ul>";

      var day_mix = list_data[row_index][i].split(" ");
      var result_text = "";
      var mostRecent = null;
      // 12月 +3月　を表現
      for (var month = 4; month <= 12 + 3; month++) {
        for (var j in day_mix) {
          //休止期間だったら、今後一週間ずらす。 
          var isShift = false;

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
              d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
                ((7 + getDayIndex(day_mix[j]) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
              );
              //同じ月の時
              if ((d.getMonth() + 1) == month % 12) {
                day_list += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";

                if (d.getTime() < now.getTime()) {
                  mostRecent = now;
                }

              }

            } else {

              d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
                ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
              );
              //年末年始のずらしの対応
              //休止期間なら、今後の日程を１週間ずらす
              if (isBlankDay(d, list_data[row_index][1])) {
                isShift = true;

              }
              if (isShift) {
                d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
              }
              //特定の週のみ表示
              if (week == day_mix[j].charAt(1) - 1) {
                if (isShift) {
                  // console.log(d);
                }
                day_list += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";

                if (d.getTime() < now.getTime()) {
                  mostRecent = now;
                }

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
      result_text += mostRecent.getFullYear() + "/" + mostRecent.getMonth() + "/" + mostRecent.getDate();

      day_list += "</ul>"

      // result_text = "2013/08/xx （" + result_text + "）";

      //アコーディオンの分類から対応の計算を行います。
      for (var label1 in descriptionClassification) {
        if (descriptionClassification[label1].label == area_days_label[i]) {
          $(".accordion-group" + (label1) + " .date").text(result_text);
          $(".accordion-group" + (label1) + " .targetDays").html(day_list);
          break;
        }
      }
    }
  }

  $("select.form-control").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });

});