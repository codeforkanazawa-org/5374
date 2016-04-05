package main

import (
	"bufio"
	"os"
	"strings"
)

type Center struct {
	start string
	end   string
}

func tabToSlice(row string) []string {
	return strings.Split(row, "	")
}

func convert5374Column(row []string) string {

	// オープンデータのインデックスが5374フォーマットにどこに対応しているか
	// 例えば mapping[1]=2 というのは 5374フォーマットのカラム1が金沢オープンデータフォーマット カラム2に対応
	mapping := [6]int{0, 2, 3, 4, 5, 1}

	const N = len(mapping)
	result := make([]string, 6)

	for i := 0; i < N; i++ {
		result[mapping[i]] = row[i]
	}
	return strings.Join(result, ",")

}

// ごみ処理センターのマッピングをします
// 金沢オープンデータフォーマット カラム5,6,7に対応
func mappingCenter(mp map[string]*Center, row []string) {
	v, found := mp[row[5]];
	if !found {
		mp[row[5]] = &Center{start:row[6], end:row[7]}
	}else {
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

	f.WriteString(data)
}

func mapToCenterFile(mp map[string]*Center) string {

	result := "名称,休止開始日,休止終了日\n"
	for key, value := range mp {
		if key == "センター" {
			continue
		}
		result += key + "," + value.start + "," + value.end + "\n"
	}
	return result
}

func main() {

	//	filename := os.Args[1]
	filename := "kanazawa_data/H27_gomi_calendar.csv"

	fp, err := os.Open(filename)
	if err != nil {
		panic(err)
	}

	scanner := bufio.NewScanner(fp)

	var area []string = []string{}

	mp := map[string]*Center{}

	for ; scanner.Scan(); {

		row := tabToSlice(scanner.Text())
		area = append(area, convert5374Column(row))
		mappingCenter(mp, row)
	}

	saveFile("data/area_days.csv", strings.Join(area, "\n"))
	saveFile("data/center.csv", mapToCenterFile(mp))

}
