//. app.js

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    http = require( 'http' ),
    syncreq = require( 'sync-request' ),
    multer = require( 'multer' ),
    unzip = require( 'unzip' ),
    xml2js = require( 'xml2js' ),
    app = express();
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './uploads/' } ).single( 'mxml' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );


app.post( '/upload', function( req, res ){
  var melodys = [];

  var originalname = req.file.originalname;  //. 'xxx.xml'
  var path = req.file.path;
  if( originalname.toLowerCase().endsWith( ".xml" ) ){
    fs.readFile( path, ( err, data ) => {
      parseMusicXML( data.toString() ).then( function( melodys ){
        fs.unlink( path, function( err ){} );
    
        res.write( JSON.stringify( melodys, null, 2 ) );
        res.end();
      });
    });
  }else if( originalname.toLowerCase().endsWith( "mxl" ) ){
    fs.createReadStream( path )
        .pipe( unzip.Parse() )
        .on( 'entry', function( entry ){
      var filename = entry.path;
      var type = entry.type;  //. 'Directory' or 'File'
      var size = entry.size;
      if( filename.toLowerCase().endsWith( ".xml" ) && filename.indexOf( '/' ) == -1 ){
        var xmlpath = './uploads/' + filename;
        entry.pipe( fs.createWriteStream( xmlpath ) );
        fs.unlink( path, function( err ){} );

        fs.readFile( xmlpath, ( err, data ) => {
          parseMusicXML( data.toString() ).then( function( melodys ){
            fs.unlink( xmlpath, function( err ){} );
            fs.unlink( path, function( err ){} );
    
            res.write( JSON.stringify( melodys, null, 2 ) );
            res.end();
          });
        });
      }
    });
  }
});

app.post( '/post', function( req, res ){
  var text = req.body.text;
  result = { input: text };

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

  result.output = newlines.join( ' ' );
  
  res.write( JSON.stringify( result ) );
  res.end();
});

app.post( '/query', function( req, res ){
  var text = req.body.text;
  var query = {
    query: {
      match: { rhythm: text }
    }
  };
  var result = querySearchEngine( 'music', 'musescore', query );

  res.write( result );
  res.end();
});

app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );


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

function postSearchEngine( index, type, document ){
  var dataStr = JSON.stringify( document );
  var opt = { host: 'localhost', port: 9200, path: '/' + index + '/' + type, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': dataStr.length } };
  var post_req = http.request( opt, ( post_res ) => {
    post_res.setEncoding( 'utf8' );
    post_res.on( 'data', ( chunk ) => {
      //console.log( 'POST_RES_BODY: ' + chunk );
    });
  });
  post_req.on( 'error', ( e ) => {
    console.log( 'error: ' + e.message );
  });
  post_req.write( dataStr );
  post_req.end();
}

//. query = { query: { query_string: { match: {rhythm: "XXXXXX"} } } }
function querySearchEngine( index, type, query ){
  //console.log( 'querySearchEngine: query = ' + query );

  var query_res = syncreq( 'POST', 'http://localhost:9200/' + index + '/' + type + '/_search', { json: query } );

  var body = query_res.getBody();
  //console.log( 'querySearchEngine: body = ' + body );

  return body;
}

function parseMusicXML( xml ){
  return new Promise( function( resolve ){
    var melodys = [];
    var rhythm = "";

    xml2js.parseString( xml, ( err, result ) => {
      if( err ){
        console.log( err );
      }else{
        //. http://roomba.hatenablog.com/entry/2016/02/03/150354
        //console.log( result );
        var scorepartwise = result['score-partwise'];
        var title = '(no title)';
        var works = scorepartwise['work'];
        if( works ){
          title = works[0]['work-title'][0];
        }
        var source = '';
        try{
          source = scorepartwise['identification'][0]['source'][0]; 
        }catch( e ){}
        if( source == '' ){
          try{
            source = scorepartwise['identification'][0]['source']; 
          }catch( e ){}
        }

        console.log( title + ": " + source );

        if( source != null && source != '' ){
          var partlists = scorepartwise['part-list'];
          var parts = result['score-partwise']['part'];
//          console.log( partlists );
//          console.log( parts );

          var minbeat = 0;
          for( i = 0; i < parts.length; i ++ ){
            var part = parts[i];

            var part_attr = part['$'];
            var part_id = part_attr['id'];
            var staff = parseInt( part_id.substr( 1 ) );

            var measures = part['measure'];
            for( j = 0; j < measures.length; j ++ ){
              var measure = measures[j];

              var measure_attr = measure['$'];
              var measure_idx = parseInt( measure_attr['number'] );

              if( i == 0 ){
                var attributes = measure['attributes'];
                if( attributes ){
                  for( k = 0; k < attributes.length; k ++ ){
                    var attribute = attributes[k];
                    var divisions = attribute['divisions'];
                    var division = divisions[0];
                    //console.log( 'division = ' + division );
                    var time = attribute['time'];
                    var beattypes = time[0]['beat-type'];
                    var beattype = beattypes[0];
                    //console.log( 'beattype = ' + beattype );
      
                    min = parseInt( beattype ) * parseInt( division );
                    console.log( 'min = ' + min );
                  }
                }
              }
    
              var notes = measure['note'];
              if( notes ){
                for( k = 0; k < notes.length; k ++ ){
                  var note = notes[k];
    
                  var pitch = '';
    
                  var staffs = note['staff'];
                  if( staffs ){
                    staff = parseInt( staffs[0] );
                  }
    
                  var durations = note['duration'];
                  if( durations ){
                    var duration = parseInt( durations[0] );
                    var length = min / duration;
    
                    var rests = note['rest'];
                    if( rests ){
                      //. 休符
                      pitch = 'R';
                    }else{
                      //. 音符
                      var chords = note['chord'];
                      var chord = ( chords ? "+" : "" );
    
                      var type = note['type'][0];
                      var dot = note['dot'];
                      type += ( dot ? "." : "" );
    
                      var pitchs = note['pitch'];
                      var step = pitchs[0]['step'][0];
                      var octave = pitchs[0]['octave'][0];
                      pitch = step + octave;
                      var alters = pitchs[0]['alter'];
                      if( alters ){
                        pitch += ( ( alters[0] == '1' ) ? 'S' : 'F' );;
                      }
                    }
    
                    var p = chord + "(" + measure_idx + ":" + staff + ")" + pitch + "-" + length + "-" + type;
  
                    p = "(" + measure_idx + ")" + chord + pitch + "-" + length + "-" + type;
                    if( melodys.length < staff ){
                      melodys.push( [] );
                    }
                    melodys[staff-1].push( p );
    
                    if( staff == 1 ){
                      //. （符点）４分音符は２、（符点）２分音符と全音符は３、他は１としている
                      var m = "";
                      if( type ){
                        if( type.indexOf( "quarter" ) == 0 ){
                          m = "2";
                        }else if( type.indexOf( "whole" ) == 0 ){
                          m = "3";
                        }else if( type.indexOf( "half" ) == 0 ){
                          m = "3";
                        }else if( type.indexOf( "eighth" ) == 0 ){
                          m = "1";
                        }else if( type.indexOf( "16th" ) == 0 ){
                          m = "1";
                        }else if( type.indexOf( "32nd" ) == 0 ){ //. ?
                          m = "1";
                        }
                      }
    
                      if( m.length == 1 ){
                        if( rhythm.length == 0 ){
                          rhythm = m;
                        }else{
                          rhythm += ( "-" + m );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
  
          //. title, source, rhythm を検索エンジンに登録
          var data = { title: title, source: source, rhythm: rhythm };
          postSearchEngine( 'music', 'musescore', data );
  
          melodys.push( rhythm );
        }
  
        resolve( melodys );
      }
    });
  });
}

