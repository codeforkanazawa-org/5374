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

func Test3(t *testing.T) {
	data := []string{"す", "すり鉢", "", "燃やさないごみ", ""}
	result := convert5374TargetColumn(data)

	if result[0] != "燃やさないごみ" {
		t.Errorf("余計な文字が消えています。 actual=%s", result[0])
	}
}
