# node-red-contrib-dotnsf-jajajajan

## Overview

Node for Node-RED which parse rhythm for payload in Japanese.


- ex 1. 'じゃじゃじゃじゃーん'  -> '{payload:"じゃ",note:8}, {payload:"じゃ",note:8}, {payload:"じゃ",note:8}, {payload:"じゃーん",note:2}'

    - This means 'じゃじゃじゃじゃーん' would have rhythm  "8(octed), 8, 8, and 2(half)" tone.

- ex 2. 'ランララララランランラン'  -> '{payload:"ラン",note:4}, {payload:"ラ",note:8}, {payload:"ラ",note:8}, {payload:"ラ",note:8}, {payload:"ラ",note:8}, {payload:"ラン",note:4}, {payload:"ラン",note:4}, {payload:"ラン",note:4}'

    - This means "ランララララランランラン" would have rhythm  "4(quoter) 8 8 8 8 4 4, and 4" tone.


## Licencing

This code is licensed under MIT.

## Copyright

2017-2018 K.Kimura @ Juge.Me all rights reserved.

