/*
  The only function of this file is to add the functionality of the WP REPEATERABLE Customizer 
*/

(function (api) {

    // Extends our custom "example-1" section.
    api.sectionConstructor['onepress-plus'] = api.Section.extend({

        // No events for this type of section.
        attachEvents: function () {
        },

        // Always make the section active.
        isContextuallyActive: function () {
            return true;
        }
    });

})(wp.customize);


/*
  jQuery deparam is an extraction of the deparam method from Ben Alman's jQuery BBQ
  http://benalman.com/projects/jquery-bbq-plugin/
*/
(function ($) {
    $.deparam = function (params, coerce) {
        var obj = {},
            coerce_types = {'true': !0, 'false': !1, 'null': null};

        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='),
                key = decodeURIComponent(param[0]),
                val,
                cur = obj,
                i = 0,

                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decodeURIComponent(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val              // number
                        : val === 'undefined' ? undefined         // undefined
                            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                                : val;                                                // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                            ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                            : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                    ? undefined
                    : '';
            }
        });

        return obj;
    };
})(jQuery);


// WP REPEATERABLE Customizer -----------------------------

(function (api, $) {

    api.controlConstructor['repeatable'] = api.Control.extend({
        ready: function () {
            var control = this;
            setTimeout(function () {
                control._init();
            }, 2500);
        },

        eval: function (valueIs, valueShould, operator) {

            switch (operator) {
                case 'not_in':
                    valueShould = valueShould.split(',');
                    if ($.inArray(valueIs, valueShould) < 0) {
                        return true;
                    } else {
                        return false;
                    }
                    break;
                case 'in':
                    valueShould = valueShould.split(',');
                    if ($.inArray(valueIs, valueShould) > -1) {
                        return true;
                    } else {
                        return false;
                    }
                    break;
                case '!=':
                    return valueIs != valueShould;
                case '<=':
                    return valueIs <= valueShould;
                case '<':
                    return valueIs < valueShould;
                case '>=':
                    return valueIs >= valueShould;
                case '>':
                    return valueIs > valueShould;
                case '==':
                case '=':
                    return valueIs == valueShould;
                    break;
            }
        },

        compare: function (value1, cond, value2) {
            var equal = false;
            var _v;
            switch (cond) {
                case '===':
                    equal = (value1 === value2) ? true : false;
                    break;
                case 'in':
                    return value2.indexOf(value1) == -1 ? false : true;
                    break;
                case '>':
                    equal = (value1 > value2) ? true : false;
                    break;
                case '<':
                    equal = (value1 < value2) ? true : false;
                    break;
                case '!=':
                    equal = (value1 != value2) ? true : false;
                    break;
                case 'empty':
                    _v = _.clone(value1);
                    if (_.isObject(_v) || _.isArray(_v)) {
                        _.each(_v, function (v, i) {
                            if (_.isEmpty(v)) {
                                delete _v[i];
                            }
                        });

                        equal = _.isEmpty(_v) ? true : false;
                    } else {
                        equal = _.isNull(_v) || _v == '' ? true : false;
                    }


                    break;
                case 'not_empty':
                    _v = _.clone(value1);
                    if (_.isObject(_v) || _.isArray(_v)) {
                        _.each(_v, function (v, i) {
                            if (_.isEmpty(v)) {
                                delete _v[i];
                            }
                        })
                    }
                    equal = _.isEmpty(_v) ? false : true;
                    break;
                default:
                    equal = (value1 == value2) ? true : false;

            }
            return equal;
        },
        multiple_compare: function (list, values) {
            var control = this;
            var check = true;
            try {
                var test = list[0];
                check = true;
                if (_.isString(test)) {
                    check = false;
                    var cond = list[1];
                    var cond_val = list[2];
                    var value;
                    if (!_.isUndefined(values[test])) {
                        value = values[test];
                        check = control.compare(value, cond, cond_val);
                    }

                } else if (_.isArray(test)) {
                    check = true;
                    _.each(list, function (req) {
                        var cond_key = req[0];
                        var cond_cond = req[1];
                        var cond_val = req[2];
                        var t_val = values[cond_key];

                        if (_.isUndefined(t_val)) {
                            t_val = '';
                        }

                        if (!control.compare(t_val, cond_cond, cond_val)) {
                            check = false;
                        }
                    });

                }
            } catch (e) {
                check = false;
            }


            return check;
        },

        conditionize: function ($context) {
            var control = this;

            if ($context.hasClass('conditionized')) {
                return;
            }
            $context.addClass('conditionized');

            var $fields = $('.field--item', $context);

            $context.on('change condition_check', 'input, select, textarea', function (e) {

                var f = $('.form', $context);
                var data = $('input, textarea, select', f).serialize();
                data = jQuery.deparam(data);
                var fieldData = {};
                if (_.isObject(data)) {
                    _.each(data._items, function (value) {
                        fieldData = value;
                    });
                }

                $fields.each(function () {
                    var $field = $(this);
                    var check = true;
                    var req = $field.attr('data-cond') || false;

                    if (!_.isUndefined(req) && req) {
                        req = JSON.parse(req);
                        check = control.multiple_compare(req, fieldData);
                        if (!check) {
                            $field.hide().addClass('cond-hide').removeClass('cond-show');
                        } else {
                            $field.slideDown().removeClass('cond-hide').addClass('cond-show');
                        }
                    }
                });


            });

            /**
             * Current support one level only
             */
            $('input, select, textarea', $context).eq(0).trigger('condition_check');
        },

        remove_editor: function ($context) {
        },
        editor: function ($textarea) {
        },

        _init: function () {
            var control = this;
            var default_data = control.params.fields;

            var values;
            try {
                if (typeof control.params.value == 'string') {
                    values = JSON.parse(control.params.value);
                } else {
                    values = control.params.value;
                }
            } catch (e) {
                values = {};
            }

            var max_item = 0; // unlimited
            var limited_mg = control.params.limited_msg || '';

            if (!isNaN(parseInt(control.params.max_item))) {
                max_item = parseInt(control.params.max_item);
            }

            if (control.params.changeable === 'no') {
                // control.container.addClass( 'no-changeable' );
            }

            /**
             * Toggle show/hide item
             */
            control.container.on('click', '.widget .widget-action, .widget .repeat-control-close, .widget-title', function (e) {
                e.preventDefault();
                var p = $(this).closest('.widget');

                if (p.hasClass('explained')) {
                    //console.log( 'has: explained' );
                    $('.widget-inside', p).slideUp(200, 'linear', function () {
                        $('.widget-inside', p).removeClass('show').addClass('hide');
                        p.removeClass('explained');
                    });
                } else {
                    // console.log( 'No: explained' );
                    $('.widget-inside', p).slideDown(200, 'linear', function () {
                        $('.widget-inside', p).removeClass('hide').addClass('show');
                        p.addClass('explained');
                    });
                }
            });

            /**
             * Remove repeater item
             */
            control.container.on('click', '.repeat-control-remove', function (e) {
                e.preventDefault();
                var $context = $(this).closest('.repeatable-customize-control');
                $("body").trigger("repeat-control-remove-item", [$context]);
                control.remove_editor($context);
                $context.remove();
                control.rename();
                control.updateValue();
                control._check_max_item();
            });

            /**
             * Get customizer control data
             *
             * @returns {*}
             */
            control.getData = function () {
                var f = $('.form-data', control.container);
                var data = $('input, textarea, select', f).serialize();
                return JSON.stringify(data);
            };
            /**
             * Update repeater value
             */
            control.updateValue = function () {
                var data = control.getData();
                //$("[data-hidden-value]", control.container).val(data);
                //$("[data-hidden-value]", control.container).trigger('change');

                control.setting.set(data);
            };

            /**
             * Rename repeater item
             */
            control.rename = function () {
                $('.list-repeatable li', control.container).each(function (index) {
                    var li = $(this);
                    $('input, textarea, select', li).each(function () {
                        var input = $(this);
                        var name = input.attr('data-repeat-name') || undefined;
                        if (typeof name !== "undefined") {
                            name = name.replace(/__i__/g, index);
                            input.attr('name', name);
                        }
                    });

                });
            };


            if (!window._upload_fame) {
                window._upload_fame = wp.media({
                    title: wp.media.view.l10n.addMedia,
                    multiple: false,
                    //library: {type: 'all' },
                    //button : { text : 'Insert' }
                });
            }
            // backend figures out what html to send
            // javascript temp store data
            // when you save the javascript sends that data back to the backend
            // backend takes data and saves in a file called a database

            window._upload_fame.on('close', function () {
                
                // get selections and save to hidden input plus other AJAX stuff etc.
                var selection = window._upload_fame.state().get('selection');
                // console.log(selection);
            });

            window.media_current = {};
            window.media_btn = {};

            window._upload_fame.on('select', function () {
                // Grab our attachment selection and construct a JSON representation of the model.
                var media_attachment = window._upload_fame.state().get('selection').first().toJSON();
                $('.image_id', window.media_current).val(media_attachment.id);
                var preview, img_url;
                img_url = media_attachment.url;
                $('.current', window.media_current).removeClass('hide').addClass('show');
                $('.image_url', window.media_current).val(img_url);
                if (media_attachment.type == 'image') {
                    preview = '<img src="' + img_url + '" alt="">';
                    $('.thumbnail-image', window.media_current).html(preview);
                }
                $('.remove-button', window.media_current).show();
                $('.image_id', window.media_current).trigger('change');
                try {
                    window.media_btn.text(window.media_btn.attr('data-change-txt'));
                } catch (e) {

                }

            });


            control.handleMedia = function ($context) {
                $('.item-media', $context).each(function () {
                    var _item = $(this);
                    // when remove item
                    $('.remove-button', _item).on('click', function (e) {
                        e.preventDefault();
                        $('.image_id, .image_url', _item).val('');
                        $('.thumbnail-image', _item).html('');
                        $('.current', _item).removeClass('show').addClass('hide');
                        $(this).hide();
                        $('.upload-button', _item).text($('.upload-button', _item).attr('data-add-txt'));
                        $('.image_id', _item).trigger('change');
                    });

                    // when upload item
                    $('.upload-button, .attachment-media-view', _item).on('click', function (e) {
                        e.preventDefault();
                        window.media_current = _item;
                        window.media_btn = $(this);
                        window._upload_fame.open();
                    });
                });
            };

            /**
             * Init color picker
             *
             * @param $context
             */
            control.colorPicker = function ($context) {
                // Add Color Picker to all inputs that have 'color-field' class
                $('.c-color', $context).wpColorPicker({
                    change: function (event, ui) {
                        control.updateValue();
                    },
                    clear: function (event, ui) {
                        control.updateValue();
                    }
                });

                $('.c-coloralpha', $context).each(function () {
                    var input = $(this);
                    var c = input.val();
                    c = c.replace('#', '');
                    input.removeAttr('value');
                    input.prop('value', c);
                    input.alphaColorPicker({
                        change: function (event, ui) {
                            control.updateValue();
                        },
                        clear: function (event, ui) {
                            control.updateValue();
                        },
                    });
                });
            };

            /**
             * Live title events
             *
             * @param $context
             */
            control.actions = function ($context) {
                if (control.params.live_title_id) {

                    if (!$context.attr('data-title-format')) {
                        $context.attr('data-title-format', control.params.title_format);
                    }

                    var format = $context.attr('data-title-format') || '';
                    // Custom for special ID
                    if (control.id === 'onepress_section_order_styling') {
                        if ($context.find('input.add_by').val() !== 'click') {
                            format = '[live_title]';
                        }
                    }

                    // Live title
                    if (control.params.live_title_id && $("[data-live-id='" + control.params.live_title_id + "']", $context).length > 0) {
                        var v = '';

                        if ($("[data-live-id='" + control.params.live_title_id + "']", $context).is('.select-one')) {
                            v = $("[data-live-id='" + control.params.live_title_id + "']", $context).find('option:selected').eq(0).text();
                        } else {
                            v = $("[data-live-id='" + control.params.live_title_id + "']", $context).eq(0).val();
                        }

                        if (v == '') {
                            v = control.params.default_empty_title;
                        }

                        if (format !== '') {
                            v = format.replace('[live_title]', v);
                        }

                        $('.widget-title .live-title', $context).text(v);

                        $context.on('keyup change', "[data-live-id='" + control.params.live_title_id + "']", function () {
                            var v = '';

                            var format = $context.attr('data-title-format') || '';
                            // custom for special ID
                            if (control.id === 'onepress_section_order_styling') {
                                if ($context.find('input.add_by').val() !== 'click') {
                                    format = '[live_title]';
                                }
                            }

                            if ($(this).is('.select-one')) {
                                v = $(this).find('option:selected').eq(0).text();
                            } else {
                                v = $(this).val();
                            }

                            if (v == '') {
                                v = control.params.default_empty_title;
                            }

                            if (format !== '') {
                                v = format.replace('[live_title]', v);
                            }

                            $('.widget-title .live-title', $context).text(v);
                        });

                    } else {

                    }

                } else {
                    //$('.widget-title .live-title', $context).text( control.params.title_format );
                }

            };


            /**
             * Check limit number item
             *
             * @private
             */
            control._check_max_item = function () {
                var n = $('.list-repeatable > li.repeatable-customize-control', control.container).length;
                //console.log( n );
                if (n >= max_item) {
                    $('.repeatable-actions', control.container).hide();
                    if ($('.limited-msg', control.container).length <= 0) {
                        if (limited_mg !== '') {
                            var msg = $('<p class="limited-msg"/>');
                            msg.html(limited_mg);
                            msg.insertAfter($('.repeatable-actions', control.container));
                            msg.show();
                        }
                    } else {
                        $('.limited-msg', control.container).show();
                    }

                } else {
                    $('.repeatable-actions', control.container).show();
                    $('.limited-msg', control.container).hide();
                }
            };

            /**
             * Function that loads the Mustache template
             */
            control.repeaterTemplate = _.memoize(function () {
                var compiled,
                    /*
                     * Underscore's default ERB-style templates are incompatible with PHP
                     * when asp_tags is enabled, so WordPress uses Mustache-inspired templating syntax.
                     *
                     * @see trac ticket #22344.
                     */
                    options = {
                        evaluate: /<#([\s\S]+?)#>/g,
                        interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
                        escape: /\{\{([^\}]+?)\}\}(?!\})/g,
                        variable: 'data'
                    };

                return function (data) {
                    if (typeof window.repeater_item_tpl === "undefined") {
                        window.repeater_item_tpl = $('#repeatable-js-item-tpl').html();
                    }
                    compiled = _.template(window.repeater_item_tpl, null, options);
                    return compiled(data);
                };
            });
            control.template = control.repeaterTemplate();


            /**
             * Init item events
             *
             * @param $context
             */
            control.intItem = function ($context) {
                control.rename();
                control.conditionize($context);
                control.colorPicker($context);
                control.handleMedia($context);
                //Special check element
                $('[data-live-id="section_id"]', $context).each(function () {
                    $(this).closest('.repeatable-customize-control').addClass('section-' + $(this).val());
                    if ($(this).val() === 'map' || $(this).val()  === 'slider' ) {
                        $context.addClass('show-display-field-only');
                    }
                });

                // Custom for special IDs
                if (control.id === 'onepress_section_order_styling') {
                    if ($context.find('input.add_by').val() !== 'click') {
                        $context.addClass('no-changeable');
                        // Remove because we never use
                        $('.item-editor textarea', $context).remove();
                    } else {
                        $context.find('.item-title').removeClass('item-hidden ');
                        $context.find('.item-title input[type="hidden"]').attr('type', 'text');
                        $context.find('.item-section_id').removeClass('item-hidden ');
                        $context.find('.item-section_id input[type="hidden"]').attr('type', 'text');
                    }
                }

                // Setup editor
                $('.item-editor textarea', $context).each(function () {
                    control.editor($(this));
                });

                // Setup editor
                $('body').trigger('repeater-control-init-item', [$context]);

            };

            /**
             * Drag to sort items
             */
            $(".list-repeatable", control.container).sortable({
                handle: ".widget-title",
                //containment: ".customize-control-repeatable",
                containment: control.container,
                /// placeholder: "sortable-placeholder",
                update: function (event, ui) {
                    control.rename();
                    control.updateValue();
                }
            });


            /**
             * Create existing items
             * @changed 2.1.1
             */

            $.each(values, function (i, _values) {
                var _templateData = $.extend(true, {}, control.params.fields);
                _values = values[i];
                if (_values) {
                    for (var j in _values) {

                        if ( typeof _templateData[j] === "undefined"  ) {
                            _templateData[j] = {};
                        }

                        _templateData[j].value = _values[j];
                        /*
                        if (_templateData.hasOwnProperty(j) && _values.hasOwnProperty(j)) {
                            _templateData[j].value = _values[j];
                        }
                        */
                    }
                }

                var $html = $(control.template(_templateData));
                if ( control.id === 'onepress_section_order_styling') {
                    if (  typeof  _templateData.__visibility !== "undefined" ) {
                        if (  _templateData.__visibility.value === 'hidden' ) {
                            $html.addClass( 'visibility-hidden' );
                        }
                    }
                }


                $('.list-repeatable', control.container).append($html);
                control.intItem($html);
                control.actions($html);
            });


            /**
             * Add new item
             */
            control.container.on('click', '.add-new-repeat-item', function () {
                var $html = $(control.template(default_data));
                $('.list-repeatable', control.container).append($html);

                // add unique ID for section if id_key is set
                if (control.params.id_key !== '') {
                    $html.find('.item-' + control.params.id_key).find('input').val('sid' + (new Date().getTime()));
                }
                $html.find('input.add_by').val('click');

                control.intItem($html);
                control.actions($html);
                control.updateValue();
                control._check_max_item();
            });

            /**
             * Update repeater data when any events fire.
             */
            $('.list-repeatable', control.container).on('keyup change color_change', 'input, select, textarea', function (e) {
                control.updateValue();
            });

            control._check_max_item();

        }

    });

})(wp.customize, jQuery);

jQuery(window).ready(function ($) {

    if (typeof onepress_customizer_settings !== "undefined") {
        if (onepress_customizer_settings.number_action > 0) {
            $('.control-section-themes h3.accordion-section-title').append('<a class="theme-action-count" href="' + onepress_customizer_settings.action_url + '">' + onepress_customizer_settings.number_action + '</a>');
        }
    }

    /**
     * For Hero layout content settings
     */
    $('select[data-customize-setting-link="onepress_hero_layout"]').on('change on_custom_load', function () {
        var v = $(this).val() || '';

        $("li[id^='customize-control-onepress_hcl']").hide();
        $("li[id^='customize-control-onepress_hcl" + v + "']").show();

    });
    $('select[data-customize-setting-link="onepress_hero_layout"]').trigger('on_custom_load');


    /**
     * For Gallery content settings
     */
    $('select[data-customize-setting-link="onepress_gallery_source"]').on('change on_custom_load', function () {
        var v = $(this).val() || '';

        $("li[id^='customize-control-onepress_gallery_source_']").hide();
        $("li[id^='customize-control-onepress_gallery_api_']").hide();
        $("li[id^='customize-control-onepress_gallery_settings_']").hide();
        $("li[id^='customize-control-onepress_gallery_source_" + v + "']").show();
        $("li[id^='customize-control-onepress_gallery_api_" + v + "']").show();
        $("li[id^='customize-control-onepress_gallery_settings_" + v + "']").show();

    });

    $('select[data-customize-setting-link="onepress_gallery_source"]').trigger('on_custom_load');

    /**
     * For Gallery display settings
     */
    $('select[data-customize-setting-link="onepress_gallery_display"]').on('change on_custom_load', function () {
        var v = $(this).val() || '';
        switch (v) {
            case 'slider':
                $("#customize-control-onepress_g_row_height, #customize-control-onepress_g_col, #customize-control-onepress_g_spacing").hide();
                break;
            case 'justified':
                $("#customize-control-onepress_g_col, #customize-control-onepress_g_spacing").hide();
                $("#customize-control-onepress_g_row_height").show();
                break;
            case 'carousel':
                $("#customize-control-onepress_g_row_height, #customize-control-onepress_g_col").hide();
                $("#customize-control-onepress_g_col, #customize-control-onepress_g_spacing").show();
                break;
            case 'masonry':
                $("#customize-control-onepress_g_row_height").hide();
                $("#customize-control-onepress_g_col, #customize-control-onepress_g_spacing").show();
                break;
            default:
                $("#customize-control-onepress_g_row_height").hide();
                $("#customize-control-onepress_g_col, #customize-control-onepress_g_spacing").show();

        }

    });
    $('select[data-customize-setting-link="onepress_gallery_display"]').trigger('on_custom_load');

});
