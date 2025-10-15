// ==UserScript==
// @name         some name
// @namespace    some namespace
// @version      some version
// @description  some description
// @author       some author
// @match        some match
// @match        some match
// @icon         some icon
// @grant        some grant
// ==/UserScript==

(function () {
    'use strict';

    function setReactInputValue(element, value) {
        // 首先获取元素的 React 内部实例
        const reactKey = Object.keys(element).find(key =>
            key.startsWith('__reactInternalInstance') ||
            key.startsWith('__reactFiber')
        );

        if (reactKey) {
            // 方法1: 通过 React 事件系统设置值
            const reactProps = element[reactKey]?.memoizedProps;
            if (reactProps && reactProps.onChange) {
                // 模拟 React 的 onChange 事件
                const nativeEventValue = {
                    target: element,
                    currentTarget: element
                };

                // 先设置 DOM 值
                element.value = value;

                // 触发 React 的 onChange
                reactProps.onChange(nativeEventValue);

                // 触发其他可能的事件
                if (reactProps.onInput) {
                    reactProps.onInput(nativeEventValue);
                }
                if (reactProps.onBlur) {
                    reactProps.onBlur(nativeEventValue);
                }

                console.log('✅ 通过 React 属性设置成功');
                return true;
            }
        }

        // 方法2: 如果上述方法失败，使用更完整的原生事件序列
        return setReactInputValueFallback(element, value);
    }

    function setReactInputValueFallback(element, value) {
        // 完整的焦点和输入事件序列
        element.focus();
        element.select();
        element.value = value;

        // 触发完整的事件序列
        const events = [
            'focus', 'keydown', 'keypress', 'keyup', 'input', 'change', 'blur'
        ];

        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, {
                bubbles: true,
                cancelable: true
            }));
        });

        // 特别加强 input 事件
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        inputEvent.simulated = true;
        element.dispatchEvent(inputEvent);

        // 触发 change 事件
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        changeEvent.simulated = true;
        element.dispatchEvent(changeEvent);

        console.log('✅ 通过完整事件序列设置成功');
        return true;
    }



    let USERNAME = "some username"
    let PASSWORD = "some password"

    async function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    let isUsernameInput = false
    function injectUsername() {
        setReactInputValue(document.querySelectorAll('input')[0], USERNAME)
        isUsernameInput = true
    }

    let isPasswordInput = false
    function injectPassword() {
        setReactInputValue(document.querySelectorAll('input')[1], PASSWORD)
        isPasswordInput = true
    }

    const EventEnum = {
        INPUT_USERNAME: 1,
        CLICK_NEXT: 2,
        INPUT_PASSWORD: 3,
        CLICK_LOGIN: 4,
        SKIP_BINDING: 5,
    }

    function getEvent() {
        if (document.querySelectorAll('span')[0]?.innerText == '跳过绑定') {
            return EventEnum.SKIP_BINDING
        }
        if (document.querySelectorAll('button')[0].innerText == "下一步") {
            if (!isUsernameInput) {
                return EventEnum.INPUT_USERNAME
            } else {
                return EventEnum.CLICK_NEXT
            }
        }
        if (document.querySelectorAll('button')[0].innerText == "登录") {
            if (!isPasswordInput) {
                return EventEnum.INPUT_PASSWORD
            } else {
                return EventEnum.CLICK_LOGIN
            }
        }
        return null
    }


    async function eventLoop() {
        while (true) {
            await sleep(1000)
            switch (getEvent()) {
                case EventEnum.SKIP_BINDING:
                    console.log('[EventEnum.SKIP_BINDING]')
                    document.querySelectorAll('button')[0].click()
                case EventEnum.INPUT_USERNAME:
                    console.log('[EventEnum.INPUT_USERNAME]')
                    injectUsername()
                    break
                case EventEnum.CLICK_NEXT:
                    console.log('[EventEnum.CLICK_NEXT]')
                    document.querySelectorAll('button')[0].click()
                    break
                case EventEnum.INPUT_PASSWORD:
                    console.log('[EventEnum.INPUT_PASSWORD]')
                    injectPassword()
                    break
                case EventEnum.CLICK_LOGIN:
                    console.log('[EventEnum.CLICK_LOGIN]')
                    document.querySelectorAll('button')[0].click()
                    return
                default:
                    console.log("无法判断事件")
            }
        }
    }
    window.onload = function () {
        eventLoop()
    }
})();