
### WIP

My attempt to extract the dom event stream stuff that makes RxJS and BaconJS so cool. No need to pull in those libraries just for that functionality. If you need a more complete RFP library then you should use one of those.

```javascript
    var stream = ValStream( '#the-input' );

    stream
        .on('keyup')
        .map(function(item){
            return item.target.value;
        })
        .filter(function(item){
            return item.length > 1;
        })
        .map(function(item){
            return '<<' + item + '>>';
        })
        .throttle( 100 )
        .subscribe(function(item){
            console.log(item);
        });

        setTimeout(function(){
            console.log('disposing of event stream');
            stream.dispose();
            // you will no longer be notified of events
        }, 3000);
```
