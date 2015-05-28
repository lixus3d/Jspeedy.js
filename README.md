# JSPEEDY

Jspeedy is a "jQuery like" library that concentrates on speed. Almost all methods has been benchmarked against jQuery. It's a modern browser only library.

_It's currently in use on Takatag app for specific parts because jQuery was too slow. If I encounter the same speed problems on another app, I might try to continue Jspeedy._

## Usage

Just include jspeedy.js

Selecting :

```js
// Quickest
var jspeedyObject = $$.byId('item-id');
var jspeedyObject = $$.byClass('item-class');
var jspeedyObject = $$.getNew(domElement);
var jspeedyObject = $$.createFromHTML('<div class="item-class">text</div>');
// Quicker than jQuery but jQuery way
var jspeedyObject = $$('#item-id');
var jspeedyObject = $$('.item-class');
```

After that it's like jquery with sometime small differences to increase speed :

```js
jspeedyObject.addClass('new-class');
var subJspeedyObject = jspeedyObject.byClass('sub-item-class'); // Quickest
var subJspeedyObject = jspeedyObject.find('.sub-item-class'); // Quicker than jQuery
var closestJspeedyObject = jspeedyObject.closest('closest-class');
```

See jspeedy.js file for all available methods.