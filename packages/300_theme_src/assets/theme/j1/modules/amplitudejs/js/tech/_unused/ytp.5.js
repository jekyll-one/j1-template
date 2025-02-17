---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js
 # AmplitudeJS V5 Plugin|Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  amplitude_options:  {{ amplitude_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_defaults  = modules.defaults.amplitude.defaults %}
{% assign amplitude_settings  = modules.amplitude.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_options   = amplitude_defaults | merge: amplitude_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js
 # AmplitudeJS V5 Plugin|Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

// date|time monitoring
//------------------------------------------------------------------------------
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

// YT API settings
// -----------------------------------------------------------------------------
const YT_PLAYER_STATE = {
  UNSTARTED:  -1,
  ENDED:       0,
  PLAYING:     1,
  PAUSED:      2,
  BUFFERING:   3,
  CUED:        5
};

var firstScriptTag;
var ytPlayer;
var ytPlayerReady     = false;
var ytApiReady        = false;
var logger            = log4javascript.getLogger('j1.adapter.amplitude.tech');

// YT Player settings data (created dynamically)
// -----------------------------------------------------------------------------
var ytPlayers         = {};
var ytPlayersMap      = new Map();

// AmplitudeJS API settings
// -----------------------------------------------------------------------------

var dependency;
var playerCounter     = 0;
var load_dependencies = {};

var ytpSongIndex      = "0";
var ytpAutoPlay       = false;
var ytpLoop           = true;
var playLists         = {};
var playersUILoaded   = { state: false };
var apiInitialized    = { state: false };
var amplitudeDefaults = $.extend({}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeSettings = $.extend({}, {{amplitude_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeOptions  = $.extend(true, {}, amplitudeDefaults, amplitudeSettings);

var playList;
var playerID;
var playerType;
var playListTitle;
var playListName;
var amplitudePlayerState;
var ytPlayer;
var ytpPlaybackRate

var playlist;
var songMetaData;
var songURL;
var songIndex;
var progress;


  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------

  ytpInit(amplitudeOptions);

  var dependencies_ytp_ready = setInterval (() => {
    var ytApiReady    = (j1.adapter.amplitude['ytApiReady']    !== undefined) ? j1.adapter.amplitude['ytApiReady']    : false;
    var ytPlayerReady = (j1.adapter.amplitude['ytPlayerReady'] !== undefined) ? j1.adapter.amplitude['ytPlayerReady'] : false;

    if (ytApiReady && ytPlayerReady) {
      mimikYTPlayerUiEventsForAJS();

      clearInterval(dependencies_ytp_ready);
    } // END if

  }, 10); // END dependencies_ytp_ready


  // TODO: load individual player settings if multiple players in page
  function ytpInit (options) {
    var settings = options;

    // -------------------------------------------------------------------------
    // main
    // -------------------------------------------------------------------------
    startTimeModule = Date.now();

    logger.info('\n' + 'Initialize plugin|tech (ytp) : started');

    // Load YT IFrame Player API asynchronously
    // -------------------------------------------------------------------------
    var tag         = document.createElement('script');
    tag.src         = "//youtube.com/iframe_api";
    firstScriptTag  = document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  } // END ytpInit()


  // ---------------------------------------------------------------------------
  // Base YTP functions
  // ---------------------------------------------------------------------------

  // Create an <iframe> player after the YT API downloaded|isReady
  // ---------------------------------------------------------------------------
  function onYouTubeIframeAPIReady() {
    ytApiReady = true;

    // var currentOptions =  $.extend({}, {{amplitude_options | replace: 'nil', 'null' | replace: '=>', ':' }});

    {% for player in amplitude_options.players %} {% if player.enabled %}
    {% capture xhr_container_id %}{{player.id}}_parent{% endcapture %}

    {% if player.source == empty %}
      {% assign player_source = amplitude_defaults.player.source %}
    {% else %}
      {% assign player_source = player.source %}
    {% endif %}

    {% if player_source == 'video' %}

      // load players of type 'video that are configured in current page
      //
      var playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
      if (playerExistsInPage) {
        // var currentPlayerSettings =  $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }});        
        var activeSongMetadata = Amplitude.getActiveSongMetadata();
        // var playerPlaylist      = $.extend({}, {{player.playlist | replace: 'nil', 'null' | replace: '=>', ':' }}); 
        // var activePlaylist      = playerPlaylist.name;
        

        // load individual player settings (to manage multiple players in page)
        //
        var ytpVideoID          = activeSongMetadata.url.split('=')[1];
        var ytpAutoPlay         = ('{{player.yt_player.autoplay}}'.length > 0) ? '{{player.yt_player.autoplay}}'  : '{{amplitude_defaults.player.yt_player.autoplay}}';
        var ytpLoop             = ('{{player.yt_player.loop}}'.length > 0)     ? '{{player.yt_player.loop}}'      : '{{amplitude_defaults.player.yt_player.loop}}';
        var ytpHeight           = ('{{player.yt_player.height}}'.length > 0)   ? '{{player.yt_player.height}}'    : '{{amplitude_defaults.player.yt_player.height}}';
        var ytpWidth            = ('{{player.yt_player.width}}'.length > 0)    ? '{{player.yt_player.width}}'     : '{{amplitude_defaults.player.yt_player.width}}';

        playerCounter++;

        // update ytPlayers
        // ytPlayers = {
        //   numPlayers: playerCounter,
        //   '{{player.id}}': {{player.id}}
        // };

        logger.info('\n' + 'AJS YouTube iFrame API: ready');
        logger.info('\n' + 'configure player on ID: #{{player.id}}');

        // create a hidden YT Player iFrame container
        //
        var ytpContainer            = document.getElementById('{{player.id}}_video');
        ytpContainer.innerHTML      = '<div id="iframe_{{player.id}}"></div>';
        ytpContainer.style.cssText  = 'display:none';

        ytPlayer = new YT.Player('iframe_{{player.id}}', {
          height:             ytpHeight,
          width:              ytpWidth,
          videoId:            ytpVideoID,
          playerVars: {
            autoplay:         ytpAutoPlay,
            loop:             ytpLoop
          },
          events: {
            'onReady':        {{player.id}}OnPlayerReady,
            'onStateChange':  {{player.id}}OnPlayerStateChange
          }
        });

        // save YT API state for later use
        j1.adapter.amplitude['ytApiReady'] = ytApiReady;

      } // END if playerExistsInPage()

      // run base YT player initialization (on ready state)
      // -----------------------------------------------------------------------
      function {{player.id}}OnPlayerReady(event) {
        logger.info('\n' + 'AJS YouTube Player: ready');

        // save YT player references for later use
        j1.adapter.amplitude['ytPlayerReady'] = true;
        j1.adapter.amplitude['ytPlayer']      = ytPlayer; 

        endTimeModule = Date.now();
        logger.info('\n' + 'Initialize plugin|tech (ytp) : finished');
        logger.info('\n' + 'plugin|tech initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

      } // END onPlayerReady()

      // update YT player elements on state change (playing)
      // ---------------------------------------------------------------------------
      function {{player.id}}OnPlayerStateChange(event) {

        // When YTP is playing, update progressBar every second
        //
        if (event.data === YT_PLAYER_STATE.PLAYING) {
          setInterval(updateProgressBarsYTP, 1000);
        }

      } // END onPlayerStateChange()

    {% endif %} {% endif %} {% endfor %}

  } // END onYouTubeIframeAPIReady ()

 
  // ---------------------------------------------------------------------------
  // Base AJS Player functions
  // ---------------------------------------------------------------------------

  // Returns the position as a percentage the user clicked in player progressbar
  // NOTE: The percentage is out of [0 .. 1]
  // ---------------------------------------------------------------------------
  function getProgressBarSelectedPositionPercentage (event, progessBar) {
    var offset     = progessBar.getBoundingClientRect();
    var xpos       = event.pageX - offset.left;
    var percentage = (parseFloat(xpos) / parseFloat(progessBar.offsetWidth)).toFixed(2);

    return percentage;
  }

  // Returns the time in seconds calculated from a percentage value ([0 .. 1])
  // ---------------------------------------------------------------------------
  function getTimeFromPercentage (player, percentage) {
    var videoDuration = ytpGetDuration(player);
    var time          = parseFloat((videoDuration * percentage).toFixed(2));

    return time;
  }

  // Update YTP specific progress data
  // ---------------------------------------------------------------------------
  function updateProgressBarsYTP() {
    var progress;
    var progressBar = j1.adapter.amplitude['ytPlayerProgressBar'];
    
    // calc procent value (float, 2 decimals [0.00 .. 1.00])
    progress = parseFloat((ytPlayer.getCurrentTime() / ytPlayer.getDuration()).toFixed(2));
    
    // save YT player progress data for later use (e.g. events)
    j1.adapter.amplitude['ytPlayerProgress'] = progress;

    progressBar.value = progress;
  }


  // ---------------------------------------------------------------------------
  // Mimik base AJS API functions
  // ---------------------------------------------------------------------------

  // Skip video to a time specified by time
  // ---------------------------------------------------------------------------
  function ytpSeekTo(player, time) {
    player.seekTo(time, true);
  }

  // Returns the buffered percentage of the playing video
  // ---------------------------------------------------------------------------
  function ytpGetBuffered (player) {
  }

  // Returns the percentage of the video played
  // ---------------------------------------------------------------------------
  function ytpGetPlayedPercentage (player) {
  }

  // Returns the actual video element
  // ---------------------------------------------------------------------------
  function ytpGetAudio (player) {
  }

  // Returns available playback speeds for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeeds (player) {
  }

  // Returns the current playback speed for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeed (player) {
  }

  // Returns the current state of the player
  // ---------------------------------------------------------------------------
  function ytpGetPlayerState (player) {
  }

  // Returns the duration of the current video
  // ---------------------------------------------------------------------------
  function ytpGetDuration (player) {
    var duration = player.getDuration();

    return duration;
  }

  // Returns the current seconds the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentTime (player) {
  }

  // Returns the current hours the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentHours (player) {
  }

  // Returns the current minutes the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentMinutes (player) {
  }

  // Returns the current seconds the user is into the video
  //
  function ytpGetCurrentSeconds (player) {
  }


  // ---------------------------------------------------------------------------
  // mimikYTPlayerUiEventsForAJS
  // Overload AJS button events for YT video (large player)
  // ---------------------------------------------------------------------------

  function mimikYTPlayerUiEventsForAJS(ytPlayer) {
    var largePlayerSkipForwardButtons   = document.getElementsByClassName("large-player-skip-forward");
    var largePlayerSkipBackwardButtons  = document.getElementsByClassName("large-player-skip-backward");
    var largePlayerPlayPauseButton      = document.getElementById('large_player_play_pause');

    // Overload AJS play_pause button for YT
    if (largePlayerPlayPauseButton) {

      largePlayerPlayPauseButton.addEventListener('click', function(event) {
        playlist      = this.getAttribute("data-amplitude-playlist");
        songMetaData  = Amplitude.getSongAtIndex(ytpSongIndex);
        songURL       = songMetaData.url;
        songIndex     = ytpSongIndex;

        ytPlayer          = j1.adapter.amplitude['ytPlayer'];
        ytpPlaybackRate   = ytPlayer.getPlaybackRate();

        // toggle YT play|pause video
        if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING || ytPlayer.getPlayerState() === YT_PLAYER_STATE.BUFFERING) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }

        // toggle AJS play_pause button
        if (largePlayerPlayPauseButton.classList.contains('amplitude-paused')) {
          largePlayerPlayPauseButton.classList.remove('amplitude-paused');
          largePlayerPlayPauseButton.classList.add('amplitude-playing');
        } else {
          largePlayerPlayPauseButton.classList.remove('amplitude-playing');
          largePlayerPlayPauseButton.classList.add('amplitude-paused');
        }

        event.preventDefault();
      }); // END EventListener largePlayerPlayPauseButton 'click'
    } // END if largePlayerPlayPauseButton

    // Overload AJS largePlayerSkipBackwardButtons button for YT
      for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
      // TODO: load individual player settings if multiple players in page
      //
      var playerForwardBackwardSkipSeconds = 10;
      //  if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
          // TODO: Fix for multiple players in page
          if (largePlayerSkipForwardButtons[i].id) {
            largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
              var ytPlayer = j1.adapter.amplitude['ytPlayer'];
              if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
                var currentTime  = ytPlayer.getCurrentTime();
                const skipOffset = parseFloat(playerForwardBackwardSkipSeconds);
                
                ytPlayer.seekTo(currentTime + skipOffset, true)

                //const duration    = Amplitude.getSongDuration();
                //const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                //const targetTime  = parseFloat(currentTime + skipOffset);

                // if (currentTime > 0) {
                //   Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                // }
              }

              event.preventDefault();
            }); // END Listener 'click' (SkipForwardButtons)
          } // END if largePlayerSkipForwardButtons
        } // END for  
  //    END if skip-forward_{{player.id}}

    // Overload AJS largePlayerSkipBackwardButtons button for YT
    for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
      //  if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
          // TODO: Fix for multiple players in page
          if (largePlayerSkipBackwardButtons[i].id) {
            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event) {
              var ytPlayer = j1.adapter.amplitude['ytPlayer'];
              if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
                var currentTime  = ytPlayer.getCurrentTime();
                const skipOffset = parseFloat(playerForwardBackwardSkipSeconds);
                
                ytPlayer.seekTo(currentTime - skipOffset, true)

                //const duration    = Amplitude.getSongDuration();
                //const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                //const targetTime  = parseFloat(currentTime + skipOffset);

                // if (currentTime > 0) {
                //   Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                // }
              }
              event.preventDefault();
            }); // END Listener 'click' (SkipForwardButtons)
          } // END if largePlayerSkipBackwardButton
        } // END for  
  //    END if skip-forward_{{player.id}}

        // click on next button
        // TODO: Fix for multiple players in page
        // -----------------------------------------------------------------------
        var largePlayerNextButton = document.getElementById('large_player_next');
        if (largePlayerNextButton) {
          largePlayerNextButton.addEventListener('click', function(event) {
            var playlist  = this.getAttribute("data-amplitude-playlist");
            var songIndex = ytpSongIndex;                                         // Amplitude.getActiveIndex();
          }); // END EventListener 'click'
        }

        // click on song container
        // TODO: Fix for multiple players in page
        // -----------------------------------------------------------------------
        var largetPlayerSongContainer = document.getElementsByClassName("song amplitude-song-container");
        for (var i=0; i<largetPlayerSongContainer.length; i++) {
          largetPlayerSongContainer[i].addEventListener('click', function(event) {
            var playlist        = this.getAttribute("data-amplitude-playlist");
            var playlistLength  = largetPlayerSongContainer.length;
            ytpSongIndex        = this.getAttribute("data-amplitude-song-index");
          }); // END EventListener 'click'
        } // END for

        // add listeners to all progress bars found
        // TODO: Fix for multiple players in page
        // -----------------------------------------------------------------------
        var progressBars = document.getElementsByClassName("large-player-progress");
        for (var i=0; i<progressBars.length; i++) {
          j1.adapter.amplitude['ytPlayerProgressBar'] = progressBars[i];
          progressBars[i].addEventListener('click', function(event) {
            if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
              var progressBar = this;
              var percentage  = getProgressBarSelectedPositionPercentage(event, progressBar);
              var time        = getTimeFromPercentage(ytPlayer, percentage);

              ytpSeekTo(ytPlayer, time);
            } // END if playing

            event.preventDefault();
          }); // END EventListener 'click'
        } // END for

  } // END mimikYTPlayerUiEventsForAJS

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}