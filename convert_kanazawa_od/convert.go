package main

import (
	"bufio"
	"os"
	"strings"
	"regexp"
	"encoding/csv"

	"io/ioutil"
	"bytes"
	"io"
	"fmt"
)

// 例えば MAPPING_AREA[1]=2 というのは 5374フォーマットのカラム1が金沢オープンデータフォーマット カラム2に対応

var (
	MAPPING_AREA = []int{0, 5, 1, 2, 3, 4}
	MAPPING_TARGET = []int{3, 1, 4, 0}
)

const (
	KANAZAWA_DEFAULT_COMMNA = rune('\t')
)

type Center struct {
	start string
	end   string
}
// 金沢オープンデータ用のCSVを読み出します。
func csvReader(filename string) *csv.Reader {

	b, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	}
	r := csv.NewReader(bufio.NewReader(bytes.NewReader(b)))
	r.Comma = rune(KANAZAWA_DEFAULT_COMMNA)
	return r

}

// カラムの再マッピングを行います。
// 同時に改行コードを<br>に置き換えます。
func convertColumn(row []string, mapping []int) []string {

	var N = len(mapping)
	result := make([]string, N)

	for i := 0; i < N; i++ {
		result[i] = strings.Replace(row[mapping[i]], "\n", "<br>", -1)
	}
	return result
}

// 金沢オープンデータ用から5374用の変換を行います。
func convert5374TargetColumn(row []string) []string {

	result := convertColumn(row, []int{3, 1, 4, 0})

	// 大きさ・材質などは 5374では品名(1)に入れる
	result[1] += row[2]

	// ごみの種類(0)から (金属ごみ)などを削除する。
	r := regexp.MustCompile(`（.*）`)
	result[0] = r.ReplaceAllString(result[0], "")

	return result

}

// 2016/1/5を2016/01/05 のようにします。
func normalizeDate(d string) string {
	s := strings.Split(d, "/")

	s[1] = fmt.Sprintf("%02s", s[1])
	s[2] = fmt.Sprintf("%02s", s[2])
	return strings.Join(s, "/")

}

// ごみ処理センターのマッピングをします
// 金沢オープンデータフォーマット カラム5,6,7に対応
func mappingCenter(mp map[string]*Center, row []string) {
	v, found := mp[row[5]];
	row[6] = normalizeDate(row[6])
	row[7] = normalizeDate(row[7])

	if !found {
		mp[row[5]] = &Center{start:row[6], end:row[7]}
	}else {
		// 最大の期間を選択するようにする
		if row[6] < v.start {
			v.start = row[6]
		}
		if v.end < row[7] {
			v.end = row[7]
		}
		mp[row[5]] = v
	}
}
func saveFile(filePath string, data string) {

	f, err := os.Create(filePath)
	defer f.Close()
	if err != nil {
		panic(err)
	}

	if _, err2 := f.WriteString(data); err2 != nil {
		panic(err2)
	}
}

// center.csvファイル用の文字列を作成します。
func mapToCenterData(mp map[string]*Center) string {

	result := "名称,休止開始日,休止終了日\n"
	for key, value := range mp {
		if key == "センター" {
			continue
		}
		result += key + "," + value.start + "," + value.end + "\n"
	}
	return result
}
// area_days.csv用の解析を行います。
func calcAreaDays(filename string) {

	r := csvReader(filename)
	var area []string = []string{"校下・地区,センター,燃やすごみ,燃やさないごみ,資源,あきびん"}
	mp := map[string]*Center{}

	// 1行目はラベルなので飛ばす
	r.Read()

	for ;; {
		row, err := r.Read()
		if err == io.EOF {
			break
		}else if err != nil {
			panic(err)
		}

		e := strings.Join(convertColumn(row, MAPPING_AREA), ",")

		area = append(area, e)
		mappingCenter(mp, row)
	}

	saveFile("data/area_days.csv", strings.Join(area, "\n"))
	saveFile("data/center.csv", mapToCenterData(mp))
}

// target.csv用の解析を行います。
func calcTarget(filename string) {
	r := csvReader(filename)
	var targets []string = []string{"type,name,notice,furigana"}

	// 1行目はラベルなので飛ばす
	r.Read()

	for ;; {
		row, err := r.Read()

		if err == io.EOF {
			break
		}else if err != nil {
			panic(err)
		}

		e := convert5374TargetColumn(row)

		targets = append(targets, strings.Join(e, ","))
	}

	saveFile("data/target.csv", strings.Join(targets, "\n"))

}

func main() {

	if len(os.Args) == 1 {
		calcAreaDays("kanazawa_data/H27_gomi_calendar.csv")
		calcTarget("kanazawa_data/H27_gomi_jiten.csv")
	}else {
		calcAreaDays(os.Args[1])
		calcTarget(os.Args[2])
	}

}
