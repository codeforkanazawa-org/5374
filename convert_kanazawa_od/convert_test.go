package main

import (
	"testing"
	"strings"
)

func Test1(t *testing.T) {
	data := []string{"す", "すり鉢", "", "燃やさないごみ（埋立ごみ）", ""}
	result := convert5374TargetColumn(data)

	if result[0] != "燃やさないごみ" {
		t.Errorf("()内が消えていません actual=%s", result[0])
	}

}

func Test2(t *testing.T) {
	data := []string{"浅野", "月 木", "水2", "火1 火3", "水4", "東部管理センター", "2015/12/28", "2016/1/4"}
	e := strings.Join(convertColumn(data, MAPPING_AREA), ",")

	if e != "浅野,東部管理センター,月 木,水2,火1 火3,水4" {
		t.Errorf("変換結果が違います。%s", e)

	}
}

func TestCSV(t *testing.T) {
	data := []string{"す", "すり鉢", "", "燃やさないごみ", "test\ntest"}
	result := convert5374TargetColumn(data)

	if result[0] != "燃やさないごみ" {
		t.Errorf("余計な文字が消えています。 actual=%s", result[0])
	}
	if result[1] != "すり鉢" {
		t.Errorf("改行が<br>に置き換わっていません actual=%s", result[1])
	}
	if result[2] != "test<br>test" {
		t.Errorf("改行が<br>に置き換わっていません actual=%s", result[2])
	}

	if result[3] != "す" {
		t.Errorf("改行が<br>に置き換わっていません actual=%s", result[3])
	}

}

func TestReader(t *testing.T) {
	r := csvReader("H27_gomi_calendar.csv")
	if r.Comma != rune('\t') {
		t.Errorf("金沢のCSVはタブです。")
	}
}

func TestDate(t *testing.T) {

	if normalizeDate("2016/1/5") != "2016/01/05" {
		t.Errorf("0が付加されておりません")
	}

	if normalizeDate("2016/12/15") != "2016/12/15" {
		t.Errorf("0が付加されておりません")
	}

	if normalizeDate("2016/2/15") != "2016/02/15" {
		t.Errorf("0が付加されておりません")
	}

}

func TestCenter(t *testing.T) {
	mp := map[string]*Center{}
	{
		row := []string{"", "", "", "", "", "センター", "2015/12/30", "2016/01/05"}
		mappingCenter(mp, row)
		if mp["センター"].start != "2015/12/30" {
			t.Errorf("セットミス")
		}
	}

	{
		row := []string{"", "", "", "", "", "センター", "2015/12/31", "2016/01/05"}
		mappingCenter(mp, row)
		if mp["センター"].start != "2015/12/30" {
			t.Errorf("セットミス")
		}
	}

	{
		row := []string{"", "", "", "", "", "センター", "2015/12/29", "2016/01/05"}
		mappingCenter(mp, row)
		if mp["センター"].start != "2015/12/29" {
			t.Errorf("セットミス")
		}
	}

	{
		row := []string{"", "", "", "", "", "センター", "2015/12/31", "2016/01/06"}
		mappingCenter(mp, row)
		if mp["センター"].end != "2016/01/06" {
			t.Errorf("セットミス")
		}
	}

}

