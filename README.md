# Clampify

Pure js plugin for truncate multi line text with fixed number of lines.

## Installation

Via NPM
```bash
npm install clampify --save
```
or via bower
```bash
bower install clampify.js --save
```

## Usage

### Initialization
Let's say we have such html layout. Supposed that container is block element and content is inline
```html
<style>
    #demo {
        width: 50%;
        margin: auto;
        line-height: 1.2em;
        /* 
         * Allows to display maximum 5 lines
         * 1.2em * 5
         */
        max-height: 6em;
        overflow: hidden;
    }
</style>
<div id="demo">
    Lorem <b>ipsum dolor</b> sit amet, 
    <a href="#">consectetur <i>adipiscing elit</i></a>, sed do eiusmod tempor 
    incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim <span class="custom-class">veniam, quis nostrud exercitation 
    ullamco <i>laboris nisi ut aliquip ex</i> ea commodo consequat. 
    <b>Duis aute irure dolor in</b> </span>reprehenderit in voluptate 
    velit esse cillum dolore eu fugiat nulla pariatur.
</div>
```

We can initialize clampify using vanilla js

```javascript
var element = document.getElementById('demo');
$clampify(element, {
       // Options
   });

// You can access Clampify instance via clampify property
// element.clampify.resetContent();
```

or via jQuery
```javascript
$('#demo').clampify({
    // options
});

// You can also call methods of Clampify instance via jQuery
// $('#demo').clampify('resetContent')
```

`Clampify` class instance is stored in element property `clampify`

### Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
`maxLines` | `int` | `0` | Number of max lines. If value is less than 1, then height of element will be used for limiting text
`endsWith` | `string`, `Node` | `'\u2026'` | Text or Node that truncated text should be ended with. Displays only if text was truncated
`endsWithClass` | `string` | `'clampify-end'` | Class of endsWith text wrapper (uses if `endsWith` option is a string)
`removeEndChars` | `RegExp` | `/[.,?!\/\\:\-\s]+$/` | Regular expression for remove trailing symbols, must ends with `$` for correct trimming
`autoUpdate` | `boolean` | `false` | If set to true element text will be retruncated after window resize
`hideOverflowY` | `boolean` | `true` | If set to true `overflow-y: hidden` will be automatically added to element's styles

### Methods

#### getId()
Returns id of current instance

Returns: `int`

#### resetContent()
Resets initial content of element

Returns: `void`

#### truncate()
Truncates element's content if it fill more than space available

Returns: `void`

#### destroy()
Resets initial content, disables auto update on window resize and removes link to current instance from element

Returns: `void`

#### enableAutoUpdate()
Enables auto truncation on window resizing

Returns: `void`

#### disableAutoUpdate()
Disables auto truncation on window resizing

Returns: `void`

#### setMaxLines(maxLines)
Sets max lines option to the current instance

Returns: `void`

Argument | Type | Default | Description
-------- | ---- | ------- | -----------
`maxLines` | `int` | `0` | Number of lines

#### getMaxLines()
Gets max lines option of current instance

Returns `int`

### jQuery Usage
You can call methods via jQuery just passing method name instead of options object to `.clampify()` method.
For example:
```javascript
$('#demo').clampify('resetContent');
```
or
```javascript
$('#demo').clampify('setMaxLines', 3);
```

**NOTE**: Using of methods that returns non-void values via jQuery is useless, because jQuery instance will be returned anyways.
For getting data you can use `clampify` property of DOM element.

For example:
```javascript
var maxLines = $('#demo').get(0).clampify.getMaxLines();
```

### Auto Updating
When auto updating is enabled, text will be automatically truncated after window resize. It's useful when you're using responsive layout and elements sizes are not fixed. 
How to enable or disable auto updating, you can see in [Options](#options) section or [Methods](#methods) section.

Auto updating is triggered after window was resized and no more resizing. You can set delay of auto updating with static `setWindowResizeDelay(delay)` method where `delay` is integer value in milliseconds. Default value is `100`

For setting delay in 0.5s you should call it like this
```javascript
Clampify.setWindowResizeDelay(500);
```

## LICENCE
Clampify.js is licenced under the MIT licence.