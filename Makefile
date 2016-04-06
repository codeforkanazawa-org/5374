AREA_DATA = data/area_days.csv data/center.csv data/target.csv

CALENDAR_CSV = H27_gomi_calendar.csv
JITEN_CSV = H27_gomi_jiten.csv

OPENDATA_URL_PREFIX = http://www4.city.kanazawa.lg.jp/data/open/cnt/3/23069/1/

KANAZAWA_DIR = convert_kanazawa_od
KANAZAWA_CALENDAR = $(KANAZAWA_DIR)/$(CALENDAR_CSV)
KANAZAWA_GOMI_JITEN = $(KANAZAWA_DIR)/$(JITEN_CSV)


GO_PROGRAM = $(KANAZAWA_DIR)/convert.go

.PHONY: all test clean

all: $(AREA_DATA)

test:  $(KANAZAWA_CALENDAR) $(KANAZAWA_GOMI_JITEN)
	rm -rf src

	mkdir -p src
	# go tool を動かすためのハック
	ln -s `pwd`/$(KANAZAWA_DIR) `pwd`/src/$(KANAZAWA_DIR)
	@env GOPATH=`pwd`/ go test -coverprofile=cover.out $(KANAZAWA_DIR)
	@env GOPATH=`pwd`/ go tool cover -html=cover.out
	rm -rf src
	rm cover.out


clean: 
	$(RM) $(KANAZAWA_CALENDAR)
	$(RM) $(KANAZAWA_GOMI_JITEN)



$(AREA_DATA): $(KANAZAWA_CALENDAR) $(KANAZAWA_GOMI_JITEN)
	go run $(GO_PROGRAM) $^


$(KANAZAWA_CALENDAR):
	curl $(OPENDATA_URL_PREFIX)/$(CALENDAR_CSV) | nkf -w -W16 > $@


$(KANAZAWA_GOMI_JITEN):
	curl $(OPENDATA_URL_PREFIX)/$(JITEN_CSV) | nkf -w -W16 > $@



