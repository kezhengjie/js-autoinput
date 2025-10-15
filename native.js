// ==UserScript==
// @name         some name
// @namespace    some namespace
// @version      some version
// @description  some description
// @author       some author
// @match        some match
// @icon         some icon
// @grant        some grant
// ==/UserScript==

(function () {
    'use strict';
    function clickLoginButton() {
        document.querySelectorAll('button')[0].click()
    }

    function injectPassword() {
        document.querySelectorAll('input')[1].value = 'password'
    }

    function triggerInputEvent() {
        document.querySelectorAll('input')[1].dispatchEvent(new Event('input', { bubbles: true }))
    }

    window.onload = function () {
        setTimeout(function () {
            injectPassword()
            triggerInputEvent()
            clickLoginButton()
        }, 1000)
    }
})();