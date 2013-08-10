$(function(){
	$.getJSON("description.json", function(data){

		for(i in data){

			$("#accordion").append(
			  '<div class="accordion-group'+i+'">'+
    '<div class="accordion-heading">'+
      '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseOne">'+
        '<h2><p class="text-center">'+json[i].label+'</br></p></h2>'+
        '<h4><p class="text-center">'+json[i].sublabel+'</br></p></h4>'+
        '<h6><p class="text-left">2013.09.02 月曜日 AM 08:30</p></h6>'+
      '</a>'+
    '</div>'+
    '<div id="collapseOne" class="accordion-body collapse">'+
      '<div class="accordion-inner">'+
      json[i].decription+
      '</div>'+
    '</div>'+
  '</div>');
		}

	});
});