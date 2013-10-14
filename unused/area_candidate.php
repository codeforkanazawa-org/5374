<?php
require_once './lib/PointLocation.php';

main();

function main()
{
	if (!isset($_GET['latitude']) || !isset($_GET['longitude'])) 
	{
		echo get_error_response('パラメーターが設定されていません');
		exit;
	}

	$lat = doubleval($_GET['latitude']);
	$lng = doubleval($_GET['longitude']);

	$candidate = get_candidate($lat, $lng);

	if ($candidate === false)
	{
		echo get_error_response('候補地が見つかりませんでした。');
		exit;
	}

	$response = get_success_response($candidate);

	echo $response;
	exit;
}

/**
*  緯度経度から地区の候補地名を取得する。
* @param $latitude double 緯度
* @param $longitude double 経度
* @return 候補地名。なければfalse。
*/
function get_candidate($latitude, $longitude)
{
	$filename = './data/area.kml';

	$point = "$longitude,$latitude";

	$doc = new DOMDocument();
	$doc->load($filename);

	$pointLocation = new PointLocation();

	$placemarks = $doc->getElementsByTagName('Placemark');

	foreach ($placemarks as $placemark)
	{
		$polygon_elms = $placemark->getElementsByTagName('Polygon');
		$polygon = get_polygon($polygon_elms->item(0));
		$result = $pointLocation->pointInPolygon($point, $polygon);

		if ($result === 'inside')
		{
			$name_elm = $placemark->getElementsByTagName('name');
			$name = $name_elm->item(0)->nodeValue;
			return $name;
		}
	}

	return false;
}

function get_polygon($polygon_elm)
{
	$outer_boundary_is_elms = $polygon_elm->getElementsByTagName('outerBoundaryIs');
	$linear_ring_elms = $outer_boundary_is_elms->item(0)->getElementsByTagName('LinearRing');
	$coordinates_elms = $linear_ring_elms->item(0)->getElementsByTagName('coordinates');
	$coordinates_text = $coordinates_elms->item(0)->nodeValue;
	$polygon = explode(' ', $coordinates_text);
	return $polygon;
}

function get_success_response($candidate)
{
	$response = array('result' => true, 'candidate' => $candidate);
	return json_encode($response);
}

function get_error_response($reason)
{
	$response = array('result' => false, 'reason' => $reason);
	return json_encode($response);
}
