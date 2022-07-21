---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rouge.js
 # Liquid template to adapt J1 Highlighter (Rouge)
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rouge.js
 # J1 Adapter for rouge
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Note:
 #  https://github.com/jirutka/asciidoctor-rouge/issues/9
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.rouge = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment             = '{{environment}}';
  var moduleOptions           = {};
  var user_state              = {};
  var cookie_names            = j1.getCookieNames();
  var cookie_user_state_name  = cookie_names.user_state;
  var user_state_detected;
  var themeCss;
  var _this;
  var logger;
  var logText;
  var darkTheme;

  var templateOptions = $.extend({}, {{template_config | replace: 'nil', 'null' | replace: '=>', ':' }});

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // helper functions
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.rouge',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rouge;
      logger  = log4javascript.getLogger('j1.adapter.rouge');


      // -----------------------------------------------------------------------
      // rouge initializer
      // -----------------------------------------------------------------------

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // Detect|Set J1 UserState
          user_state_detected = j1.existsCookie(cookie_user_state_name);
          if (user_state_detected) {
            user_state  = j1.readCookie(cookie_user_state_name);
            themeCss    = user_state.theme_css;
            darkTheme   = themeCss.includes('dark') ||
                          themeCss.includes('cyborg') ||
                          themeCss.includes('darkly') ||
                          themeCss.includes('slate') ||
                          themeCss.includes('superhero');
          } else {
            log_text = '\n' + 'user_state cookie not found';
            logger.warn(log_text);
          }

          $('.dropdown-menu a').click(function(){
            $('#selected-theme').html('Current selection: <div class="md-gray-900 mt-1 p-2" style="background-color: #BDBDBD; font-weight: 700;">' +$(this).text() + '</div>');
          });

          // disable (Google) translation for all highlight HTML elements
          // used for rouge
          // see: https://www.codingexercises.com/replace-all-instances-of-css-class-in-vanilla-js
          //
          var highlight = document.getElementsByClassName('highlight');
          [...highlight].forEach(function(x) {
           if (!x.className.includes('notranslate')) {
             x.className += " notranslate"
           }
          });

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

      var dependencies_met_rouge_theme_loaded = setInterval (function () {
        if (j1.adapter.rouge.getState() === 'finished') {
          if ( darkTheme ) {
            j1.adapter.rouge.reaplyStyles(templateOptions.rouge.theme_dark);
          } else {
            j1.adapter.rouge.reaplyStyles(templateOptions.rouge.theme_light);
          }
          clearInterval(dependencies_met_rouge_theme_loaded);
        }
      }, 25); // END 'dependencies_met_rouge_theme_loaded'

    }, // END init

    // -------------------------------------------------------------------------
    // load|apply new rouge theme
    // -------------------------------------------------------------------------
    reaplyStyles: function (themename) {
      _this.removeAllRougeStyles();
      _this.addStyle(themename);
      return true;
    },

    // -------------------------------------------------------------------------
    // remove existing rouge theme CSS (from section <head>)
    // -------------------------------------------------------------------------
    removeAllRougeStyles: function () {
      $('link[rel=stylesheet][href*="/assets/themes/j1/modules/rouge"]').remove();
    },

    // -------------------------------------------------------------------------
    // add rouge theme CSS (to section <head>)
    // -------------------------------------------------------------------------
    addStyle: function (themename) {
      $('<link>').attr('rel','stylesheet')
      .attr('type','text/css')
      .attr('href','/assets/themes/j1/modules/rouge/css/' +themename+ '/theme.css')
      .appendTo('head');
    },

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info('\n' + message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // Sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return _this.state;
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
