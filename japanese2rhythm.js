//. japanese2thythm.js

//. 小文字を除いたひらがな
//. [\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092]
//. 小文字を除いたカタカナ
//. [\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f2]

exports.japanese2rhythm = function( str ){
  //. R
  str = replaceAllRegExp( str, /([、。])(?!\:)/, '$1:R,' );

  //. 2
  str = replaceAllRegExp( str, /([\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092][\u3041\u3083]ー\u3093)(?![\:\u3041\u3083])/, '$1:2,' );
  str = replaceAllRegExp( str, /([\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f2][\u30a1\u30e3]ー\u30f3)(?![\:\u30a1\u30e3])/, '$1:2,' );
  str = replaceAllRegExp( str, /([\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092][\u3041\u3083]ー)(?![\:\u3041\u3083\u3093])/, '$1:2,' );
  str = replaceAllRegExp( str, /([\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f2][\u30a1\u30e3]ー)(?![\:\u30a1\u30e3\u30f3])/, '$1:2,' );
//  str = replaceAllRegExp( str, /([\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092]ー\u3093)(?!\:)/, '$1:2,' );
//  str = replaceAllRegExp( str, /([\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f2]ー\u30f3)(?!\:)/, '$1:2,' );

  //. 4
  str = replaceAllRegExp( str, /([\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092][\u3041\u3083]?\u3093)(?!\:)/, '$1:4,' );
  str = replaceAllRegExp( str, /([\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f2][\u30a1\u30e3]?\u30f3)(?!\:)/, '$1:4,' );

  //. 8
  str = replaceAllRegExp( str, /([\u3042\u3044\u3046\u3048\u304a-\u3062\u3064-\u3082\u3084\u3086\u3088-\u308d\u308f\u3092-\u3096][\u3041\u3083]?)(?![\:ー\u3041\u3083\u3093])/, '$1:8,' );
  str = replaceAllRegExp( str, /([\u30a2\u30a4\u30a6\u30a8\u30aa-\u30c2\u30c4-\u30e2\u30e4\u30e6\u30e8-\u30ed\u30ef\u30f1-\u30f6][\u30a1\u30e3]?)(?![\:ー\u30a1\u30e3\u30f3])/, '$1:8,' );

  return str;
};

function replaceAllRegExp( str, re, re_str ){
  var str1 = null;
  var b = true;
  while( b ){
    str1 = str.replace( re, re_str );
    b = ( str1 != str );
    str = str1;
  };

  return str;
}

