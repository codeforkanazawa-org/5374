DATA = data/area_day.csv data/center.csv

KANAZAWA_DIR = kanazawa_data
KANAZAWA_OPEN_DATA = $(KANAZAWA_DIR)/H27_gomi_calendar.csv

GO_PROGRAM = $(KANAZAWA_DIR)/get_kanazawa.go


.PHONY: all clean

all: $(DATA)

clean: 
	rm -f $(DATA)
	rm -f $(KANAZAWA_OPEN_DATA)

$(DATA): $(KANAZAWA_OPEN_DATA)
	go run $(GO_PROGRAM)

$(KANAZAWA_OPEN_DATA):
	curl http://www4.city.kanazawa.lg.jp/data/open/cnt/3/23069/1/H27_gomi_calendar.csv | nkf -w -W16 > $(KANAZAWA_OPEN_DATA)

        
