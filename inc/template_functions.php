<?php

function onepress_sanitize_repeatable_data_field($input, $setting)
{
	$control = $setting->manager->get_control($setting->id);

	$fields = $control->fields;
	if (is_string($input)) {
		$input = json_decode(wp_unslash($input), true);
	}
	$data = wp_parse_args($input, array());

	if (!is_array($data)) {
		return false;
	}
	if (!isset($data['_items'])) {
		return false;
	}
	$data = $data['_items'];

	foreach ($data as $i => $item_data) {
		foreach ($item_data as $id => $value) {

			if (isset($fields[$id])) {
				switch (strtolower($fields[$id]['type'])) {
					case 'text':
						$data[$i][$id] = sanitize_text_field($value);
						break;
					case 'url':
						$data[$i][$id] = esc_url($value);
						break;
					case 'textarea':
					case 'editor':
						$data[$i][$id] = wp_kses_post($value);
						break;
					case 'color':
						$data[$i][$id] = sanitize_hex_color_no_hash($value);
						break;
						// case 'coloralpha':
						// 	$data[ $i ][ $id ] = onepress_sanitize_color_alpha( $value );
						// 	break;
						// case 'checkbox':
						// 	$data[ $i ][ $id ] = onepress_sanitize_checkbox( $value );
						// 	break;
						// case 'select':
						// 	$data[ $i ][ $id ] = '';
						// 	if ( is_array( $fields[ $id ]['options'] ) && ! empty( $fields[ $id ]['options'] ) ) {
						// 		// if is multiple choices
						// 		if ( is_array( $value ) ) {
						// 			foreach ( $value as $k => $v ) {
						// 				if ( isset( $fields[ $id ]['options'][ $v ] ) ) {
						// 					$value [ $k ] = $v;
						// 				}
						// 			}
						// 			$data[ $i ][ $id ] = $value;
						// 		} else { // is single choice
						// 			if ( isset( $fields[ $id ]['options'][ $value ] ) ) {
						// 				$data[ $i ][ $id ] = $value;
						// 			}
						// 		}
						// 	}

						// 	break;
					case 'radio':
						$data[$i][$id] = sanitize_text_field($value);
						break;
					case 'media':
						$value = wp_parse_args(
							$value,
							array(
								'url' => '',
								'id' => false,
							)
						);
						$value['id'] = absint($value['id']);
						$data[$i][$id]['url'] = sanitize_text_field($value['url']);

						if ($url = wp_get_attachment_url($value['id'])) {
							$data[$i][$id]['id']   = $value['id'];
							$data[$i][$id]['url']  = $url;
						} else {
							$data[$i][$id]['id'] = '';
						}

						break;
					default:
						$data[$i][$id] = wp_kses_post($value);
				}
			} else {
				$data[$i][$id] = wp_kses_post($value);
			}

			if (is_array($data) && is_array($fields) && count($data[$i]) != count($fields)) {
				foreach ($fields as $k => $f) {
					if (!isset($data[$i][$k])) {
						$data[$i][$k] = '';
					}
				}
			}
		}
	}

	return $data;
}

if (!function_exists('template_data')) {
	/**
	 * Get's the data in the theme_mod and adds default values if necessary
	 *
	 * @since 1.1.4
	 * @return array
	 */
	function template_data($section, $default_fields)
	{

		$array = get_theme_mod($section);
		if (is_string($array)) {
			$array = json_decode($array, true);
		}
		if (!empty($array) && is_array($array)) {
			foreach ($array as $k => $v) {
				$array[$k] = wp_parse_args(
					$v,
					$default_fields
				);
			}
		}
		return $array;
	}
}
