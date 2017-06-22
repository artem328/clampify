/*!
 * Clampify v1.0.0
 *
 * Copyright (c) 2016 Artem Vozhzhov <vojjov.artem@ya.ru>
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
     *  @type {Node|string} endsWith  Node or text that will be appended
     *                                to the end of truncated content
     *                                Default: '\u2026'
     *  @type {string} endsWithClass  Class of end text
     *                                (applied only if string passed in endsWith option)
     *                                Default: 'clampify-end'
     *  @type {RegExp} removeEndChars RegExp for removing end chars
     *                                in the end of truncated string
     *                                Default: /[.,?!\/\\:\-\s]+$/
     *  @type {boolean} autoUpdate    Should this instance auto truncate on window resize
     *                                Default: false
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

        this.element = element;
        this.element.clampify = this;
        this.originalContent = element.innerHTML;

        var endsWith = options.endsWith || '\u2026',
            endsWithClass = options.endsWithClass || 'clampify-end';

        this.removeEndChars = options.removeEndChars || /[.,?!\/\\:\-\s]+$/;

        this._updateLimit();

        if (endsWith instanceof Node) {
            this.endsWithNode = endsWith.cloneNode(true);
        } else {
            this.endsWithNode = document.createElement('span');
            this.endsWithNode.className = endsWithClass;
            this.endsWithNode.appendChild(document.createTextNode(endsWith));
        }

        this.innerWrapper = document.createElement('span');
        this.outerWrapper = document.createElement('span');

        this.outerWrapper.appendChild(this.innerWrapper);

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
        this.limit = this.element.offsetHeight || this.element.clientHeight;
    };

    /**
     * Checks if current content size
     * is more than container size
     *
     * @returns {boolean}
     * @private
     */
    Clampify.prototype._isOverLimited = function () {
        return this.outerWrapper.offsetHeight > this.limit;
    };

    /**
     * Wraps content of element for
     * calculation purposes
     *
     * @private
     */
    Clampify.prototype._wrap = function () {
        this.innerWrapper.innerHTML = this.element.innerHTML;
        this.element.innerHTML = '';
        this.element.appendChild(this.outerWrapper);
    };

    /**
     * Unwraps content of element
     *
     * @private
     */
    Clampify.prototype._unwrap = function () {
        this.element.innerHTML = this.innerWrapper.innerHTML;
    };

    /**
     * Adds node with end text to element
     *
     * @param {HTMLElement} to
     * @private
     */
    Clampify.prototype._addEndsWithNode = function (to) {
        to = to || this.outerWrapper;
        to.appendChild(this.endsWithNode);
    };

    /**
     * Removes node with end text from element
     *
     * @param {HTMLElement} from
     * @private
     */
    Clampify.prototype._removeEndsWithNode = function (from) {
        from = from || this.outerWrapper;
        from.removeChild(this.endsWithNode);
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
        return words.join(' ').replace(this.removeEndChars, '');
    };

    /**
     * Fits content to container size
     *
     * @param {Node} node
     * @private
     */
    Clampify.prototype._calculate = function (node) {
        node = node || this.innerWrapper;

        if (node instanceof Text) {
            var words = node.textContent.split(' ');

            node.textContent = this._joinWords(words);

            while (this._isOverLimited() && words.length > 0) {
                words.pop();
                node.textContent = this._joinWords(words);
            }

            if (!node.textContent) {
                var prev;

                if (node.previousSibling) {
                    prev = node.previousSibling;
                    node.parentNode.removeChild(node);
                } else {
                    prev = node.parentNode.previousSibling;
                    node.parentNode.parentNode.removeChild(node.parentNode);
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

                isOverLimited = this._isOverLimited();

                if (isOverLimited) {
                    this._calculate(childNode);
                    break;
                }
            }
        }
    };

    /**
     * Resets initial content of element
     */
    Clampify.prototype.resetContent = function () {
        this.element.innerHTML = this.originalContent;
    };

    /**
     * Truncates element's content
     * to fit block height
     */
    Clampify.prototype.truncate = function () {
        this.resetContent();
        this._updateLimit();
        this._wrap();

        if (this._isOverLimited()) {
            this._addEndsWithNode();
            this._calculate();
            this._removeEndsWithNode();
            this._addEndsWithNode(this.innerWrapper);
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
        delete this.element.clampify;
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
        var $ = root.jQuery;
        $.fn.clampify = function (options) {
            return $(this).each(function() {
                if (typeof options === 'string') {
                    if (options.indexOf('_') === -1 && this.clampify instanceof Clampify) {
                        if (typeof this.clampify[options] === 'function') {
                            this.clampify[options].apply(this.clampify);
                        }
                        return $(this);
                    }

                    options = {};
                }

                if (this.clampify instanceof Clampify) {
                    this.clampify.destroy();
                }

                return $clampify(this, options);
            });
        };
    }
})(window);