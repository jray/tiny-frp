
### WIP

My attempt to extract the dom event stream stuff that makes RxJS and BaconJS so cool. No need to pull in those libraries just for that functionality. If you need a more complete RFP library then you should use one of those.

```javascript
  var stream = new ValStream( '#the-input' );

  stream
    .on('keyup')
    .map(function(item){
        return item.target.value;
    })
    .filter(function(item){
        return item.length > 3;
    })
    .map(function(item){
        return '<<' + item + '>>';
    })
    .throttle( 500 )
    .subscribe(function(item){
        console.log(item);
    });
```
