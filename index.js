
;(function(){

  'use strict';

  var ValStream = function( selector ) {
    this._pipeline   = [ ];
    this._operations = [ ];
    this._throttle   = 10;
    this._event      = null;
    this._interval   = null;
    this._el = document.querySelector( selector );
    return this;
  };

  ValStream.prototype.on = function( event ) {
    this._event = event;
    return this;
  };

  ValStream.prototype.subscribe = function( onEvent ) {
    var self = this;
    this._el.addEventListener( this._event, function( item ) {
      var valid = true;
      for ( var i in self._operations ) {
        var op = self._operations[ i ];

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
        self._pipeline.push( onEvent.bind( null, item ) );
      }
    });
    this._execute();
    return this;
  };

  ValStream.prototype.throttle = function( mills ) {
    if ( typeof mills === 'number' ) {
      this._throttle = mills;
    }
    this._execute();
    return this;
  };

  ValStream.prototype.map = function( mapFunc ) {
    if ( typeof mapFunc === 'function' ) {
      this._operations.push( { map: mapFunc } );
    }
    return this;
  };

  ValStream.prototype.filter = function( filterFunc ) {
    if ( typeof filterFunc === 'function' ) {
      this._operations.push( { filter: filterFunc } );
    }
    return this;
  };

  ValStream.prototype._execute = function() {
    var self = this;

    if ( this._interval ) {
      clearInterval( this._interval );
    }

    this._interval = setInterval(function(){
      var response = self._pipeline.shift();
      if ( typeof response === 'function' ) {
        response();
      }
    }, this._throttle);
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
