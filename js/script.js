"use strict";

var ctx = null;  //多言語化対応

/**
  エリア(ごみ処理の地域）を管理するクラスです。
 */
var AreaModel = function() {
    this.label;
    this.centerName;
    this.center;
    this.trash = new Array();
    /**
     各ゴミのカテゴリに対して、最も直近の日付を計算します。
     */
    this.calcMostRecent = function() {
        for (var i = 0; i < this.trash.length; i++) {
            this.trash[i].calcMostRecent(this);
        }
    };
    /**
     * 休止期間（主に年末年始）かどうかを判定します。
     */
    this.isBlankDay = function(currentDate) {
        var period = [this.center.startDate, this.center.endDate];

        if (period[0].getTime() <= currentDate.getTime() &&
                currentDate.getTime() <= period[1].getTime()) {
            return true;
        }
        return false;
    };
    /**
     ゴミ処理センターを登録します。
     名前が一致するかどうかで判定を行っております。
     */
    this.setCenter = function(center_data) {
        for (var i in center_data) {
            if (this.centerName === center_data[i].name) {
                this.center = center_data[i];
            }
        }
    };
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
    };
};

/**
  各ゴミのカテゴリを管理するクラスです。
 */
var TrashModel = function(_lable, _cell, l10n) {
    this.dayLabel;
    this.mostRecent;
    this.dayList;
    this.mflag = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    if (_cell.search(/:/) >= 0) {
        var flag = _cell.split(":");
        this.dayCell = flag[0].split(" ");
        var mm = flag[1].split(" ");
    } else {
        this.dayCell = _cell.split(" ");
        var mm = new Array("4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3");
    }
    for (var m in mm) {
        this.mflag[mm[m] - 1] = 1;
    }
    this.label = _lable;
    this.description;
    this.regularFlg = 1;      // 定期回収フラグ（デフォルトはオン:1）
    
    var result_text = "";

    // 多言語化対応
    var day_enum = [ l10n.entities.sun.value,
                     l10n.entities.mon.value,
                     l10n.entities.tue.value,
                     l10n.entities.wed.value,
                     l10n.entities.thu.value,
                     l10n.entities.fri.value,
                     l10n.entities.sat.value
                   ];

    var week_name = {};
    week_name[l10n.entities.sun.value] = l10n.entities.sunday.value;
    week_name[l10n.entities.mon.value] = l10n.entities.monday.value;
    week_name[l10n.entities.tue.value] = l10n.entities.tuesday.value;
    week_name[l10n.entities.wed.value] = l10n.entities.wednesday.value;
    week_name[l10n.entities.thu.value] = l10n.entities.thursday.value;
    week_name[l10n.entities.fri.value] = l10n.entities.friday.value;
    week_name[l10n.entities.sat.value] = l10n.entities.saturday.value;

    var week_enum = {
        1: l10n.entities.first.value,
        2: l10n.entities.second.value,
        3: l10n.entities.third.value,
        4: l10n.entities.fourth.value,
        5: l10n.entities.fifth.value
    };
    var parts = [];

    for (var j in this.dayCell) {
        parts = this.dayCell[j].match(/([^0-9]+)([0-9])/);
        if ($.inArray(this.dayCell[j], day_enum) > 0) {
            result_text += l10n.entities.weekly.value + week_name[this.dayCell[j]] + ", ";
        } else if (parts && parts.length === 3 && parts[1] !== "*") {
            result_text += week_enum[parts[2]] + week_name[parts[1]] + ", ";
        } else if (parts && parts.length === 3 && parts[1] === "*") {
            // 
        } else {
            // 不定期回収の場合（YYYYMMDD指定）
            result_text = l10n.entities.unscheduled.value + " ";
            this.regularFlg = 0;  // 定期回収フラグオフ
        }
    }
    this.dayLabel = result_text;

    this.getDateLabel = function() {
        var result_text = this.mostRecent.getFullYear() + "/" + (1 + this.mostRecent.getMonth()) + "/" + this.mostRecent.getDate();
        return this.dayLabel + " " + result_text;
    };

    function getDayIndex(str) {
        for (var i = 0; i < day_enum.length; i++) {
            if (day_enum[i] === str) {
                return i;
            }
        };
        return -1;
    };
    /**
      このゴミの年間のゴミの日を計算します。
      センターが休止期間がある場合は、その期間１週間ずらすという実装を行っております。
     */
    this.calcMostRecent = function(areaObj) {
        var day_mix = this.dayCell;
        var day_list = new Array();
        // 定期回収の場合
        if (this.regularFlg === 1) {

            var today = new Date();
            // 12月 +3月　を表現
            for (var i = 0; i < MaxMonth; i++) {

                var curMonth = today.getMonth() + i;
                var curYear = today.getFullYear() + Math.floor(curMonth / 12);
                var month = (curMonth % 12) + 1;

                // 収集が無い月はスキップ
                if (this.mflag[month - 1] === 0) {
                    continue;
                }
                for (var j in day_mix) {
                    //休止期間だったら、今後一週間ずらす。 
                    var isShift = false;

                    //week=0が第1週目です。
                    for (var week = 0; week < 5; week++) {
                        //4月1日を起点として第n曜日などを計算する。
                        var date = new Date(curYear, month - 1, 1);
                        var d = new Date(date);
                        //コンストラクタでやろうとするとうまく行かなかった。。
                        //
                        //4月1日を基準にして曜日の差分で時間を戻し、最大５週までの増加させて毎週を表現
                        d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
                                ((7 + getDayIndex(day_mix[j].replace(/[0-9]/, '')) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
                                );
                        //年末年始のずらしの対応
                        //休止期間なら、今後の日程を１週間ずらす
                        if (areaObj.isBlankDay(d)) {
                            if (WeekShift) {
                                isShift = true;
                            } else {
                                continue;
                            }
                        }
                        if (isShift) {
                            d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
                        }
                        //同じ月の時のみ処理したい
                        if (d.getMonth() !== (month - 1) % 12) {
                            continue;
                        }
                        //特定の週のみ処理する
                        var last_str = day_mix[j].substr(day_mix[j].length - 1, 1);
                        if (!isNaN(last_str - 0)) {
                            if (last_str - 1 !== week) {
                                continue;
                            }
                        }

                        day_list.push(d);
                    }
                }
            }
        } else {
            // 不定期回収の場合は、そのまま指定された日付をセットする
            for (var j in day_mix) {
                var year = parseInt(day_mix[j].substr(0, 4));
                var month = parseInt(day_mix[j].substr(4, 2)) - 1;
                var day = parseInt(day_mix[j].substr(6, 2));
                var d = new Date(year, month, day);
                day_list.push(d);
            }
        }
        //曜日によっては日付順ではないので最終的にソートする。
        //ソートしなくてもなんとなりそうな気もしますが、とりあえずソート
        day_list.sort(function(a, b) {
            var at = a.getTime();
            var bt = b.getTime();
            if (at < bt) return -1;
            if (at > bt) return 1;
            return 0;
        });
        
        //直近の日付を更新
        var now = new Date();

        for (var i in day_list) {
            if (typeof this.mostRecent === 'undefined' 
                    && now.getTime() < day_list[i].getTime() + 24 * 60 * 60 * 1000) {
                this.mostRecent = day_list[i];
                break;
            }
        }

        this.dayList = day_list;
    };
    /**
   計算したゴミの日一覧をリスト形式として取得します。
     */
    this.getDayList = function() {
        var day_text = "<ul>";
        for (var i in this.dayList) {
            var d = this.dayList[i];
            day_text += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";
        };
        day_text += "</ul>";
        return day_text;
    };
};

/**
 * センターのデータを管理します。
 */
var CenterModel = function(row) {
    function getDay(center, index) {
        var tmp = center[index].split("/");
        return new Date(tmp[0], tmp[1] - 1, tmp[2]);
    }

    this.name = row[0];
    this.startDate = getDay(row, 1);
    this.endDate = getDay(row, 2);
};

/**
 * ゴミのカテゴリを管理するクラスです。
 * description.csvのモデルです。
 */
var DescriptionModel = function(data) {
    this.targets = new Array();

    this.label = data[0];
    this.sublabel = data[1];//not used
    this.description = data[2];//not used
    this.styles = data[3];
    this.background = data[4];

};

/**
 * ゴミのカテゴリの中のゴミの具体的なリストを管理するクラスです。
 * target.csvのモデルです。
 */
var TargetRowModel = function(data) {
    this.type = data[0];
    this.name = data[1];
    this.notice = data[2];
    this.furigana = data[3];
};

/**
 * 古紙,古着,自己処理のゴミを管理するクラスです。(TargetRowModelと同じ構造)
 * addendum.csvのモデルです。
 */
var AddendumModel = function(data) {
    this.type = data[0];
    this.name = data[1];
    this.notice = data[2];
    this.furigana = data[3];
};

$(function() {
    var center_data = new Array();
    var descriptions = new Array();
    var areaModels = new Array();
    var towns = new Array();
    var addendums = new Array();
    var polygons = {};
    var place_name = new String();
    
    var geo_error;

    // 多言語化対応
    // 'today','tomorrow','in_two_days','days_later'の翻訳に使う
    var days_labels = {};
    
    /**
     * 多言語化対応
     * ブラウザの言語設定と同じロケールが対応されているならロードする。
     * ロードできたらスクリプトの使う文字列を翻訳して、エリアリストや
     * 情報位置イベントを設置する。
     */
    function setupL20n() {
        // ブラウザの言語設定
        var lang = navigator.language.toLowerCase();
        $.getJSON('./manifest.json', function(settings) {
            ctx = L20n.getContext();
            ctx.registerLocales(settings.default_locale, settings.locales);
            ctx.linkResource(function(locale) {
                return './locales/' + locale + '/main.l20n';
            });

            ctx.requestLocales(lang);
            
            ctx.ready(function() {
                // 実際の初期処理
                var params = ['select_area',
                              'today','tomorrow','in_two_days','days_later',
                              'sun','mon','tue','wed','thu','fri','sat',
                              'sunday','monday','tuesday','wednesday','thursday','friday','saturday',
                              'weekly','first','second','third','fourth','fifth',
                              'unscheduled', 
                              'geolocation_error'
                             ];
                ctx.localize(params, function(l10n) {
                    updateAreaList(l10n);
                    takePolygon();
                    loadTowns();
                    
                    //必要な文字列の翻訳をゲットしたらエリア変更イベントを登録する
                    days_labels['today'] = l10n.entities.today.value;
                    days_labels['tomorrow'] = l10n.entities.tomorrow.value;
                    days_labels['in_two_days'] = l10n.entities.in_two_days.value;
                    days_labels['days_later'] = l10n.entities.days_later.value;
                    $("#select_area").change(function(data) {
                        var row_index = $(data.target).val();
                        onChangeSelect(row_index);
                    });

                    // エラーメッセージの準備できてから位置情報試しましょう
                    geo_error = l10n.entities.geolocation_error.value;
                    $('#select_by_location_data').on('click', function() {
                        if(!navigator.geolocation) {
                            alert(geo_error);
                        }
                        takeUserLocation();
                    });
                });
            });
        });
    }

    function loadTowns() {
        // area_days.csvに書いていない名前である可能性があるので
        // town_area.csvで町の地域を調べる
        var lang = ctx.supportedLocales[0];
        csvToArray("data/" + lang + "/town_area.csv", function(data) {
            data.shift();
            towns = data;
        });
    }
    
    function getSelectedAreaName() {
        return localStorage.getItem("selected_area_name");
    }

    function setSelectedAreaName(name) {
        localStorage.setItem("selected_area_name", name);
    }

    function csvToArray(filename, cb) {
        $.get(filename, function(csvdata) {
            //CSVのパース作業
            //CRの解析ミスがあった箇所を修正しました。
            //以前のコードだとCRが残ったままになります。
            // var csvdata = csvdata.replace("\r/gm", ""),
            csvdata = csvdata.replace(/\r/gm, "");
            var line = csvdata.split("\n"),
            ret = [];
            for (var i in line) {
                //空行はスルーする。
                if (line[i].length === 0) continue;

                var row = line[i].split(",");
                ret.push(row);
            }
            cb(ret);
        });
    }

    function updateAreaList(l10n) {
        // 多言語化対応
        var lang = ctx.supportedLocales[0];

        createAddendums(updateAddendums, lang);

        csvToArray("data/" + lang + "/area_days.csv", function(tmp) {
            var area_days_label = tmp.shift();
            for (var i in tmp) {
                var row = tmp[i];
                var area = new AreaModel();
                area.label = row[0];
                area.centerName = row[1];

                areaModels.push(area);
                //２列目以降の処理
                for (var r = 2; r < 2 + MaxDescription; r++) {
                    if (area_days_label[r] && row[r]) {
                        var trash = new TrashModel(area_days_label[r], row[r], l10n);
                        area.trash.push(trash);
                    }
                }
            }

            // 多言語化対応
            csvToArray("data/" + lang + "/center.csv", function(tmp) {
                //ゴミ処理センターのデータを解析します。
                //表示上は現れませんが、
                //金沢などの各処理センターの休止期間分は一週間ずらすという法則性のため
                //例えば第一金曜日のときは、一周ずらしその月だけ第二金曜日にする
                tmp.shift();
                for (var i in tmp) {
                    var row = tmp[i];

                    var center = new CenterModel(row);
                    center_data.push(center);
                }
                //ゴミ処理センターを対応する各地域に割り当てます。
                for (var i in areaModels) {
                    var area = areaModels[i];
                    area.setCenter(center_data);
                };
                //エリアとゴミ処理センターを対応後に、表示のリストを生成する。
                //ListメニューのHTML作成
                var selected_name = getSelectedAreaName();
                var area_select_form = $("#select_area");
                var select_html = "";
                select_html += '<option value="-1">' + l10n.entities.select_area.value + '</option>';
                for (var row_index in areaModels) {
                    var area_name = areaModels[row_index].label;
                    var selected = (selected_name === area_name) ? 'selected="selected"' : "";

                    select_html += '<option value="' + row_index + '" ' + selected + " >" + area_name + "</option>";
                }

                //デバッグ用
                if (typeof dump === "function") {
                    dump(areaModels);
                }
                //HTMLへの適応
                area_select_form.html(select_html);
                area_select_form.change();
            });
        });
    }

    function takePolygon() {
        $.ajax({
            url: "data/" + ctx.supportedLocales[0] + "/nonoichi_city.kml",
            type: 'get',
            dataType: 'xml',
            success: function(xml) {
                $(xml).find('Placemark').each(function(index, elem) {
                    var $elem = $(elem);
                    var name = $elem.find('name').text();
                    var coordinates = $elem.find('coordinates').text().split(' ');

                    var points = new Array(coordinates.length);
                    for(var i = 0, l = coordinates.length; i < l; i++) {
                        var point = coordinates[i].split(',');
                        points[i] = {
                            latitude: parseFloat(point[1]),
                            longitude: parseFloat(point[0])
                        };
                    }
                    polygons[name] = points;
                });
            }
        });
    }

    function whereIsPointInsidePolygon(latitude, longitude) {
        for(var name in polygons) {
            var isInside = geolib.isPointInside(
                    {latitude: latitude, longitude: longitude}, polygons[name]);
            if(isInside) {
                for (var i = 0; i < towns.length; i++ ) {
                    var match = towns[i];
                    if (match[0] === name) {
                        name = match[1];
                        break;
                    }
                }
                return name;
            }
        }

        return '';
    }

    function takeUserLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            place_name = whereIsPointInsidePolygon(position.coords.latitude, position.coords.longitude);
            
            if(!place_name) {
                alert(geo_error);
                return;
            }
            
            // TODO: Make a better way of changing the user's area
            //       Handle the case that a name is not in area_days.csv
            var area_select_form = $("#select_area");
            area_select_form.find('option').each(function(index, elem) {
                if($(elem).text() === place_name) {
                    area_select_form[0].selectedIndex = index;
                    onChangeSelect(elem.value);
                }
            });
        },
        function(error) {
            alert(geo_error);
        });
    }

    function createMenuList(after_action) {
        // 多言語化
        var lang = ctx.supportedLocales[0];
        
        // TODO: csvからのデータ読込みを初期化の時しか呼出さないようにする
        //       createMenuListは地域が変更するごとに呼出されるので、
        //       ここにcsvToArrayを使わないほうが良い。
        csvToArray("data/" + lang + "/description.csv", function(data) {
            data.shift();
            for (var i in data) {
                descriptions.push(new DescriptionModel(data[i]));
            }

            csvToArray("data/" + lang + "/target.csv", function(data) {

                data.shift();
                for (var i in data) {
                    var row = new TargetRowModel(data[i]);
                    for (var j = 0; j < descriptions.length; j++) {
                        //一致してるものに追加する。
                        if (descriptions[j].label === row.type) {
                            descriptions[j].targets.push(row);
                            break;
                        }
                    };
                }
                after_action();
                $("#accordion2").show();

            });                
        });
    }

    function createAddendums(after_action, language) {
        var filepath = "data/" + language + "/addendum.csv";
        csvToArray(filepath, function(data) {
            data.shift();
            for (var i in data) {
                addendums.push(new AddendumModel(data[i]));
            }
            after_action();
        });
    }

    function updateAddendums() {
        if (addendums.length === 0) {
            return;
        }
        var accordionElements = $("#accordion3 .help");
        var accordionSize = accordionElements.size();
        if (accordionSize === 0) {
            return;
        }
        var accordionIndex = 0;
        var tmpType = addendums[0].type;
        var tmpFurigana = addendums[0].furigana;
        var accordionHTML = "<h4>" + tmpFurigana + "</h4><ul>";

        for (var i in addendums) {
            if (accordionIndex > accordionSize) {
                break;
            }
            var addendum = addendums[i];
            if (addendum.type !== tmpType) {
                tmpType = addendum.type;
                tmpFurigana = addendum.furigana;
                accordionElements.eq(accordionIndex).append(accordionHTML + "</ul>");
                accordionIndex += 1;
                accordionHTML = "<h4>" + tmpFurigana + "</h4><ul>";
                if (accordionIndex > accordionSize) {
                    break;
                }
            } else if (addendum.furigana !== tmpFurigana) {
                tmpFurigana = addendum.furigana;
                accordionHTML += "</ul><h4>" + tmpFurigana + "</h4><ul>";
            }
            accordionHTML += "<li><div>" + addendum.name + '</div><div class="note">' + addendum.notice + "</div></li>";
        }
        accordionElements.eq(accordionIndex).append(accordionHTML + "</ul>");
    }

    function updateData(row_index) {
        //SVG が使えるかどうかの判定を行う。
        //TODO Android 2.3以下では見れない（代替の表示も含め）不具合が改善されてない。。
        //参考 http://satussy.blogspot.jp/2011/12/javascript-svg.html
        var ableSVG = (window.SVGAngle !== void 0);
        //var ableSVG = false;  // SVG未使用の場合、descriptionの1項目目を使用
        var areaModel = areaModels[row_index];
        var today = new Date();
        //直近の一番近い日付を計算します。
        areaModel.calcMostRecent();
        //トラッシュの近い順にソートします。
        areaModel.sortTrash();
        var accordion_height = $(window).height() / descriptions.length;
        if(descriptions.length>5){
            if (accordion_height<100) {accordion_height=100;};
        }

        var styleHTML = "";
        var accordionHTML = "";
        //アコーディオンの分類から対応の計算を行います。
        for (var i in areaModel.trash) {
            var trash = areaModel.trash[i];

            for (var d_no in descriptions) {
                var description = descriptions[d_no];
                if (description.label !== trash.label) {
                    continue;
                }

                var target_tag = "";
                var furigana = "";
                var target_tag = "";
                var targets = description.targets;
                for (var j in targets) {
                    var target = targets[j];
                    if (furigana !== target.furigana) {
                        if (furigana !== "") {
                            target_tag += "</ul>";
                        }

                        furigana = target.furigana;

                        target_tag += '<h4 class="initials">' + furigana + "</h4>";
                        target_tag += "<ul>";
                    }

                    target_tag += '<li style="list-style:none;"><div>' + target.name + "</div>";
                    target_tag += '<div class="note">' + target.notice + "</div></li>";
                }

                target_tag += "</ul>";

                var dateLabel = trash.getDateLabel();
                //あと何日かを計算する処理です。
                var leftDay = Math.ceil((trash.mostRecent.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                var leftDayText = "";
                if (leftDay === 0) {
                    leftDayText = days_labels['today'];
                } else if (leftDay === 1) {
                    leftDayText = days_labels['tomorrow'];
                } else if (leftDay === 2) {
                    leftDayText = days_labels['in_two_days'];
                } else {
                    leftDayText = leftDay + days_labels['days_later'];
                }

                //styleHTML += '#accordion-group' + d_no + '{background-color:  ' + description.background + ';} ';
                //IE対応
                styleHTML = 'background-color:  ' + description.background ;

                accordionHTML +=
                        //'<div class="accordion-group" id="accordion-group' + d_no + '">' +
                //IE対応
                '<div class="accordion-group" id="accordion-group' + d_no + '" style="' + styleHTML + '">' +

                        '<div class="accordion-heading">' +
                        '<a class="accordion-toggle" style="height:' + accordion_height + 'px" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '">' +
                        '<div class="left-day">' + leftDayText + '</div>' +
                        '<div class="accordion-table" >';
                if (ableSVG && SVGLabel) {
                    accordionHTML += '<img src="' + description.styles + '" alt="' + description.label + '"  />';
                } else {
                    accordionHTML += '<p class="text-center">' + description.label + "</p>";
                }
                accordionHTML += "</div>" +
                        '<h6><p class="text-left date">' + dateLabel + "</p></h6>" +
                        "</a>" +
                        "</div>" +
                        '<div id="collapse' + i + '" class="accordion-body collapse">' +
                        '<div class="accordion-inner">' +
                        description.description + "<br />" + target_tag +
                        '<div class="targetDays"></div></div>' +
                        "</div>" +
                        "</div>";
            }
        }

        //IE対応
        //$("#accordion-style").html('<!-- ' + styleHTML + ' -->');

        var accordion_elm = $("#accordion");
        accordion_elm.html(accordionHTML);

        $('html,body').animate({scrollTop: 0}, 'fast');

        //アコーディオンのラベル部分をクリックしたら  
        $(".accordion-body").on("shown.bs.collapse", function() {
            var body = $('body');
            var accordion_offset = $($(this).parent().get(0)).offset().top;
            body.animate({
                scrollTop: accordion_offset
            }, 50);
        });
        //アコーディオンの非表示部分をクリックしたら  
        $(".accordion-body").on("hidden.bs.collapse", function() {
            if ($(".in").length === 0) {
                $("html, body").scrollTop(0);
            }
        });
    }

    function onChangeSelect(row_index) {
        if (row_index === '-1') {
            $("#accordion").html("");
            setSelectedAreaName("");
            return;
        }
        setSelectedAreaName(areaModels[row_index].label);

        if ($("#accordion").children().length === 0 && descriptions.length === 0) {

            createMenuList(function() {
                updateData(row_index);
            });
        } else {
            updateData(row_index);
        }
    }

    function getAreaIndex(area_name) {
        for (var i in areaModels) {
            if (areaModels[i].label === area_name) {
                return i;
            }
        }
        return -1;
    }
        
    if (getSelectedAreaName() === null) {
        $("#accordion2").show();
        $("#collapseZero").addClass("in");
    }
    if (!navigator.geolocation) {
        $("#gps_area").css("display", "none");
    }

    setupL20n();
    
});
