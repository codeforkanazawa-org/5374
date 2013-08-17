<?php
mb_internal_encoding('SJIS');

function save($no) {
	$no = sprintf('%03d', $no);

	$opts = array(
			'http' => array(
			'method' => "GET",
			'header' => "Referer: http://www.city.kanazawa.ishikawa.jp/recycle/kensaku/h25_calendar.htm"
		)
	);
	$context = stream_context_create($opts);

	$uri = 'http://www.city.kanazawa.ishikawa.jp/recycle/kensaku/h25_calendar.files/sheet'.$no.'.htm';
	$text = file_get_contents($uri, false, $context);

	file_put_contents($no.'.html', $text);
}

for ($i = 1; $i <= 84; ++$i){
	save($i);
}