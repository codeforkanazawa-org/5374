<?php

main();

function main()
{
	$src_filename = 'classify_src.csv';
	$dst_filename = 'description.json';
	$map_filename = 'classify_map.csv';
	$list_filename = 'classify_list.csv';

	$list = load_class_list($list_filename);
	$src = load_class_src($src_filename);
	$map = load_class_map($map_filename);
	$dst = put_target($src, $map, $list);
	save_description($dst_filename, $dst);
}

function load_class_list($filename)
{
	$lists = array();

	$fp = fopen($filename, 'r');
	while ($data = fgetcsv($fp, 10000))
	{
		$class = $data[0];
		$lists[$class] = array('svg' => $data[1]);
	}
	
	return $lists;
}

function load_class_src($filename)
{
	$classes = array();

	$fp = fopen($filename, 'r');
	while ($data = fgetcsv($fp, 10000))
	{
		$class = array();

		if (isset($data[0])) {
			$class['class'] = $data[0];
		}
		if (isset($data[1])) {
			$class['target'] = $data[1];
		}
		if (isset($data[2])) {
			$class['furigana'] = $data[2];
		}
		if (isset($data[3])) {
			$class['notice'] = $data[3];
		}

		$classes[] = $class;
	}

	return $classes;
}

function load_class_map($filename)
{
	$map = array();

	$fp = fopen($filename, 'r');
	while ($data = fgetcsv($fp, 10000))
	{
		$map[$data[0]] = $data[1];
	}

	return $map; 
}

function put_target($src, $map, $styles) {
	$dst = array();

	foreach ($src as $line) {
		$class_name = $line['class'];
		if (!isset($map[$class_name])) {
			echo "Not Found class. $class_name\n";
			continue;
		}
		$convert_class_name = $map[$class_name];
		if (empty($convert_class_name) || $convert_class_name === '-') {
			$name = $line['target'];
			echo "Non Target. $name\n";
			continue;
		}

		if (!isset($dst[$convert_class_name]))
		{
			$dst[$convert_class_name] = array(
				'label' => $convert_class_name,
				'sublabel' => '',
				'description' => '',
				'target' => array(),				
			);
		}
		
		$style = $styles[$convert_class_name];
		
		$class = $dst[$convert_class_name];
		$target = array(
			'name' => $line['target'],
			'notice' => isset($line['notice']) ? $line['notice'] : '',
			'style' => $style,
			);

		$dst[$convert_class_name]['target'][] = $target;
	}

	return $dst;
}

function save_description($filename, $list)
{
	$json = json_encode(array_values($list));
	file_put_contents($filename, $json);

}