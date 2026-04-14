<?php
/**
 * Plugin Name: Frame Configurator
 * Plugin URI: https://github.com/mohamedaminejlilia-beep/Creez-votre-cadre
 * Description: Embeds the React/Vite frame configurator with the [frame_configurator] shortcode and a full-page /frame-configurator route.
 * Version: 1.1.0
 * Author: Mohamed Amine Jlilia
 * License: GPL2+
 */

if (!defined('ABSPATH')) {
    exit;
}

define('FRAME_CONFIGURATOR_ROUTE', 'frame-configurator');
define('FRAME_CONFIGURATOR_REWRITE_VERSION', '1.1.0');

function frame_configurator_manifest_path() {
    return plugin_dir_path(__FILE__) . 'dist/manifest.json';
}

function frame_configurator_manifest() {
    static $manifest = null;

    if ($manifest !== null) {
        return $manifest;
    }

    $manifest_path = frame_configurator_manifest_path();

    if (!file_exists($manifest_path)) {
        $manifest = array();
        return $manifest;
    }

    $manifest_contents = file_get_contents($manifest_path);
    $decoded_manifest = json_decode($manifest_contents, true);
    $manifest = is_array($decoded_manifest) ? $decoded_manifest : array();

    return $manifest;
}

function frame_configurator_entry_assets() {
    $manifest = frame_configurator_manifest();
    $entry = null;

    if (isset($manifest['src/main.tsx'])) {
        $entry = $manifest['src/main.tsx'];
    } elseif (isset($manifest['index.html'])) {
        $entry = $manifest['index.html'];
    }

    if (!$entry || empty($entry['file'])) {
        return null;
    }

    $plugin_url = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);
    $script_relative_path = 'dist/' . ltrim($entry['file'], '/');
    $script_path = $plugin_path . $script_relative_path;

    $styles = array();

    if (!empty($entry['css']) && is_array($entry['css'])) {
        foreach ($entry['css'] as $index => $css_file) {
            $css_relative_path = 'dist/' . ltrim($css_file, '/');
            $styles[] = array(
                'handle' => 'frame-configurator-style-' . $index,
                'url' => $plugin_url . $css_relative_path,
                'path' => $plugin_path . $css_relative_path,
            );
        }
    }

    return array(
        'script_handle' => 'frame-configurator-app',
        'script_url' => $plugin_url . $script_relative_path,
        'script_path' => $script_path,
        'styles' => $styles,
        'asset_base_url' => untrailingslashit($plugin_url . 'dist'),
    );
}

function frame_configurator_enqueue_assets() {
    $assets = frame_configurator_entry_assets();

    if (!$assets) {
        return null;
    }

    foreach ($assets['styles'] as $style) {
        wp_enqueue_style($style['handle']);
    }

    wp_enqueue_script($assets['script_handle']);

    wp_add_inline_script(
        $assets['script_handle'],
        'window.FRAME_CONFIGURATOR_CONFIG = ' . wp_json_encode(array(
            'assetBaseUrl' => $assets['asset_base_url'],
        )) . ';',
        'before'
    );

    return $assets;
}

function frame_configurator_render_mount_node() {
    return '<div id="frame-configurator-root" data-frame-configurator-root></div>';
}

function frame_configurator_register_assets() {
    $assets = frame_configurator_entry_assets();

    if (!$assets) {
        return;
    }

    wp_register_script(
        $assets['script_handle'],
        $assets['script_url'],
        array(),
        file_exists($assets['script_path']) ? filemtime($assets['script_path']) : null,
        true
    );

    foreach ($assets['styles'] as $style) {
        wp_register_style(
            $style['handle'],
            $style['url'],
            array(),
            file_exists($style['path']) ? filemtime($style['path']) : null
        );
    }
}
add_action('wp_enqueue_scripts', 'frame_configurator_register_assets');

function frame_configurator_register_route() {
    add_rewrite_rule('^' . FRAME_CONFIGURATOR_ROUTE . '/?$', 'index.php?frame_configurator_app=1', 'top');
}
add_action('init', 'frame_configurator_register_route');

function frame_configurator_register_query_var($vars) {
    $vars[] = 'frame_configurator_app';
    return $vars;
}
add_filter('query_vars', 'frame_configurator_register_query_var');

function frame_configurator_maybe_flush_rewrite_rules() {
    if (get_option('frame_configurator_rewrite_version') === FRAME_CONFIGURATOR_REWRITE_VERSION) {
        return;
    }

    frame_configurator_register_route();
    flush_rewrite_rules(false);
    update_option('frame_configurator_rewrite_version', FRAME_CONFIGURATOR_REWRITE_VERSION);
}
add_action('init', 'frame_configurator_maybe_flush_rewrite_rules', 20);

function frame_configurator_activate() {
    frame_configurator_register_route();
    flush_rewrite_rules(false);
    update_option('frame_configurator_rewrite_version', FRAME_CONFIGURATOR_REWRITE_VERSION);
}
register_activation_hook(__FILE__, 'frame_configurator_activate');

function frame_configurator_deactivate() {
    flush_rewrite_rules(false);
}
register_deactivation_hook(__FILE__, 'frame_configurator_deactivate');

function frame_configurator_render_full_page() {
    $assets = frame_configurator_enqueue_assets();

    if (!$assets) {
        wp_die('Frame Configurator build assets are missing. Run the production build and copy the generated dist folder into this plugin.');
    }

    status_header(200);
    nocache_headers();
    ?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo esc_html(get_bloginfo('name') . ' - Frame Configurator'); ?></title>
    <script>
        window.FRAME_CONFIGURATOR_CONFIG = <?php echo wp_json_encode(array(
            'assetBaseUrl' => $assets['asset_base_url'],
        )); ?>;
    </script>
    <?php wp_head(); ?>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background: #fff;
        }

        #frame-configurator-root {
            min-height: 100vh;
        }
    </style>
</head>
<body class="frame-configurator-app-page">
    <?php wp_body_open(); ?>
    <?php echo frame_configurator_render_mount_node(); ?>
    <?php wp_footer(); ?>
</body>
</html>
<?php
    exit;
}

function frame_configurator_template_redirect() {
    if (!get_query_var('frame_configurator_app')) {
        return;
    }

    frame_configurator_render_full_page();
}
add_action('template_redirect', 'frame_configurator_template_redirect');

function frame_configurator_shortcode($atts = array()) {
    $assets = frame_configurator_enqueue_assets();

    if (!$assets) {
        return '<div class="frame-configurator-missing-assets">Frame Configurator build assets are missing. Run the production build and copy the generated dist folder into this plugin.</div>';
    }

    return frame_configurator_render_mount_node();
}
add_shortcode('frame_configurator', 'frame_configurator_shortcode');
