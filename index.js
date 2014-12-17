/* global define: false */

;(function(){

  'use strict';

  var Stream = function( id ) {
    id = ( id.charAt( 0 ) === '#' ) ? id : '#' + id;
    this._events   = [
      'keyup',
      'keydown',
      'focus',
      'blur'
    ];
    this._buffer   = [ ];
    this._pipeline = [ ];
    this._throttle = 10;
    this._latest   = null;
    this._event    = null;
    this._interval = null;
    this._onEvent  = null;
    this._el = document.querySelector( id );

    if ( !this._el ) {
      throw new Error( 'Element with id ' + id + ' does not exist' );
    }
    return this;
  };

  Stream.prototype.on = function( event ) {
    if ( this._events.indexOf( event ) > -1 ) {
      this._event = event;
    }
    return this;
  };

  Stream.prototype.subscribe = function( onEvent ) {
    var self = this;

    // TODO: Refactor - so ugly.
    this._onEvent = function( item ) {
      var valid = true;
      for ( var i in self._pipeline ) {
        var op = self._pipeline[ i ];

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
          if ( typeof op.pluck !== 'function' && typeof op.pluck !== 'object' ) {
            item = item[ op.pluck ] || null;
          } else if ( typeof op.pluck === 'function' ) {
            var target = op.pluck( item );
            if ( item[ target ] ) {
              item = item[ target ];
            } else {
              valid = false;
            }
          }
        }
      }

      if ( valid ) {
        self._buffer.push( onEvent.bind( null, item ) );
        self._latest = item;
      }
    };

    this._el.addEventListener( this._event, this._onEvent );
    this._execute();
    return this;
  };

  Stream.prototype.throttle = function( mills ) {
    if ( typeof mills === 'number' ) {
      this._throttle = mills;
    }
    this._execute();
    return this;
  };

  Stream.prototype.map = function( mapFunc ) {
    if ( typeof mapFunc === 'function' ) {
      this._pipeline.push( { map: mapFunc } );
    }
    return this;
  };

  Stream.prototype.pluck = function( pluckOp ) {
    this._pipeline.push( { pluck: pluckOp } );
    return this;
  };

  Stream.prototype.each = function( eachFunc ) {
    if ( typeof eachFunc === 'function' ) {
      this._pipeline.push( { each: eachFunc } );
    }
    return this;
  };

  Stream.prototype.filter = function( filterFunc ) {
    if ( typeof filterFunc === 'function' ) {
      this._pipeline.push( { filter: filterFunc } );
    }
    return this;
  };

  Stream.prototype._execute = function() {
    var self = this;

    if ( this._interval ) {
      clearInterval( this._interval );
    }

    this._interval = setInterval(function(){
      var response = self._buffer.shift();
      if ( typeof response === 'function' ) {
        response();
      }
    }, this._throttle);
  };

  Stream.prototype.dispose = function() {
    clearInterval( this._interval );
    this._el.removeEventListener( this._event, this._onEvent );
    this._buffer   = [ ];
    this._pipeline = [ ];
    this._throttle = 10;
    this._event    = null;
    this._interval = null;
    this._onEvent  = null;
  };

  var ValStream = function( selector ) {
    return new Stream( selector );
  };

  if ( typeof module !== 'undefined' && module.exports ) {
    module.exports = ValStream;
  } else if ( typeof define !== 'undefined' && define.amd ) {
    // AMD compatibility
    define([], function () {
      return ValStream;
    });
  } else {
    window.ValStream = ValStream;
  }

}());
