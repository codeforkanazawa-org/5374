var list_data=new Array();

$(function(){
	$.getJSON("description.json", function(data){

		for(var i in data){

			$("#accordion").append(
			  '<div class="accordion-group'+i+'">'+
    '<div class="accordion-heading">'+
      '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse'+i+'">'+
        '<h2><p class="text-center">'+data[i].label+'</br></p></h2>'+
        '<h4><p class="text-center">'+data[i].sublabel+'</br></p></h4>'+
        '<h6><p class="text-left date">2013.09.02 月曜日 AM 08:30</p></h6>'+
      '</a>'+
    '</div>'+
    '<div id="collapse'+i+'" class="accordion-body collapse">'+
      '<div class="accordion-inner">'+
      data[i].decription+
      '</div>'+
    '</div>'+
  '</div>');
		}
	});

  $.get("data.csv", function(csvdata){
    var tmp=csvdata.split("¥n");
    for(var i in tmp){
      var row=tmp[i].split(",");
      list_data.push(row);
    }

    for(var row_index in list_data){
        $("select.form-control").append("<option>"+list_data[row_index][0]+"</option>");

        for(var i=1;i<list_data[row_index].length;i++){
            var day_mix=list_data[row_index][i].split(" ");
            var result_text="";
            for(var j in day_mix){
              if (day_mix[j].length==1){
                result_text+="毎週"+day_mix[j]+"曜日 ";
              }else{
                result_text+="第"+day_mix[j].charAt(1)+day_mix[j].charAt(0)+"曜日 ";
              }
              $("accordion-group"+(i-1)+" date").text(result_text);
            }
        }
    }
  });

});