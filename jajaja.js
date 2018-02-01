var j2r = require( './japanese2rhythm' );

module.exports = function( RED ){
  function HashNode( config ){
    RED.nodes.createNode( this, config );

    var node = this;
    node.on( 'input', function( msg ){
      var text = msg.payload;

      var newlines = [];
      var lines = text.split( /[\n\r]/ );
      for( i = 0; i < lines.length; i ++ ){
        var line = lines[i];
        //line = kana2hira( line );

        if( line != "" ){
          var line2 = j2r.japanese2rhythm( line );
          line2 = line2.substring( 0, line2.length - 1 );

          newlines.push( line2 );
        }
      }

      var result = newlines.join( ',' ).split( ',' ); //. 'じゃ:8,じゃ:8,じゃ:8,じゃーん:2,じゃ:8,じゃ:8,じゃ:8,じゃーん:2'
      sendCharAt( result, node, 0 );
    });
  }
  RED.nodes.registerType( "jajajajan", HashNode );


  function sendCharAt( arr, node, idx ){
    if( idx >= arr.length ){
      return;
    }else{
      var s = arr[idx];
      var tmp = s.split( ':' );
      var c = tmp[0];
      var l = tmp[1];
      var n = -1;
      try{
        n = parseInt( l );
      }catch( e ){
      }

      if( n > 0 ){
        var sec = 8 / n;
        
        node.send( { payload: c, note: n } );
        setTimeout( sendCharAt, sec * 500, arr, node, idx + 1 );
      }else{
        sendCharAt( arr, node, idx + 1 );
      }
    }
  }

  function replaceOne( str, src, dst ){
    var n = str.indexOf( src );
    if( n > -1 ){
      var s1 = str.substring( 0, n );
      var s2 = str.substring( n + src.length );
      str = s1 + dst + s2;
    }  
  
    return str;
  }

  function kana2hira( str ){
    return str.replace( /[\u30a1-\u30f6]/g, function( match ){
      var c = match.charCodeAt( 0 ) - 0x60;
      return String.fromCharCode( c );
    });
  }

  function hira2kana( str ){
    return str.replace( /[\u3041-\u3096]/g, function( match ){
      var c = match.charCodeAt( 0 ) + 0x60;
      return String.fromCharCode( c );
    });
  }
}

