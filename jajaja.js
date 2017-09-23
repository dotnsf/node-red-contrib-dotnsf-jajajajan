module.exports = function( RED ){
  function HashNode( config ){
    RED.nodes.createNode( this, config );

    var node = this;
    node.on( 'input', function( msg ){
      var text = msg.payload;

      var newlines = [];
      var rests = [ "、", "。", ",", "." ];
      var seconds = [ 'ぁ', 'ゃ' ];
      var arr = [ 'ず', 'た', 'だ', 'て', 'と', 'ど', 'ば', 'ぱ', 'ら' ];
      var nn = [ 'ん' ];
      var lines = text.split( /[\n\r]/ );
      for( i = 0; i < lines.length; i ++ ){
        var line = lines[i];
        line = kana2hira( line );

        if( line != "" ){
          //. (1) 休符
          for( j = 0; j < rests.length; j ++ ){
            var tgt1 = rests[j];
            while( line.indexOf( tgt1 ) > -1 ){
              line = replaceOne( line, tgt1, 'R' );
            }
          }

          for( j = 0; j < seconds.length; j ++ ){
            var second = seconds[j];
            while( line.indexOf( second ) > 0 ){
              var idx = line.indexOf( second );
              var first = line.substring( idx - 1, idx );
    
              if( arr.indexOf( first ) == -1 ){
                arr.push( first );
              }

              //. (2) ４分
              for( k = 0; k < nn.length; k ++ ){
                var tgt2 = first + second + nn[k];
                while( line.indexOf( tgt2 ) > -1 ){
                  line = replaceOne( line, tgt2, '4' );
                }
              }

              //. (3) ２分
              for( k = 0; k < nn.length; k ++ ){
                var tgt3 = first + second + 'ー' + nn[k];
                while( line.indexOf( tgt3 ) > -1 ){
                  line = replaceOne( line, tgt3, '2' );
                }
              }

              //. (4) ８分
              var tgt4 = first + second
              while( line.indexOf( tgt4 ) > -1 ){
                line = replaceOne( line, tgt4, '8' );
              }
            }
          }

          for( j = 0; j < arr.length; j ++ ){
            var first = arr[j];
            while( line.indexOf( first ) > -1 ){
              //. (2) ４分
              for( k = 0; k < nn.length; k ++ ){
                var tgt2 = first + nn[k];
                while( line.indexOf( tgt2 ) > -1 ){
                  line = replaceOne( line, tgt2, '4' );
                }
              }

              //. (3) ２分
              for( k = 0; k < nn.length; k ++ ){
                var tgt3 = first + 'ー' + nn[k];
                while( line.indexOf( tgt3 ) > -1 ){
                  line = replaceOne( line, tgt3, '2' );
                }
              }

              //. (4) ８分
              var tgt4 = first;
              while( line.indexOf( tgt4 ) > -1 ){
                line = replaceOne( line, tgt4, '8' );
              }
            }
          }

          newlines.push( hira2kana( line ) );
        }
      }

      var result = newlines.join( ' ' ); //. '8882 8882'
      sendCharAt( result, node, 0 );
    });
  }
  RED.nodes.registerType( "jajajajan", HashNode );


  function sendCharAt( str, node, idx ){
    if( idx >= str.length ){
      return;
    }else{
      var c = str.charAt( idx );
      var n = -1;
      try{
        n = parseInt( c );
      }catch( e ){
      }

      if( n > 0 ){
        var sec = 8 / n;
        
        node.send( { payload: c } );
        setTimeout( sendCharAt, sec * 500, str, node, idx + 1 );
      }else{
        sendCharAt( str, node, idx + 1 );
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

