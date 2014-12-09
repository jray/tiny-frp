
;(function(){

  'use strict';

  var Stream = function( selector ) {
    this._buffer   = [ ];
    this._pipeline = [ ];
    this._throttle = 10;
    this._event    = null;
    this._interval = null;
    this._el = document.querySelector( selector );
    return this;
  };

  Stream.prototype.on = function( event ) {
    this._event = event;
    return this;
  };

  Stream.prototype.subscribe = function( onEvent ) {
    var self = this;
    this._el.addEventListener( this._event, function( item ) {
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
        }
      }

      if ( valid ) {
        self._buffer.push( onEvent.bind( null, item ) );
      }
    });
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

  // TODO: Do it.
  Stream.prototype.dispose = function() {

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
