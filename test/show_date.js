function dump(areaModels){
	for (var i in areaModels) {
		$("body").append(areaModels[i].label);
		$("body").append("<br />");
		$("body").append("Subject, Start Date, Start Time, End Date, End Time, All Day Event ");
		$("body").append("<br />");
		for(var j in areaModels[i].trash){

		    areaModels[i].calcMostRect();
			for (var k in areaModels[i].trash[j].dayList) {

		      	var d = areaModels[i].trash[j].dayList[k];
      			var day_text=d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
				$("body").append(areaModels[i].trash[j].label);
				$("body").append(",");
				$("body").append(day_text);
				$("body").append(",");
				$("body").append("00:00:00");
				$("body").append(",");
				$("body").append("");
				$("body").append(",");
				$("body").append("");
				$("body").append(",");

				$("body").append("True");
				$("body").append("<br />");
			}
		}

	}
}
