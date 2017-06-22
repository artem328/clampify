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
         * Allows to display maximum 3 lines
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
```

`Clampify` class instance is stored in element property `clampify`

### Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
`endsWith` | `string`, `Node` | `'\u2026'` | Symbol or Node that truncated text should be ended with. Displays only if text was truncated
`endsWithClass` | `string` | `'clampify-end'` | Class of endsWithSymbol wrapper (uses if `endsWith` option is a string)
`removeEndChars` | `RegExp` | `/[.,?!\/\\:\-\s]+$/` | Regular expression for remove trailing symbols, must ends with `$` for correct trimming
`autoUpdate` | `boolean` | `false` | If set to true element text will be retruncated after window resize

### Methods
Method | Returns | Description
------ | ------- | -----------
`resetContent()` | `void` | Resets initial content of element
`truncate()` | `void` | Truncates element's content to fit block height
`destroy()` | `void` | Resets initial content, disables auto update on window resize and removes link to current instance from element
`enableAutoUpdate()` | `void` | Enables auto truncation on window resize
`disableAutoUpdate()` | `void` | Disables auto truncation on window resize

You can call this method via jQuery just passing method name instead of options object to `.clampify()` method. 
For example:
```javascript
$('#demo').clampify('resetContent');
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