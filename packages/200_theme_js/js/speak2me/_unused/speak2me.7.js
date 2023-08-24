/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/speak2me/js/speak2me.js
 # speak2me v.1.0 implementation (based on Articulate.js) for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/acoti/articulate.js/tree/master
 #
 # Copyright (C) 2023 Juergen Adams
 # Copyright (C) 2017 Adam Coti
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # Articulate is licensed under the MIT License.
 # See: https://github.com/acoti/articulate.js/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Articulate.js (1.1.0). (C) 2017 Adam Coti.
  MIT @license: en.wikipedia.org/wiki/MIT_License
  See Github page at: https://github.com/acoti/articulate.js
  See Web site at: http://articulate.purefreedom.com
*/

(function($) {
  'use strict';

  var defaultOptions      = require('./default-options.js');
  var customOptions       = {};
  var myOptions           = {};

  var ParseContent        = require('./parse-content.js');
  var parseContent        = ParseContent(defaultOptions);

  var ignoreTagsUser      = new Array();
  var recognizeTagsUser   = new Array();
  var replacements        = new Array();
  var customTags          = new Array();
  var voices              = new Array();
  var headingsArray       = [];

  var rateDefault         = 0.9;
  var pitchDefault        = 1;
  var volumeDefault       = 0.9;
  var rate                = rateDefault;
  var pitch               = pitchDefault;
  var volume              = volumeDefault;
  var pageScanCycle       = 1000;
  var pageScanLines       = 10000;
  var linesCorrection     = 5000;

  var currentTranslation  = getCookie('googtrans');

  var voiceUserDefault    = 'Google UK English Female';
  var voiceChromeDefault  = 'Google US English';
  var ignoreProvider      = 'Microsoft';
  var preferredVoice      = 'Natural';
  var pause_spoken        = '. ';
  var element_not_spoken  = ', this element is not spoken. ';

  var isEdge              = /Edg/i.test( navigator.userAgent );
  var chrome              = /chrome/i.test( navigator.userAgent );
  var isChrome            = ((chrome) && (!isEdge));

  var voiceLanguageGoogleDefault = {
    'de-DE':  'Google Deutsch',
    'en-US':  'Google US English',
    'en-GB':  'Google UK English Female',
    'es-ES':  'Google español',
    'fr-FR':  'Google français',
//  'hi-IN':  'Google हिन्दी',
//  'id-ID':  'Google Bahasa Indonesia',
    'it-IT':  'Google italiano',
//  'jp-JP':  'Google 日本語',
//  'ko-KR':  'Google 한국의',
    'nl-NL':  'Google Nederlands',
    'pl-PL':  'Google polski',
//  'pt-BR':  'Google português do Brasil',
    'pt-PT':  'Google português do Brasil',
//  'ru-RU':  'Google русский',
//  'zh-CN':  'Google 普通话（中国大陆)',
  };

  var voiceLanguageMicrosoftDefault = {
    'sq-AL':  'Microsoft Anila Online (Natural) - Albanian (Albania)',
    'ar-EG':  'Microsoft Salma Online (Natural) - Arabic (Egypt)',
    'bg-BG':  'Microsoft Kalina Online (Natural) - Bulgarian (Bulgaria)',
    'zh-CN':  'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
    'hr-HR':  'Microsoft Gabrijela Online (Natural) - Croatian (Croatia)',
    'cs-CZ':  'Microsoft Antonin Online (Natural) - Czech (Czech)',
    'da-DK':  'Microsoft Christel Online (Natural) - Danish (Denmark)',
    'nl-NL':  'Microsoft Colette Online (Natural) - Dutch (Netherlands)',
    'en-GB':  'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'en-US':  'Microsoft Aria Online (Natural) - English (United States)',
    'et-EE':  'Microsoft Anu Online (Natural) - Estonian (Estonia)',
    'fi-FI':  'Microsoft Noora Online (Natural) - Finnish (Finland)',
    'fr-FR':  'Microsoft Denise Online (Natural) - French (France)',
    'ka-GE':  'Microsoft Giorgi Online (Natural) - Georgian (Georgia)',
    'de-DE':  'Microsoft Katja Online (Natural) - German (Germany)',
    'el-GR':  'Microsoft Athina Online (Natural) - Greek (Greece)',
    'he-IL':  'Microsoft Avri Online (Natural) - Hebrew (Israel)',
    'hi-IN':  'Microsoft Madhur Online (Natural) - Hindi (India)',
    'hu-HU':  'Microsoft Noemi Online (Natural) - Hungarian (Hungary)',
    'it-IT':  'Microsoft Elsa Online (Natural) - Italian (Italy)',
    'ja-JP':  'Microsoft Nanami Online (Natural) - Japanese (Japan)',
  };

  var chunkCounter        = 0;

  var speechCycle         = 10;
  var speechMonitorCycle  = 10;
  var textSliceLength     = 30;

  var userStoppedSpeaking = false;
  var scrollOnce          = true;

  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;
  var currentLanguage;
  var voiceLanguageDefault;
  var chunkCounterMax;
  var user_session;
  var scanFinished;
  var $currentSection;

  // -------------------------------------------------------------------------
  // Internal functions
  // -------------------------------------------------------------------------

  // jadams
  // see: https://stackoverflow.com/questions/3163615/how-to-scroll-an-html-page-to-a-given-anchor
  // see: https://stackoverflow.com/questions/22154129/how-to-make-setinterval-behave-more-in-sync-or-how-to-use-settimeout-instea
  //
  function scanPage(options) {
    var line = 0;
    var lines;

    function scanSection(counter) {
      // because of the current translation in progress, the length
      // of a page may change to higher or lower values (asian)
      //
      lines = Math.max (
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      $('#content').attr("style", "opacity: .3");

      if (line < lines) {
        setTimeout(function() {
          counter++;
          line = line + pageScanLines;
          window.scrollTo({top: line, behavior: 'smooth'});
          scanSection(counter);
        }, pageScanCycle);
      } else {
        setTimeout(function() {
          scanFinished = true;
          $('#content').attr("style", "opacity: 1");
          $(window).scrollTop(0);
        }, pageScanCycle);
      }
    }
    scanSection(0);
  }

  function extend () {
    var target = {}
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target;
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        var value = c.substring(nameEQ.length, c.length);
        return value;
      }
    }
    return undefined;
  }

  function voiceTag(prepend,append) {
    this.prepend = prepend;
    this.append = append;
  }

  function voiceObj(name,language) {
    this.name = name;
    this.language = language;
  }

  // This populates the "voices" array with objects that represent the
  // available voices in the current browser. Each object has two
  // properties: name and language. It is loaded asynchronously in
  // deference to Chrome.
  //
  function populateVoiceList() {
    var systemVoices = speechSynthesis.getVoices();

    for(var i = 0; i<systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
    }
  }
  populateVoiceList();

  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // After checking for compatability, define the utterance object and
  // then cancel the speech immediately even though nothing is yet spoken.
  // This is to fix a quirk in Windows Chrome.
  //
  if ('speechSynthesis' in window) {
    var speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }

  if ( currentTranslation === undefined ) {
      currentLanguage = 'en-US'
  } else {
    var translation = currentTranslation.split('/');
    if ( translation[2] == 'en') {
      currentLanguage = 'en-GB';
    } else if ( translation[2].includes('ar') ) {
      currentLanguage = 'ar-EG';
    } else if ( translation[2].includes('cs') ) {
      currentLanguage = 'cs-CZ';
    } else if ( translation[2].includes('da') ) {
      currentLanguage = 'da-DK';
    } else if ( translation[2].includes('en') ) {
      currentLanguage = 'en-UK';
    } else if ( translation[2].includes('et') ) {
      currentLanguage = 'et-EE';
    } else if ( translation[2].includes('ka') ) {
      currentLanguage = 'ka-GE';
    } else if ( translation[2].includes('el') ) {
      currentLanguage = 'el-GR';
    } else if ( translation[2].includes('iw') ) {
      currentLanguage = 'he-IL';
    } else if ( translation[2].includes('hi') ) {
      currentLanguage = 'hi-IN';
    } else if ( translation[2].includes('ja') ) {
      currentLanguage = 'ja-JP';
    } else if ( translation[2].includes('zh') ) {
      currentLanguage = 'zh-CN';
    } else {
      currentLanguage = translation[2] + '-' + translation[2].toUpperCase();
    }
  }

  if (isChrome) {
    var voiceLanguageDefault = voiceLanguageGoogleDefault[currentLanguage];
  }

  if (isEdge) {
    var voiceLanguageDefault = voiceLanguageMicrosoftDefault[currentLanguage];
  }

  // Return if no headings are found.
  // if (headingsArray === null) {
  //   return
  // }

  // -------------------------------------------------------------------------
  // Public functions (methods)
  // -------------------------------------------------------------------------
  //
  var methods = {

    speak: function(options) {
        var opts      = $.extend( {}, $.fn.speak2me.defaults, options );
        var toSpeak   = '';
        var voiceTags = new Array();
        var _this     = this;
        var obj, processed, finished;
        var ignoreTags;

        scanFinished  = false;
        myOptions     = extend(defaultOptions, customOptions || {});

        // Get headings array
        // Merge defaults with user options.
        // Set to options variable at the top
//      headingsArray = parseContent.selectHeadings(myOptions.contentSelector, myOptions.headingSelector);
//      headingsArray = parseContent.selectHeadings(defaultOptions.contentSelector, defaultOptions.headingSelector);

        if (currentTranslation !== undefined) {
          scanPage();
        } else {
          scanFinished = true;
        }

        // Default values
        //
        voiceTags['a']                = new voiceTag('clicking the link', pause_spoken);
        voiceTags['q']                = new voiceTag('', pause_spoken);
        voiceTags['ol']               = new voiceTag('Start of list.', 'End of list.');
        voiceTags['ul']               = new voiceTag(' . Start of list.', 'End of list.');
        voiceTags['dl']               = new voiceTag('Start of list.', 'End of list.');

//      voiceTags['li']               = new voiceTag(', ', '');
        voiceTags['dt']               = new voiceTag('', ', ');

        // voiceTags['img']              = new voiceTag('There\'s an embedded image with the description,', ', ');
        // voiceTags['table']            = new voiceTag('There\'s an embedded table,', '');
        // voiceTags['card-header']      = new voiceTag('', '');
        // voiceTags['doc-example']      = new voiceTag('There\'s an embedded example element,', '');
        // voiceTags['admonitionblock']  = new voiceTag('There\'s an attention element of type, ', '');
        // voiceTags['listingblock']     = new voiceTag('There\'s an embedded structured text block,', '');
        // voiceTags['carousel']         = new voiceTag('There\'s an embedded carousel element,', '');
        // voiceTags['slider']           = new voiceTag('There\'s an embedded slider element,', '');
        // voiceTags['masonry']          = new voiceTag('There\'s an embedded masonry element,', '');
        // voiceTags['lightbox']         = new voiceTag('There\'s an embedded lightbox element,', '');
        // voiceTags['gallery']          = new voiceTag('There\'s an embedded gallery element,', '');
        // voiceTags['figure']           = new voiceTag('There\'s an embedded figure with the caption,', '');
        // voiceTags['blockquote']       = new voiceTag('Blockquote start.', 'Blockquote end.');
        // voiceTags['quoteblock']       = new voiceTag('Quote block start.', 'Quote block end.');

        voiceTags['img']              = new voiceTag('Start of an embedded image with the description,', ', ');
        voiceTags['table']            = new voiceTag('Start of an embedded table,', '');
        voiceTags['card-header']      = new voiceTag('', '');
        voiceTags['doc-example']      = new voiceTag('Start of an embedded example element,', 'This element ist not spoken.');
        voiceTags['admonitionblock']  = new voiceTag('Start of an attention element of type, ', '');
        voiceTags['listingblock']     = new voiceTag('Start of an embedded structured text block,', 'This element ist not spoken.');
        voiceTags['carousel']         = new voiceTag('Start of an embedded carousel element,', 'This element ist not spoken.');
        voiceTags['slider']           = new voiceTag('Start of an embedded slider element,', 'This element ist not spoken.');
        voiceTags['masonry']          = new voiceTag('Start of an embedded masonry element,', 'This element ist not spoken.');
        voiceTags['lightbox']         = new voiceTag('Start of an embedded lightbox element,', 'This element ist not spoken.');
        voiceTags['gallery']          = new voiceTag('Start of an embedded gallery element,', 'This element ist not spoken.');
        voiceTags['figure']           = new voiceTag('Start of an embedded figure with the caption,', '');
        voiceTags['blockquote']       = new voiceTag('Blockquote start.', 'Blockquote end.');
        voiceTags['quoteblock']       = new voiceTag('Start of an embedded quote block element,', 'Quote block element end.');

//      ignoreTags = ['audio','button','canvas','code','del','dialog','dl','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];
//      ignoreTags = ['masonry', 'carousel', 'slider', 'pre','audio','button','canvas','code','del','dialog','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];
        ignoreTags = ['audio','button','canvas','code','del', 'pre', 'dialog','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];

        // jadams: following checks are moved to the adapter
        //
        // Check to see if the browser supports the functionality.
        // if (!('speechSynthesis' in window)) {
        //     alert('Sorry, this browser does not support the Web Speech API.');
        //     return
        // };

        // jadams:
        // TODO: NOT working for multiple 'tab' windows
        // dispayed in the same browser
        //
        // If something is currently being spoken, ignore new voice
        // request. Otherwise it would be queued, which is doable if
        // someone wanted that, but not what I wanted.
        //
        if (window.speechSynthesis.speaking) {
            return
        };

        // jadams
        // TODO: coincident active speech synthesis in multiple
        // browser windows or tabs does NOT work
        //
        // user_session = j1.readCookie('j1.user.session');
        // if (user_session.speech_synthesis_active === true) {
        //     return
        // };

        // user_session.speech_synthesis_active  = true;
        // j1.writeCookie({
        //   name:     'user_session',
        //   data:     user_session,
        //   secure:   false,
        //   expires:  0
        // });

        // jadams
        var processSpeech = setInterval(function () {
          if (scanFinished) {
            // Cycle through all the elements in the original jQuery
            // selector, process and clean them one at a time, and
            // continually append it to the variable "toSpeak".
            //
            _this.each(function() {
                obj = $(this).clone();                    // clone the DOM node and its descendants of what the user wants spoken
                processed = processDOMelements(obj);      // process and manipulate DOM tree of this clone
                processed = jQuery(processed).html();     // convert the result of all that to a string
                finished = cleanDOMelements(processed);   // do some text manipulation
                toSpeak = finished;
            });

            // Check if users have set their own rate/pitch/volume
            // defaults, otherwise use defaults
            //
            if (rateUserDefault !== undefined) {
                rate = rateUserDefault;
            } else {
                rate = rateDefault;
            }
            if (pitchUserDefault !== undefined) {
                pitch = pitchUserDefault;
            } else {
                pitch = pitchDefault;
            }
            if (volumeUserDefault !== undefined) {
                volume = volumeUserDefault;
            } else {
                volume = volumeDefault;
            }

            // jadams
            // This is where the magic happens. Well, not magic, but at
            // least we can finally hear something. After the line that
            // fixes the Windows Chrome quirk, the custom voice is set
            // if one has been chosen.
            //
            speech = new SpeechSynthesisUtterance();
            speech.rate               = rate;
            speech.pitch              = pitch;
            speech.volume             = volume;
            speech.voice              = undefined;
            speech.lastScrollPosition = 0;

            // jadams
            if (isChrome) {
              speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceLanguageDefault; })[0];
  //          speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceChromeDefault; })[0];
            };

            // jadams
            if (isEdge) {
              speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceLanguageDefault; })[0];
            };

            // jadams
            processTextChunks(speech, toSpeak);
            clearInterval(processSpeech);
          }
        }, speechCycle); // END processSpeech

        // jadams
        // create the chunks array
        //
        function splitTextIntoChunks(text, chunkSize) {
          // Get headings array
          headingsArray = parseContent.selectHeadings(defaultOptions.contentSelector, defaultOptions.headingSelector);

          // cleanup text
          text = text.replace(/(\r\n|\n|\r)/gm, '');
//        text = text.replace(/(^\s+|\s+$)/gm, '');
          text = text.replace(/\s+/gm, ' ');

//        const chunks = text.split(/[.!?]/);
          const chunks = text.split('.');

          chunks.forEach((chunk, index) => {
            // cleanup chunks
            chunks[index] = chunks[index].replace(/^\s+/g, '');
            chunks[index] = chunks[index].replaceAll('""', '');
            // chunks[index] = chunk.replace(/^\s+|\s+$/g, '');
            // chunks[index] = chunk.replace(/(\r\n|\n|\r)/gm, '');
            // add chunk if contains text
            // chunks[index] = chunks[index] + '. ';
          });

          chunks.forEach((chunk, index) => {
            // cleanup chunks
            if (chunks[index].length > 0) {
              chunks[index] = chunks[index] + '. ';
            } else {
              // remove empty text element from chunks array
              chunks.splice(index, 1);
            }
          });

          chunks.forEach((chunk, index) => {
            // cleanup chunks
            if (chunks[index].length == 0) {
              // remove empty text element from chunks array
              chunks.splice(index, 1);
            }
          });

          // built the chunks object array
          var chunkSet = [];
          chunks.forEach((chunk, index) => {
            var chunk_text    = chunks[index];
            var sectionText   = textSlice(chunk_text, textSliceLength);
            var $element      = $('#main-content').find("p:contains('" + sectionText + "')");
            var offset;

            if ($element.length > 0) {
              offset = $element[0].offsetTop;
            } else {
              offset = undefined;
            }

            chunkSet.push({
              text:    chunk_text,
              offset:  offset,
            });
          });

          chunkSet.forEach((chunk, index) => {
            var text;
            var innerText;
            var offset;
            var $element;

            // parse the headingsArray to add missing offset values
            // for headlines
            //
            if (chunk.offset === undefined) {
              // cleanup the spoken text for compare
              text = chunk.text.replaceAll('. ', '');

              // jadams:
              // for this type of loop, NOT all headings are found in the array
              if (headingsArray !== null) {
                for (var node of headingsArray) {
  //            for (var node in headingsArray) {
                  // cleanup the innerText for compare
                  innerText = node.innerText.replaceAll('?', '');
  //              innerText = node.innerText.replaceAll('!', '');

                  if (innerText == text) {
                    var headline  = $('#' + node.id);
                    var offsetTop = headline.offset().top;
                    chunk.offset  = offsetTop;
                    console.log ('speak2me, text: ' + node.innerText + ', offsetTop: ' + chunk.offset);
                  }
                }
              }

            }

          });

//        return chunks;
          return chunkSet;
      }

      // jadams
      function textSlice(text, slicelenght) {
        var startSubString  = 2;
        var endSubString    = startSubString + slicelenght;
        var subText         = text.substr(startSubString, endSubString);
        var stringArray     = subText.split(/(\s+)/);

        // Remove first two elements
        stringArray.shift();
        stringArray.shift();
        // Remove last two elements
        stringArray.pop();
        stringArray.pop();

        subText = stringArray.join('');
        subText = subText.replaceAll('.', '');

        // dots should NOT removed
        //subText = subText.replaceAll(',', '');

        if (stringArray.length < 3) {
          return 'no search possible on this fraction of subText';
        } else {
          return subText;
        }
      }

      // jadams
      // process all chunks to speak sequentially
      //
      function processTextChunks(speaker, chunks) {
        const synth = window.speechSynthesis;

//      speaker.text = chunks[chunkCounter];
        speaker.text        = chunks[chunkCounter].text;
        speaker.textOffset  = chunks[chunkCounter].offset;
        synth.speak(speaker);

        // indicate active converter in the quicklinks bar
        //
        $('.mdib-speaker').addClass('mdib-spin');

        // scroll to actine spoken text element
        //
        speaker.addEventListener('start', (event) => {
          var sectionText             = textSlice(speaker.text, textSliceLength);
          var headingText             = speaker.text.replaceAll('. ', '');
          var scrollBlockOffset       = 100;
          var scrollPageSeriesOffset  = 0;
          var scrollLineOffset        = 20;
          var scrollHeadlineOffset    = 12;
          var scrollBehavior          = 'smooth';
//        var lastScrollPosition      = speaker.lastScrollPosition;
          var lastScrollPosition;
          var scrollSection;
          var currentHeadline;

          // Adjust scrolling position for navigation elements used for post series
          //
          if ($('.bmd-layout-header').length) {
            offsetTop               = $('.bmd-layout-header')[0].offsetTop
            scrollPageSeriesOffset  = (offsetTop - scrollBlockOffset);
            speaker.lastScrollPosition      = scrollPageSeriesOffset;
          }

          // Adjust scrolling position for post displayed in the Blog Navigator
          //
          if ($('#post-headline').length) {
            currentHeadline = $('#main-content').find("h3:contains('" + headingText + "')")[0];
            if (currentHeadline !== undefined) {
              var headline          = $('#' + currentHeadline.id);
              var offset            = headline.offset();
              var offsetTop         = offset.top;

              window.scrollTo({
                top:      offsetTop - (scrollBlockOffset + scrollHeadlineOffset),
                behavior: scrollBehavior
              });

              speaker.lastScrollPosition = offsetTop - (scrollBlockOffset + scrollHeadlineOffset)
            }
          } // END Adjust scrolling for the Blog Navigator

//           if ($('.bmd-layout-header').length) {
//             currentHeadline = $('#main-content').find("h2:contains('" + headingText + "')")[0];
//             if (currentHeadline !== undefined) {
//               var headline          = $('#' + currentHeadline.id);
//               var offset            = headline.offset();
//               var offsetTop         = offset.top;
//
//               window.scrollTo({
// //              top:      offsetTop - (scrollBlockOffset + scrollHeadlineOffset),
//                 top:      offsetTop - 80,
//                 behavior: scrollBehavior
//               });
//
//               speaker.lastScrollPosition = offsetTop - 80;
//             }
//
//             currentHeadline = $('#main-content').find("h3:contains('" + headingText + "')")[0];
//             if (currentHeadline !== undefined) {
//               var headline          = $('#' + currentHeadline.id);
//               var offset            = headline.offset();
//               var offsetTop         = offset.top;
//
//               window.scrollTo({
// //              top:      offsetTop - (scrollBlockOffset + scrollHeadlineOffset),
//                 top:      offsetTop - 40,
//                 behavior: scrollBehavior
//               });
//
//               speaker.lastScrollPosition = offsetTop - 40;
//             }
//
//           } // END Adjust scrolling for the Blog Posts

          // detect current spoken paragraph|headline and scroll to if found
          //
          $currentSection = $('#main-content').find("p:contains('" + sectionText + "')")[0];
          if ($currentSection !== undefined) {
            $($currentSection).addClass('speak-highlighted');

            if ($('.bmd-layout-header').length && speaker.lastScrollPosition > $currentSection.offsetTop) {
              // scroll if post series are scrolled 'block-wise' and set lastScroll position
              //
              window.scrollTo({
                top:      speaker.lastScrollPosition + ($currentSection.offsetTop),
                behavior: scrollBehavior
              });

              speaker.lastScrollPosition = speaker.lastScrollPosition + ($currentSection.offsetTop);
              return;
            } else if ($currentSection.offsetTop > speaker.lastScrollPosition) {
              // scroll if pages are scrolled 'block-wise' and set lastScroll position
              //
              window.scrollTo({
                top:      $currentSection.offsetTop - scrollBlockOffset,
                behavior: scrollBehavior
              });

              speaker.lastScrollPosition = $currentSection.offsetTop - scrollBlockOffset;
              return;
            }

            // set lastScroll position if pages are scrolled 'line-wise'
            //
            if (speaker.lastScrollPosition > $currentSection.offsetTop) {
              if ($('#timeline').length && scrollOnce) {
                scrollOnce    = false;
                scrollSection = $('#timeline')[0].offsetTop - scrollBlockOffset;

                speaker.lastScrollPosition = scrollSection;
              } else {
                var bla = $currentSection.offsetTop;
                speaker.lastScrollPosition = lastScrollPosition + scrollLineOffset;
              }
            }

          }
        });

        // remove highlightning on already spoken text element
        //
        speaker.addEventListener('end', function (event) {
          var sectionText = textSlice(speaker.text, textSliceLength);

          // remove highlightning of already spoken paragraph
          //
          $currentSection = $('#main-content').find("p:contains('" + sectionText + "')")[0];
          if ($currentSection !== undefined) {
            $($currentSection).removeClass('speak-highlighted');
          }

          chunkCounter ++;
        });

        // jadams
        // detection loop for active spoken text elements to
        // add|remove highlightning
        //
        var speechMonitor = setInterval(function () {
          if (!(synth.speaking)) {
            var sectionText;
            if (chunkCounter == chunkCounterMax || userStoppedSpeaking ) {
              chunkCounter        = 0;
              userStoppedSpeaking = false;
              sectionText         = textSlice(speaker.text, textSliceLength);
              $currentSection     = $('#main-content').find("p:contains('" + sectionText + "')")[0];

              if ($currentSection !== undefined) {
                $($currentSection).removeClass('speak-highlighted');
              }

              window.scrollTo({top: 0, behavior: 'smooth'});
              $('.mdib-speaker').removeClass('mdib-spin');
              clearInterval(speechMonitor);
            } else {
              speaker.text        = chunks[chunkCounter].text;
              speaker.textOffset  = chunks[chunkCounter].offset;
              sectionText         = textSlice(speaker.text, textSliceLength);
              $currentSection     = $('#main-content').find("p:contains('" + sectionText + "')")[0];

              if ($currentSection !== undefined) {
                $($currentSection).addClass('speak-highlighted');
              }

              synth.speak(speaker);
            }
          }
        }, speechMonitorCycle); // END speechMonitor

      } // END processTextChunks

      // jadams
      function processDOMelements(clone) {
        var copy, title, title_element, content_type, content_element, content, appended, prepend;

        // Remove tags from the "ignoreTags" array because the
        // user called "speak2me('recognize')" and said he/she
        // doesn't want some tags un-spoken. Double negative there,
        // but it does make sense.
        //
        if (recognizeTagsUser.length > 0) {
          for (var prop in recognizeTagsUser) {
            var index = ignoreTags.indexOf(recognizeTagsUser[prop]);
            if (index > -1) {
                ignoreTags.splice(index, 1);
            }
          }
        };

        // Remove DOM objects from those listed in the "ignoreTags"
        // array now that the user has specified which ones,
        // if any, he/she wants to keep
        //
        for (var prop in ignoreTags) {
          jQuery(clone).find(ignoreTags[prop]).addBack(ignoreTags[prop]).not('[data-speak2me-recognize]').each(function() {
            jQuery(this).html('');
          });
        };

        // Remove DOM objects specified in the "ignoreTagsUser"
        // array that the user specified when calling "speak2me('ignore')".
        //
        if (ignoreTagsUser.length > 0) {
          for (var prop in ignoreTagsUser) {
            jQuery(clone).find(ignoreTagsUser[prop]).addBack(ignoreTagsUser[prop]).not('[data-speak2me-recognize]').each(function() {
                jQuery(this).html('');
            });
          };
        };

        // Remove DOM objects specified in the HTML with
        // "data-speak2me-ignore"
        //
        jQuery(clone).find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').each(function() {
          jQuery(this).html('');
        });

        // jadams
        // Remove DOM objects specified in the HTML by class "speak2me-ignore"
        //
        jQuery(clone).find('.speak2me-ignore').addBack('[data-speak2me-ignore]').each(function() {
          jQuery(this).html('');
        });

        // Search for prepend data specified in the HTML
        // with "data-speak2me-prepend"
        jQuery(clone).find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
          copy = jQuery(this).data('speak2me-prepend');
          jQuery(this).prepend(copy + ' ');
        });

        // Search for append data specified in the HTML
        // with "data-speak2me-append"
        //
        jQuery(clone).find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
          copy = jQuery(this).data('speak2me-append');
          jQuery(this).append(' ' + copy);
        });

        // jadams
        // Search for tags to prepend and append specified by
        // the "voiceTags" array.
        //
        var count = 0;
        for (var tag in voiceTags) {
          jQuery(clone).find(tag).each(function() {
            if (customTags[tag]) {
                jQuery(this).prepend(customTags[tag].prepend + ' ');
                jQuery(this).append(' ' + customTags[tag].append);
            } else {
                jQuery(this).prepend(voiceTags[tag].prepend + ' ');
                jQuery(this).append(' ' + voiceTags[tag].append);
            };
          });
        };

        // Search for <h1> through <h6> and <li> and <br> to add
        // a pause at the end of those tags. This is done
        // because these tags require a pause, but often don't
        // have a comma or period at the end of their text.
        //
        jQuery(clone).find('h1,h2,h3,h4,h5,h6,li,p').addBack('h1,h2,h3,h4,h5,h6,li,p').each(function() {
          jQuery(this).append(pause_spoken);
        });

        // Search for <br> tags to add a pause at the end.
        jQuery(clone).find('br').each(function() {
          jQuery(this).after(pause_spoken);
        });

        // Search for <figure>, check for <figcaption>, insert
        // that text if it exists and then remove the whole DOM object
        //
        jQuery(clone).find('figure').addBack('figure').each(function() {
          copy = jQuery(this).find('figcaption').html();

          if (customTags['figure']) {
            prepend = customTags['figure'].prepend;
          }
          else {
            prepend = voiceTags['figure'].prepend;
          }

          if ((copy != undefined) && (copy !== '')) {
            jQuery('<div>' + prepend + ' ' + copy + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // Search for <image>, check for ALT attribute, insert that
        // text if it exists and then remove the whole DOM object.
        // Had to make adjustments for nesting in <picture> tags.
        //
        jQuery(clone).find('img').addBack('img').each(function() {
          copy = jQuery(this).attr('alt');
          var parent = jQuery(this).parent();
          var parentName = parent.get(0).tagName;

          if (customTags['img']) {
            prepend = customTags['img'].prepend;
          }
          else {
            prepend = voiceTags['img'].prepend;
          }

          if ((copy !== undefined) && (copy != '')) {
            if (parentName == 'PICTURE') {
                var par;
                jQuery('<div>' + prepend + ' ' + copy + pause_spoken + '</div>').insertBefore(parent);
            } else {
                jQuery('<div>' + prepend + ' ' + copy + pause_spoken + '</div>').insertBefore(this);
            }
          }

          jQuery(this).remove();
        });

        // jadams
        // Search for admonitionblock elements and extract the type and
        // content. Insert type and content and then remove the DOM object.
        //
        jQuery(clone).find('.admonitionblock').addBack('admonitionblock').each(function() {
          content_type    = this.classList[1];
          content_element = jQuery(this).find('.content');
          content         = content_element[0].innerText;
          prepend         = voiceTags['admonitionblock'].prepend + content_type + '. ';
          appended        = voiceTags['admonitionblock'].append;

          if ((content !== undefined) && (content != '')) {
            jQuery('<div>' + prepend + ' ' + content + '</div>').insertBefore(this);
            jQuery('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // jadams
        // Search for quote block elements
        //
        jQuery(clone).find('.quoteblock').addBack('quoteblock').each(function() {
          var attribution = jQuery(this).find('.attribution');
          content_element = jQuery(this).find('blockquote');
          content         = content_element[0].innerText + 'quoted by, ' + attribution[0].innerText + ', ';
          prepend         = voiceTags['quoteblock'].prepend;
          appended        = voiceTags['quoteblock'].append;

          if ((content !== undefined) && (content != '')) {
            jQuery('<div>' + prepend + ' ' + content + '</div>').insertBefore(this);
            jQuery('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // jadams
        // Search for <table>, check for <caption>, insert that
        // text if it exists and then remove the whole DOM object.
        //
        jQuery(clone).find('table').addBack('table').each(function() {
          copy      = jQuery(this).find('caption').text();
          prepend   = voiceTags['table'].prepend;
          appended  = voiceTags['table'].append;

          if ((copy !== undefined) && (copy != '')) {
              jQuery('<div>' + prepend + ' ' + copy + '</div>').insertBefore(this);
              jQuery('<div>' + appended + element_not_spoken + pause_spoken + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

          // jadams
          // Search for cards|header elements and then remove the DOM object
          //
          jQuery(clone).find('.card-header').addBack('card-header').each(function() {
            title_element = jQuery(this).find('.card-title');
            prepend       = voiceTags['card-header'].prepend;
            appended      = voiceTags['card-header'].append;

            if (title_element.length) {
              title = title_element[0].innerText + pause_spoken;
            } else {
              title = '';
            }

            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + title + '</div>').insertBefore(this);

//          jQuery(this).remove();
            jQuery(title_element).remove();
          });

          // jadams
          // Search for doc-example elements and then remove the DOM object
          //
          jQuery(clone).find('.doc-example').addBack('doc-example').each(function() {

            prepend       = voiceTags['doc-example'].prepend;
            appended      = voiceTags['doc-example'].append;

            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + element_not_spoken + pause_spoken + '</div>').insertBefore(this);

            jQuery(this).remove();
          });

        // jadams
        // Search for listingblock elements, check for previous declared <div>
        // container that contains the title element and insert that
        // text if it exists and then remove the DOM object
        //
        jQuery(clone).find('.listingblock').addBack('listingblock').each(function() {
          title_element = jQuery(this).find('.title');

          if (title_element.length) {
            copy = title_element[0].innerText;
          } else {
            copy = '';
          }

          prepend       = voiceTags['listingblock'].prepend;
          appended      = voiceTags['listingblock'].append;

          if ((copy !== undefined) && (copy != '')) {
            jQuery('<div>' + prepend + ' with the caption,' + copy + pause_spoken + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          } else {
            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // jadams
        // Search for <carousel>, check for previous declared <div>
        // container that contains the title element and insert that
        // text if it exists and then remove the DOM object.
        //
        jQuery(clone).find('carousel').addBack('carousel').each(function() {

          if ($(this).prev()[0].innerText !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            jQuery(title_element).remove();
          } else {
            title = '';
          }

          prepend  = voiceTags['carousel'].prepend;
          appended = voiceTags['carousel'].append;

          if ((title !== undefined) && (title != '')) {
            jQuery('<div>' + prepend + ' with the caption,' + title + pause_spoken + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          } else {
            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // jadams
        // Search for <slider>, check for previous declared <div>
        // container that contains the title element and insert that
        // text if it exists and then remove the DOM object
        //
        jQuery(clone).find('slider').addBack('slider').each(function() {

          if ($(this).prev()[0].innerText !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            jQuery(title_element).remove();
          } else {
            title = '';
          }

          prepend  = voiceTags['slider'].prepend;
          appended = voiceTags['slider'].append;

          if ((title !== undefined) && (title != '')) {
            jQuery('<div>' + prepend + ' with the caption, ' + title + pause_spoken + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          } else {
            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
      });

        // jadams
        // Search for <gallery>, check for previous declared <div>
        // container that contains the title element and insert that
        // text if it exists and then remove the DOM object
        //
        jQuery(clone).find('gallery').addBack('gallery').each(function() {

          if ($(this).prev()[0].innerText !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            // remove the title BEFORE the DOM object gets deleted
            //
            jQuery(title_element).remove();
          } else {
            title = '';
          }

          prepend  = voiceTags['gallery'].prepend;
          appended = voiceTags['gallery'].append;

          if ((title !== undefined) && (title != '')) {
            (prepend !== '')  && jQuery('<div>' + prepend + ' with the caption ' + title + pause_spoken + '</div>').insertBefore(this);
            (appended !== '') && jQuery('<div>' + appended + '</div>').insertBefore(this);
          } else {
            (prepend !== '')  && jQuery('<div>' + prepend + '</div>').insertBefore(this);
            (appended !== '') && jQuery('<div>' + appended + '</div>').insertBefore(this);
          }

          jQuery(this).remove();

        });

        // jadams
        // Search for <slider>, check for <caption>, insert that
        // text if it exists and then remove the DOM object
        //
        jQuery(clone).find('lightbox').addBack('gallery').each(function() {

          if ($(this).prev()[0].innerText !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            jQuery(title_element).remove();
          } else {
            title = '';
          }

          prepend   = voiceTags['lightbox'].prepend;
          appended  = voiceTags['lightbox'].append;

          if ((title !== undefined) && (title != '')) {
            jQuery('<div>' + prepend + ' with the caption,' + title + pause_spoken + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          } else {
            jQuery('<div>' + prepend + '</div>').insertBefore(this);
            jQuery('<div>' + appended + '</div>').insertBefore(this);
          }

          jQuery(this).remove();
        });

        // Search for DOM object to be replaced specified in
        // the HTML with "data-speak2me-swap"
        //
        jQuery(clone).find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function() {
          copy = jQuery(this).data('speak2me-swap');
          jQuery(this).text(copy);
        });

        // Search for DOM object to spelled out specified in
        // the HTML with "data-speak2me-spell".
        // I find this function fun if, admittedly, not too practical.
        //
        jQuery(clone).find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function() {
          copy = jQuery(this).text();
          copy = copy.split('').join(' ');
          jQuery(this).text(copy);
        });
        return clone;
      }

      // jadams
      function cleanDOMelements(final) {
        var start, ended, speak, part1, part2, final;

        // Search for <speak2me> in comments, copy the text,
        // place it outside the comment, and then splice together
        // "final" string again, which omits the comment.
        //
        while (final.indexOf('<!-- <speak2me>') != -1) {
            start = final.indexOf('<!-- <speak2me>');
            ended = final.indexOf('</speak2me> -->', start);
            if (ended == -1) { break; }
            speak = final.substring(start + 17, ended);
            part1 = final.substring(0, start);
            part2 = final.substring(ended + 17);
            final = part1 + ' ' + speak + ' ' + part2;
        };

        // Strip out remaining comments.
        //
        final = final.replace(/<!--[\s\S]*?-->/g, '');

        // Strip out remaining HTML tags
        //
        final = final.replace(/(<([^>]+)>)/ig, '');

        // Replace a string of characters with another as specified
        // by "speak2me('replace')".
        //
        var len = replacements.length;
        var i = 0;
        var old, rep;

        while (i < len) {
          old = replacements[i];
          old = old.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
          rep = replacements[i + 1] + ' ';
          var regexp = new RegExp(old, 'gi');
          var final = final.replace(regexp, rep);
          i = i + 2;
        }

        // jadams
        // Remove double quotes '"'
        //
        final = final.replaceAll('"', '');

        // Remove double smart quotes
        //
        final = final.replaceAll('“', '');
        final = final.replaceAll('”', '');

        // jadams
        // Remove all colons ':' and replace by a dot
        //
        final = final.replaceAll(':', '.');

        // jadams
        // Replace all strange '., ' by a pause
        //
        final = final.replaceAll('., ', '. ');
        final = final.replaceAll(' , ', ', ');

        // jadams
        // Remove strange double pause elements
        //
        final = final.replaceAll('. .', '');
        final = final.replaceAll(', .', '');
        final = final.replaceAll('  ,  ', '');

        // jadams
        // Replace empty lines
        //
        final = final.replace(/^$/g, '\n');
        final = final.replace(/^\s+$/g, '\n');

        // jadams
        // Replace single full stops in line ' . ' or '. '
        //
        final = final.replace(/\s+\.\s+/g, '\n');
        final = final.replace(/\s+\.\s+$/g, '\n');

        // jadams
        // Replace strange double full stops '..'
        //
        final = final.replace(/\.\./g, '.');

        // jadams
        // Replace the abbreviations '.e.g.', 'E.g.' and 'etc.'
        //
        final = final.replaceAll('e.g.',  'for example');
        final = final.replaceAll('E.g.',  'For example, ');
        final = final.replaceAll('etc.',  'and so on, ');

        // jadams
        // Replace language specific abbreviations
        // Note: required for some voices|languages, like Gewrman, only
        //
        final = final.replaceAll('z. B.', 'zum Beispiel, ');

        // jadams
        // Remove question and exclamation (?|!) marks
        //
        final = final.replace(/[\!\?]/g, '. ');

        // Replace em-dashes and double-dashes with a pause since
        // the browser doesn't do so when reading.
        //
        final = final.replaceAll('—', pause_spoken);
        final = final.replaceAll('–', pause_spoken);
        final = final.replaceAll('--', pause_spoken);

        // When read from the DOM, a few special characters
        // (&amp; for example) display as their hex codes
        // rather than resolving into their actual character
        //
        var txt = document.createElement('textarea');
        txt.innerHTML = final;
        final = txt.value;

        // Strip out multiple spaces, periods, and commas
        // for neatness more than anything else since
        // none of this will affect the speech. But it helps when
        // checking progress in the console.
        //
        // final = final.replace(/  +/g, ' ');
        // final = final.replace(/\.\./g, '.');
        // final = final.replace(/,,/g, ',');
        // final = final.replace(/ ,/g, ',');
        // final = final.replace(/^\s+|\s+$/g, '');

        // Strip out new line characters and carriage returns,
        // which cause unwanted pauses.
        //
        // final = final.replace(/(\r\n|\n|\r)/gm, '');

        // Definiere die Größe der Abschnitte
        const chunkSize = 100;

        // Teile den Text in Abschnitte auf
        const textChunks = splitTextIntoChunks(final, chunkSize);
        chunkCounterMax = textChunks.length;

        return textChunks;
      }

      // return the SpeechSynthesisUtterance object to be used
      return speech;
    }, // END speak

    pause: function() {
      window.speechSynthesis.pause();
      return this;
    }, // END pause

    resume: function() {
      window.speechSynthesis.resume();
      return this;
    }, // END resume

    // jadams
    stop: function() {
      window.speechSynthesis.cancel();
      userStoppedSpeaking = true;

      // jadams
      // NOTE: coincident active speech synthesis in multiple
      // browser windows (tabs) does NOT work
      //
      // user_session.speech_synthesis_active = false;
      // j1.writeCookie({
      //   name:     'user_session',
      //   data:     user_session,
      //   secure:   false,
      //   expires:  0
      // });

      return this;
    }, // END stop

    enabled: function() {
      return ('speechSynthesis' in window);
    }, // END enabled

    isSpeaking: function() {
      return (window.speechSynthesis.speaking);
    }, // END is Speaking

    isPaused: function() {
      return (window.speechSynthesis.paused);
    }, // END isPaused

    rate: function() {
      var num = arguments[0];

      if ((num >= 0.1) && (num <= 10)) {
        rateUserDefault = num;
      } else if (num === undefined) {
        rateUserDefault = void 0;
        rate = rateDefault;
      }

      return this;
    }, // END rate

    pitch: function() {
      var num = arguments[0];

      if ((num >= 0.1) && (num <= 2)) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = void 0;
        pitch = pitchDefault;
      }

      return this;
    }, // END pitch

    volume: function() {
      var num = arguments[0];

      if ((num >= 0) && (num <= 1)) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = void 0;
        volume = volumeDefault;
      };
      return this;
    }, // END volume

    ignore: function() {
      var len = arguments.length;
      ignoreTagsUser.length = 0;

      while (len > 0) {
        len--;
        ignoreTagsUser.push(arguments[len]);
      };

      return this;
    }, // END ignore

    recognize: function() {
      var len = arguments.length;
      recognizeTagsUser.length = 0;

      while (len > 0) {
        len--;
        recognizeTagsUser.push(arguments[len]);
      }

      return this;
    }, // END recognize

    replace: function() {
      var len = arguments.length;
      replacements.length = 0;

      var i = 0;
      while (i < len) {
        replacements.push(arguments[i], arguments[i + 1]);
        i = i + 2;
        if ((len - i) == 1) { break; };
      };

      return this;
    }, // END replace

    customize: function() {
      var len = arguments.length;

      if (len == 0) {
          customTags = [];
      }

      if (len == 2) {
        if (['img','table','figure'].indexOf(arguments[0]) == -1) {
          console.log("Error: When customizing, tag indicated must be either 'img', 'table', or 'figure'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }

      if (len == 3) {
        if (['q',"ol","ul","blockquote"].indexOf(arguments[0]) == -1) {
          console.log("Error: When customizing, tag indicated must be either 'q', 'ol', 'ul' or 'blockquote'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }

      return this;
    }, // END customize

    getVoices: function() {
      // If no arguments, then the user has requested the array of
      // voices populated earlier.
      //
      if (arguments.length == 0) {
          return voices;
      }

      // If there's another argument, we'll assume it's a jQuery
      // selector designating where to put the dropdown menu.
      // And if there's a third argument, that will be custom text
      // for the dropdown menu.
      // Then we'll create a dropdown menu with the voice names and,
      //in parenthesis, the language code.
      //
      var obj = jQuery(arguments[0]);
      var selectionTxt = 'Choose a voice';

      if (arguments[1] !== undefined) {
        selectionTxt = arguments[1];
      }

      obj.append(jQuery("<select id='voiceSelect' name='voiceSelect'><option value='none'>" + selectionTxt + "</option></select>"));

      // jadams
      var skippedVoices = 0;
      for (var i = 0; i < voices.length ; i++) {
        if (isChrome && voices[i].name.includes(ignoreProvider)) {
          skippedVoices++;
          continue;
        }
        if (isEdge && !voices[i].name.includes('Natural')) {
          skippedVoices++;
          continue;
        }

        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].language + ')';
        option.setAttribute('value', voices[i].name);

        // set used voice as 'selected'
        if (voiceLanguageDefault !== undefined) {
          if ( voices[i].name ===  voiceLanguageDefault ) {
            option.setAttribute('selected', 'selected');
          }
        } else {
          if ( voices[i].name.includes(voiceUserDefault) ) {
//            option.setAttribute('selected', 'selected');
          }
        }

        option.setAttribute('data-speak2me-language', voices[i].language);
        obj.find('select').append(option);
      }

      // jadams
      return i - skippedVoices;
    }, // END get Voiuces

    setVoice: function() {
      // The setVoice function has to have two attributes
      // if not, exit the function.
      //
      if (arguments.length < 2) {
        return this
      }

      var requestedVoice, requestedLanguage;

      // User wants to change the voice directly. If that name indeed
      // exists, update the "voiceUserDefault" variable.
      //
      if (arguments[0] == 'name') {
        requestedVoice = arguments[1];

        for (var i = 0; i < voices.length; i++) {
          if (voices[i].name == requestedVoice) {
            voiceUserDefault = requestedVoice;
          }
        }
      }

      // User wants to change the voice by only specifying the
      // first two characters of the language code. Case insensitive.
      //
      if (arguments[0] == 'language') {
        requestedLanguage = arguments[1].toUpperCase();

        if (requestedLanguage.length == 2) {
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language.substring(0,2).toUpperCase() == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        } else {
          // User wants to change the voice by specifying the
          // complete language code.
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        }
      }

      return this;
    } // END set Voice
  } // END methods

  $.fn.speak2me = function(method) {
      if (methods[method]) {
          return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || ! method) {
          return methods.speak.apply(this, arguments);
      } else {
          jQuery.error('Method ' +  method + ' does not exist on jQuery.speak2me');
      }
  };

}(jQuery));
