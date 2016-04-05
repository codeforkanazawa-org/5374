AREA_DATA = data/area_days.csv data/center.csv data/target.csv

CALENDAR_CSV = H27_gomi_calendar.csv
JITEN_CSV = H27_gomi_jiten.csv


KANAZAWA_DIR = kanazawa_data
KANAZAWA_CALENDAR = $(KANAZAWA_DIR)/$(CALENDAR_CSV)
KANAZAWA_GOMI_JITEN = $(KANAZAWA_DIR)/$(JITEN_CSV)


GO_PROGRAM = $(KANAZAWA_DIR)/convert.go


.PHONY: all test clean

all: $(AREA_DATA)

test:  $(KANAZAWA_CALENDAR) $(KANAZAWA_GOMI_JITEN)
	go test ./$(KANAZAWA_DIR)/...

clean: 
	$(RM) $(KANAZAWA_CALENDAR)
	$(RM) $(KANAZAWA_GOMI_JITEN)



$(AREA_DATA): $(KANAZAWA_CALENDAR) $(KANAZAWA_GOMI_JITEN)
	go run $(GO_PROGRAM) $^


$(KANAZAWA_CALENDAR):
	curl http://www4.city.kanazawa.lg.jp/data/open/cnt/3/23069/1/$(CALENDAR_CSV) | nkf -w -W16 > $@


$(KANAZAWA_GOMI_JITEN):
	curl http://www4.city.kanazawa.lg.jp/data/open/cnt/3/23069/1/$(JITEN_CSV) | nkf -w -W16 > $@



