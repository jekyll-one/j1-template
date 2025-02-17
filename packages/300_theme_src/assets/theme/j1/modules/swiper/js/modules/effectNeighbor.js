/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/effectNeighbor.js
 # J1 module for SwiperJS v11 (view)
 # -----------------------------------------------------------------------------
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2025 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

function EffectNeighbor(_ref) {

    var {
        swiper,
        extendParams,
        on
    } = _ref;

    extendParams({
      panoramaEffect: {
        depth: 200,
        rotate: 30,
      },
    });

} // END EffectNeighbor