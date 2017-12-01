/*!
 * Clampify v1.2.0
 *
 * Copyright (c) 2017 Artem Vozhzhov <vojjov.artem@ya.ru>
 *
 * Licenced under the MIT licence.
 */
(function (root) {
    var
        /**
         * Instance ID counter
         *
         * @type {number}
         */
        id = 0,

        /**
         * Timer ID of window resize action
         *
         * @type {number}
         */
        windowResizeTimer = 0,

        /**
         * List of instances
         * that listening window resize
         *
         * @type {Array}
         */
        autoUpdates = [],

        /**
         * Delay before auto truncate text
         * after window resize in milliseconds
         *
         * @type {number}
         */
        windowResizeDelay = 100;

    /**
     *
     * @param {HTMLElement} element
     * @param {object} options {
     *  @type {Node|string} endsWith Node or text that will be appended
     *                               to the end of truncated content
     *                               Default: '\u2026'
     *  @type {string} endsWithClass Class of end text
     *                               (applied only if string passed in endsWith option)
     *                               Default: 'clampify-end'
     *  @type {RegExp} removeEndChars RegExp for removing end chars
     *                                in the end of truncated string
     *                                Default: /[.,?!\/\\:\-\s]+$/
     *  @type {boolean} autoUpdate Should this instance auto truncate on window resize
     *                             Default: false
     *  @type {boolean} hideOverflowY Should this instance element have 'overflow-y: hidden' css style
     *                                Default: true
     *  @type {boolean} appendToLastElement If set to true, end element will be appended
     *                                      to last child of element (if possible)
     *                                      Default: false
     *  @type {boolean} lastElementDeepAppend If set to true, will lookup for deepest html element
     *                                        in last child element, and append end text in there
     *                                        Works only with appendToLastElement option
     *                                        Default: false
     * }
     * @constructor
     */
    var Clampify = function Clampify(element, options) {
        options = options || {};

        var _id = ++id;

        /**
         *
         * @returns {number}
         * @private
         */
        this._getId = function () {
            return _id;
        };

        this._element = element;
        this._element.clampify = this;
        this._originalContent = element.innerHTML;

        var endsWith = options.endsWith || '\u2026',
            endsWithClass = options.endsWithClass || 'clampify-end';

        this._removeEndChars = options.removeEndChars || /[.,?!\/\\:\-\s]+$/;
        this._hideOverflowY = options.hasOwnProperty('hideOverflowY') ? !!options.hideOverflowY : true;
        this._appendToLastElement = !!options.appendToLastElement;
        this._lastElementDeepAppend = !!options.lastElementDeepAppend;
        this.setMaxLines(options.maxLines);

        this._styles = {
            overflowY: this._element.style.overflowY,
            maxHeight: this._element.style.maxHeight
        };

        this._updateLimit();

        if (endsWith instanceof Node) {
            this._endsWithNode = endsWith.cloneNode(true);
        } else {
            this._endsWithNode = document.createElement('span');
            this._endsWithNode.className = endsWithClass;
            this._endsWithNode.appendChild(document.createTextNode(endsWith));
        }

        this._innerWrapper = document.createElement('span');
        this._outerWrapper = document.createElement('span');

        this._outerWrapper.appendChild(this._innerWrapper);

        if (options.autoUpdate) {
            this.enableAutoUpdate();
        }
    };

    /**
     * Sets delay for auto truncate on window resize
     *
     * @param {number} delay
     */
    Clampify.setWindowResizeDelay = function (delay) {
        windowResizeDelay = delay < 1 ? 1 : delay;
    };

    /**
     * Saves height of element
     * for next calculations
     *
     * @private
     */
    Clampify.prototype._updateLimit = function () {
        if (this._maxLines > 0) {
            var testNode = document.createElement('span');
            testNode.appendChild(document.createTextNode('\u00a0'));

            this._element.innerHTML = '';
            this._element.appendChild(testNode);

            var elementHeight = this._element.offsetHeight || this._element.clientHeight,
                testNodeHeight = testNode.offsetHeight;

            this._limit = Math.max(elementHeight, testNodeHeight) * this._maxLines;

            this.resetContent();

            this._setElementInlineStyles();
        } else {
            this._limit = this._element.offsetHeight || this._element.clientHeight;
        }
    };

    /**
     * Checks if current content size
     * is more than container size
     *
     * @returns {boolean}
     * @private
     */
    Clampify.prototype._isOverLimited = function () {
        return this._outerWrapper.offsetHeight > this._limit;
    };

    /**
     * Sets styles to element for limiting
     * its content with desired number of rows
     *
     * @private
     */
    Clampify.prototype._setElementInlineStyles = function () {
        if (this._hideOverflowY) {
            this._element.style.overflowY = 'hidden';
        }
        this._element.style.maxHeight = this._limit + 'px';
    };

    /**
     * Restore element's changed styles
     *
     * @private
     */
    Clampify.prototype._unsetElementInlineStyles = function () {
        this._element.style.overflowY = this._styles.overflowY;
        this._element.style.maxHeight = this._styles.maxHeight;
    };

    /**
     * Wraps content of element for
     * calculation purposes
     *
     * @private
     */
    Clampify.prototype._wrap = function () {
        this._innerWrapper.innerHTML = this._element.innerHTML;
        this._element.innerHTML = '';
        this._element.appendChild(this._outerWrapper);
    };

    /**
     * Unwraps content of element
     *
     * @private
     */
    Clampify.prototype._unwrap = function () {
        this._element.removeChild(this._outerWrapper);
        this._element.innerHTML = this._innerWrapper.innerHTML;
    };

    /**
     * Adds node with end text to element
     *
     * @param {Node} to
     * @private
     */
    Clampify.prototype._addEndsWithNode = function (to) {
        this._endsWithNodeClone = this._endsWithNode.cloneNode(true);
        this._endsWithNodeHolder = to;
        to.appendChild(this._endsWithNodeClone);
    };

    /**
     * Removes node with end text from element
     *
     * @private
     */
    Clampify.prototype._removeEndsWithNode = function () {
        if (this._endsWithNodeHolder && this._endsWithNodeClone) {
            this._endsWithNodeHolder.removeChild(this._endsWithNodeClone);
        }
        this._resetEndsWithNodeCloneAndHolder();
    };

    /**
     *
     * @private
     */
    Clampify.prototype._resetEndsWithNodeCloneAndHolder = function () {
        this._endsWithNodeClone = null;
        this._endsWithNodeHolder = null;
    };

    /**
     *
     * @param {Node} node
     * @private
     */
    Clampify.prototype._addEndsWithNodeToEnd = function (node) {
        this._removeEndsWithNode();

        if (this._appendToLastElement) {
            if (Node.TEXT_NODE === node.nodeType) {
                this._addEndsWithNode(node.parentNode);
            } else {
                if (this._lastElementDeepAppend) {
                    var _node = node;
                    while (Node.ELEMENT_NODE === _node.lastChild.nodeType) {
                        _node = _node.lastChild;
                    }
                    this._addEndsWithNode(_node);
                } else {
                    this._addEndsWithNode(node);
                }
            }
        } else {
            this._addEndsWithNode(this._innerWrapper);
        }
    };

    /**
     * Returns string from array of words
     * Also trimming end chars
     *
     * @param {Array} words
     * @returns {string}
     * @private
     */
    Clampify.prototype._joinWords = function (words) {
        return words.join(' ').replace(this._removeEndChars, '');
    };

    /**
     * Fits content to container size
     *
     * @param {Node} node
     * @private
     */
    Clampify.prototype._calculate = function (node) {
        node = node || this._innerWrapper;

        if (Node.TEXT_NODE === node.nodeType) {
            var words = node.textContent.split(' ');

            node.textContent = this._joinWords(words);
            this._addEndsWithNodeToEnd(node);

            while (this._isOverLimited() && words.length > 0) {
                this._removeEndsWithNode();
                words.pop();
                node.textContent = this._joinWords(words);
                this._addEndsWithNodeToEnd(node);
            }

            this._removeEndsWithNode();

            if (!node.textContent) {
                var prev, parent;

                if (node.previousSibling) {
                    prev = node.previousSibling;
                    node.parentNode.removeChild(node);
                } else {
                    prev = node.parentNode.previousSibling;
                    parent = node.parentNode;
                    parent.parentNode.removeChild(parent);
                }

                this._calculate(prev);
            }
        } else {
            var nodeClone = node.cloneNode(true);
            node.innerHTML = '';

            while (nodeClone.childNodes.length > 0) {
                var childNode = nodeClone.childNodes[0],
                    isOverLimited;

                node.appendChild(childNode);

                this._addEndsWithNodeToEnd(childNode);

                isOverLimited = this._isOverLimited();

                this._removeEndsWithNode();

                if (isOverLimited) {
                    this._calculate(childNode);
                    break;
                }
            }
        }
    };

    /**
     * Sets max lines option to the current instance
     *
     * @param {int} maxLines Number of max lines to be displayed
     */
    Clampify.prototype.setMaxLines = function (maxLines) {
        maxLines = parseInt(maxLines);
        this._maxLines = !isNaN(maxLines) ? maxLines : 0;
    };

    /**
     * Gets max lines option of current instance
     *
     * @return {int} Number of max lines option currently set
     */
    Clampify.prototype.getMaxLines = function () {
        return this._maxLines;
    };

    /**
     * Resets initial content of element
     */
    Clampify.prototype.resetContent = function () {
        this._element.innerHTML = this._originalContent;
    };

    /**
     * Truncates element's content
     * to fit block height
     */
    Clampify.prototype.truncate = function () {
        this.resetContent();
        this._updateLimit();
        this._wrap();
        this._resetEndsWithNodeCloneAndHolder();

        if (this._isOverLimited()) {
            this._calculate();
            this._addEndsWithNodeToEnd(this._innerWrapper.lastChild, this._innerWrapper);
        }

        this._unwrap();
    };

    /**
     * Returns id of current instance
     *
     * @returns {number}
     */
    Clampify.prototype.getId = function () {
        return this._getId();
    };

    /**
     * Enables auto truncation on window resize
     */
    Clampify.prototype.enableAutoUpdate = function () {
        autoUpdates.push(this);
    };

    /**
     * Disables auto truncation on window resize
     */
    Clampify.prototype.disableAutoUpdate = function () {
        for (var i = 0, l = autoUpdates.length; i < l; i++) {
            if (this.getId() === autoUpdates[i].getId()) {
                autoUpdates.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Resets initial content, disables
     * auto update on window resize
     * and removes link to current instance from element
     */
    Clampify.prototype.destroy = function () {
        this.disableAutoUpdate();
        this.resetContent();
        this._unsetElementInlineStyles();
        delete this._element.clampify;
    };

    root.addEventListener('resize', function () {
        clearTimeout(windowResizeTimer);
        windowResizeTimer = setTimeout(function () {
            for (var i = 0, l = autoUpdates.length; i < l; i++) {
                autoUpdates[i].truncate();
            }
        }, windowResizeDelay);
    });

    root.Clampify = Clampify;
    root.$clampify = function $clampify(element, options) {
        var clampify = new Clampify(element, options);
        clampify.truncate();
        return element;
    };

    if (typeof root.jQuery !== 'undefined') {
        var $ = root.jQuery,
            allowedMethods = [
                'getId', 'resetContent', 'truncate',
                'destroy', 'enableAutoUpdate', 'disableAutoUpdate',
                'setMaxLines', 'getMaxLines'
            ];
        $.fn.clampify = function (options) {
            var args = Array.prototype.slice.apply(arguments);
            args.shift();
            return $(this).each(function () {
                if (typeof options === 'string') {
                    if (allowedMethods.indexOf(options) > -1 && this.clampify instanceof Clampify) {
                        if (typeof this.clampify[options] === 'function') {
                            this.clampify[options].apply(this.clampify, args);
                        }
                        return $(this);
                    }

                    options = {};
                }

                // Reinitialization
                if (this.clampify instanceof Clampify) {
                    this.clampify.destroy();
                }

                return $clampify(this, options);
            });
        };
    }
})(window);