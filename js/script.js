"use strict"
/**
  エリアを管理するクラスです。
*/
var AreaModel = function() {
  this.label;
  this.centerName;
  this.center;
  this.trash = new Array();
  /**
  各ゴミのカテゴリに対して、最も直近の日付を計算します。
*/
  this.calcMostRect = function() {
    for (var i = 0; i < this.trash.length; i++) {
      this.trash[i].calcMostRect(this);
    }
  }
  /**
    休止期間（主に年末年始）かどうかを判定します。
  */
  this.isBlankDay = function(currentDate) {
    var period = [this.center.startDate, this.center.endDate];

    if (period[0].getTime() <= currentDate.getTime() &&
      currentDate.getTime() <= period[1].getTime()) {
      return true;
    }
    return false;
  }
  /**
    ゴミ処理センターを登録します。
    名前が一致するかどうかで判定を行っております。
  */
  this.setCenter = function(center_data) {
    for (var i in center_data) {
      if (this.centerName == center_data[i].name) {
        this.center = center_data[i];
      }
    };
  }
  /**
  ゴミのカテゴリのソートを行います。
*/
  this.sortTrash = function() {
    this.trash.sort(function(a, b) {
      var at = a.mostRecent.getTime();
      var bt = b.mostRecent.getTime();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    });
  }
}
/**
  ゴミの種類の分別のクラスです。
*/
var Description = function() {
  this.label;
  this.notice;
}
/**
  各ゴミのカテゴリを管理するクラスです。
*/
var TrashModel = function(_lable, _cell) {
  this.dayLabel;
  this.mostRecent;
  this.dayList;
  this.dayCell = _cell.split(" ");
  this.label = _lable;
  this.description;

  var result_text = "";
  var today = new Date();

  for (var j in this.dayCell) {
    if (this.dayCell[j].length == 1) {
      result_text += "毎週" + this.dayCell[j] + "曜日 ";
    } else {
      result_text += "第" + this.dayCell[j].charAt(1) + this.dayCell[j].charAt(0) + "曜日 ";
    }
  }
  this.dayLabel = result_text;

  this.getDateLabel = function() {

    var result_text = this.mostRecent.getFullYear() + "/" + (1 + this.mostRecent.getMonth()) + "/" + this.mostRecent.getDate();

    return this.dayLabel + " " + result_text;
  }

  var day_enum = ["日", "月", "火", "水", "木", "金", "土"];

  function getDayIndex(str) {
    for (var i = 0; i < day_enum.length; i++) {
      if (day_enum[i] == str) {
        return i;
      }
    };
    return -1;
  }
  /**
  このゴミの年間のゴミの日を計算します。
  センターが休止期間がある場合は、その期間１週間ずらすという実装を行っております。
*/
  this.calcMostRect = function(areaObj) {
    var day_mix = this.dayCell;
    var result_text = "";
    var day_list = new Array();
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
          //コンストラクタでやろうとするとうまく行かなかった。。
          //
          //4月1日を基準にして曜日の差分で時間を戻し、最大５週までの増加させて毎週を表現
          d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
            ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
          );
          //年末年始のずらしの対応
          //休止期間なら、今後の日程を１週間ずらす
          if (areaObj.isBlankDay(d)) {
            isShift = true;
          }
          if (isShift) {
            d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
          }
          //同じ月の時のみ処理したい
          if (d.getMonth() != (month - 1) % 12) {
            continue;
          }
          //特定の週のみ処理する
          if (day_mix[j].length > 1) {
            if (week != day_mix[j].charAt(1) - 1) {
              continue;
            }
          }

          day_list.push(d) // += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";

        }
      }
    }
    //曜日によって日付順ではないので最終的にソートする。
    //ソートしなくてもなんとなりそうな気もしますが。。
    day_list.sort(function(a, b) {
      var at = a.getTime();
      var bt = b.getTime();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    })
    //直近の日付を更新
    var now = new Date();

    for (var i in day_list) {
      //8:30までは今日も含むこととする。
      if (this.mostRecent == null && now.getTime() < day_list[i].getTime() + 24 * 60 * 60 * 1000) {
        this.mostRecent = day_list[i];
        break;
      }
    };

    this.dayList = day_list;
  }
  /**
   計算したゴミの日一覧をリスト形式として取得します。
  */
  this.getDayList = function() {
    var day_text = "<ul>";
    for (var i in this.dayList) {
      var d = this.dayList[i];
      day_text += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>"

    };
    day_text += "</ul>";
    return day_text;
  }
}
/**
センターのデータを管理します。
*/
var CenterModel = function(row) {

  function getDay(center, index) {
    var tmp = center[index].split("/");
    return new Date(tmp[0], tmp[1] - 1, tmp[2]);
  }

  this.name = row[0];
  this.startDate = getDay(row, 1);
  this.endDate = getDay(row, 2);
}

  function get_selected_area_name() {
    return localStorage.getItem('selected_area_name');
  }

  function set_selected_area_name(name) {
    localStorage.setItem('selected_area_name', name);
  }

$(function() {
  var center_data = new Array();
  var descriptions = new Array();
  var areaModels = new Array();

  function update_area_list() {
    $.get("data/area_days.csv", function(csvdata) {
      var csvdata = csvdata.replace("/\r/gm", "");
      var tmp = csvdata.split(String.fromCharCode(10));
      var area_days_label = tmp.shift().split(",");
      for (var i in tmp) {
        var row = tmp[i].split(",");
        var area = new AreaModel();
        area.label = row[0];
        area.centerName = row[1];
        areaModels.push(area);

        for (var i = 2; i < 2 + 4; i++) {
          var trash = new TrashModel(area_days_label[i], row[i]);
          area.trash.push(trash);
        }
      }

      $.get("data/center.csv", function(tmp_center_data) {
        var tmp = tmp_center_data.split(String.fromCharCode(10));
        for (var i in tmp) {
          var row = tmp[i].split(",");

          var center = new CenterModel(row);
          center_data.push(center);
        }
        for (var i in areaModels) {
          var area = areaModels[i];
          area.setCenter(center_data);
          // area.calcMostRect();
        };

        var selected_name = get_selected_area_name();

        var area_select_form = $("#select_area");
        var select_html = "";
        select_html += '<option value="-1">地域を選択してください</option>';
        for (var row_index in areaModels) {
          var area_name = areaModels[row_index].label;
          var selected = (selected_name == area_name) ? 'selected="selected"' : '';

          select_html += '<option value="' + row_index + '" ' + selected + ' >' + area_name + "</option>";
        }
        //デバッグ用
        if (typeof dump == "function") {
          dump(areaModels);
        }

        area_select_form.html(select_html);
        area_select_form.change();
      });
    });
  }

  function create_menu_list(after_action) {
    $.getJSON("data/description.json", function(data) {
      for (var i in data) {
        descriptions.push(data[i]);
      }

      after_action();
      $('#accordion2').show();
    });
  }

  function update_data(row_index) {
    var areaModel = areaModels[row_index];


    var today = new Date();
    //直近の一番近い日付を計算します。
    areaModel.calcMostRect();
    //トラッシュの近い順にソートします。
    areaModel.sortTrash();

    var accordion_height = $(window).height() / 4;

    var accordionHTML = "";
    //アコーディオンの分類から対応の計算を行います。
    for (var i in areaModel.trash) {
      var description;
      var trash = areaModel.trash[i];

      for (var d_no in descriptions) {
        if (descriptions[d_no].label == trash.label) {
          description = descriptions[d_no];

          var target_tag = '';

          var furigana = '';

          var target_tag = '';
          var targets = description.target;
          for (var j in targets) {
            var target = targets[j];
            if (furigana != target.furigana) {
              if (furigana != '') {
                target_tag += '</ul>';
              }

              furigana = target.furigana;

              target_tag += '<h4 class="initials">' + furigana + '</h4>';
              target_tag += '<ul>';
            }

            target_tag += '<li>' + target.name + '</li>';
          }

          target_tag += '</ul>';

          var dateLabel = trash.getDateLabel();

          var leftDay = Math.ceil((trash.mostRecent.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          var leftDayText = "";
          if (leftDay == 0) {
            leftDayText = "今日";
          } else if (leftDay == 1) {
            leftDayText = "明日";
          } else if (leftDay == 2) {
            leftDayText = "明後日"
          } else {
            leftDayText = leftDay + "日後";
          }

          accordionHTML +=
            '<div class="accordion-group" id="accordion-group' + d_no + '">' +
            '<div class="accordion-heading">' +
            '<a class="accordion-toggle" style="height:' + accordion_height + 'px" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '">' +
            '<div class="left-day">' + leftDayText + '</div>' +
            '<div class="accordion-table" ><img src="' + description.styles.svg + '"  /></div>' +
          //'<h4><p class="text-center">' + description.sublabel + '</p></h4>' +
          '<h6><p class="text-left date">' + dateLabel + '</p></h6>' +
            '</a>' +
            '</div>' +
            '<div id="collapse' + i + '" class="accordion-body collapse">' +
            '<div class="accordion-inner">' +
            description.description + '<br />' + target_tag +
            '<div class="targetDays"></div></div>' +
            '</div>' +
            '</div>';
          // $(".accordion-group" + (d_no) + " .targetDays").html(day_list);
        }

      }
    }

    var accordion_elm = $("#accordion");
    accordion_elm.html(accordionHTML);

    $('.accordion-body').on('shown.bs.collapse', function() {
      var body = $('body');
      var accordion_offset = $($(this).parent().get(0)).offset().top;
      body.animate({
        scrollTop: accordion_offset
      }, 50);
    });

    $('.accordion-body').on('hidden.bs.collapse', function() {
      if ($('.in').length == 0) {
        $('html, body').scrollTop(0);
      }
    });
  }

  function onChangeSelect(row_index) {　
    if (row_index == -1){
      return;
    }
    set_selected_area_name(areaModels[row_index].label);

    if ($("#accordion").children().length == 0) {
      create_menu_list(function() {
        update_data(row_index);
      });
    } else {
      update_data(row_index);
    }
  }

  function getGpsErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "User denied the request for Geolocation."
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable."
      case error.TIMEOUT:
        return "The request to get user location timed out."
      case error.UNKNOWN_ERROR:
      default:
        return "An unknown error occurred."
    }
  }

  function getAreaIndex(area_name) {
    for (var i in areaModels) {
      if (areaModels[i].label == area_name) {
        return i;
      }
    }
    return -1;
  }

  $("#select_area").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });

  $('#gps_area').click(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      $.getJSON('area_candidate.php', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }, function(data) {
        if (data.result == true) {
          var area_name = data.candidate;
          var index = getAreaIndex(area_name);
          $("#select_area").val(index).change();
          alert(area_name + 'が設定されました');
        } else {
          alert(data.reason);
        }
      })

    }, function(error) {
      alert(getGpsErrorMessage(error));
    });
  });

  if (get_selected_area_name() == null) {
    $('#accordion2').show();
    $('#collapseZero').addClass('in');
  }
  if (!navigator.geolocation) {
    $('#gps_area').css('display', 'none');
  }

  update_area_list();
});