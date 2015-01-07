
/* global define: false */

;(function($){

  'use strict';

  var stream = function( selector ) {

    var api       = {};
    var _domItems = document.querySelectorAll( selector );
    var _events   = [
      'keyup',
      'keydown',
      'focus',
      'blur',
      'mousemove'
    ];
    var _buffer   = [ ];
    var _pipeline = [ ];
    var _throttle = 10;
    var _latest   = null;
    var _event    = null;
    var _interval = null;
    var _onEvent  = null;

    function _performOperation ( item ) {
      var valid = true;
      for ( var i in _pipeline ) {
        var op = _pipeline[ i ];

        if ( op.map ) {
          item = op.map( item );
        } else if ( op.filter ) {
          if ( !op.filter( item ) ) {
            valid = false;
            break;
          }
        } else if ( op.each ) {
          op.each( item );
        } else if ( op.pluck ) {
          if ( typeof op.pluck !== 'function' &&
               typeof op.pluck !== 'object' ) {
            item = item[ op.pluck ] || null;
          } else if ( typeof op.pluck === 'function' ) {
            var target = op.pluck( item );
            if ( item[ target ] ) {
              item = item[ target ];
            } else {
              valid = false;
              break;
            }
          }
        }
      }
      return { valid: valid, item: item };
    }  // end _performOperation

    function _execute() {

      if ( _interval ) {
        clearInterval( _interval );
      }

      _interval = setInterval(function(){
        var response = _buffer.shift();
        if ( typeof response === 'function' ) {
          response();
        }
      }, _throttle);
    }  // end _execute

    api = {
      on: function( event ) {
        if ( _events.indexOf( event ) > -1 ) {
          _event = event;
        }
        return api;
      }, // end on

      subscribe: function( onEvent ) {
        onEvent = onEvent || function(){};
        _onEvent = function( item ) {
          var result          = _performOperation( item );
          var transformedItem = result.item;

          if ( result.valid ) {
            _buffer.push( onEvent.bind( null, transformedItem ) );
            _latest = transformedItem;
          }
        };

        for ( var i = 0; i < _domItems.length; i++ ) {
          _domItems[ i ].addEventListener( _event, _onEvent, true );
        }
        _execute();
        return api;
      }, // end subscribe

      throttle: function( mills ) {
        if ( typeof mills === 'number' ) {
          _throttle = mills;
        }
        _execute();
        return api;
      }, // end throttle

      map: function( mapFunc ) {
        if ( typeof mapFunc === 'function' ) {
          _pipeline.push( { map: mapFunc } );
        }
        return api;
      }, // end map

      pluck: function( pluckOp ) {
        _pipeline.push( { pluck: pluckOp } );
        return api;
      }, // end pluck

      each: function( eachFunc ) {
        if ( typeof eachFunc === 'function' ) {
          _pipeline.push( { each: eachFunc } );
        }
        return api;
      }, // end each

      filter: function( filterFunc ) {
        if ( typeof filterFunc === 'function' ) {
          _pipeline.push( { filter: filterFunc } );
        }
        return api;
      }, // end filter

      dedup: function() {
        // _pipeline.push( { dedup: true } );
        return api;
      },

      dispose: function() {
        clearInterval( _interval );
        for ( var i = 0; i < _domItems.length; i++ ) {
          _domItems[ i ].removeEventListener( _event, _onEvent, true );
        }
        _buffer   = [ ];
        _pipeline = [ ];
        _throttle = 10;
        _event    = null;
        _interval = null;
        _onEvent  = null;
      }, // end dispose

    }; // end api definition

    return api;
  };

  var TinyFRP = function( selector ) {
    return stream( selector );
  };

  if ( typeof module !== 'undefined' && module.exports ) {
    module.exports = TinyFRP;
  } else if ( typeof define !== 'undefined' && define.amd ) {
    // AMD compatibility
    define([], function () {
      return TinyFRP;
    });
  } else {
    window.TinyFRP = TinyFRP;
  }

}(window.jQuery));
