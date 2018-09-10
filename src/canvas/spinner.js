/**
 A Progress displays a progress animation at the center of its {{#crossLink "Canvas"}}{{/crossLink}} while things are loading or otherwise busy.

 ## Overview

 * Spinners are normally shown by {{#crossLink "Model"}}Models{{/crossLink}} while they are loading, however they may also
 be shown by any application code that wants to indicate busyness.
 * By default, they are also shown by components that load assets, such as {{#crossLink "Texture"}}{{/crossLink}}. You
 can disable that by flipping the Spinner's {{#crossLink "Spinner/textures:property"}}{{/crossLink}} property.
 * A Spinner component has a {{#crossLink "Spinner/processes:property"}}{{/crossLink}} count that indicates how many
 active processes it currently represents. As a process starts, a process would increment {{#crossLink "Spinner/processes:property"}}{{/crossLink}}, then as it
 completes (or fails), would decrement it again.
 * A Spinner is only visible while {{#crossLink "Spinner/processes:property"}}{{/crossLink}} is greater than zero.

 ## Examples

 * [Loading glTF model with spinner](../../examples/#importing_gltf_GearboxAssy)

 ## Usage

 ````javascript
 var spinner = myScene.canvas.spinner;

 // Increment count of busy processes represented by the spinner;
 // assuming the count was zero, this now shows the spinner
 spinner.processes++;

 // Increment the count again, by some other process;
 // spinner already visible, now requires two decrements
 // before it becomes invisible again
 spinner.processes++;

 // Decrement the count; count still greater
 // than zero, so spinner remains visible
 spinner.process--;

 // Decrement the count; count now zero,
 // so spinner becomes invisible
 spinner.process--;
 ````

 By default, a Spinner shows while resources are loading for components like
 {{#crossLink "Texture"}}{{/crossLink}}. We can disable that like this:

 ````javascript
 // Don't show while resources are loading for Textures etc.
 spinner.textures = false;
 ````

 @class Spinner
 @module xeogl
 @submodule canvas
 @extends Component
 */

import {Component} from '../component.js';

const type = "xeogl.Spinner";

let spinnerCSSInjected = false; // Ensures lazy-injected CSS only injected once

const spinnerCSS = ".sk-fading-circle {\
        background: transparent;\
        margin: 20px auto;\
        width: 50px;\
        height:50px;\
        position: relative;\
        }\
        .sk-fading-circle .sk-circle {\
        width: 120%;\
        height: 120%;\
        position: absolute;\
        left: 0;\
        top: 0;\
        }\
        .sk-fading-circle .sk-circle:before {\
        content: '';\
        display: block;\
        margin: 0 auto;\
        width: 15%;\
        height: 15%;\
        background-color: #ff8800;\
        border-radius: 100%;\
        -webkit-animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;\
        animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;\
        }\
        .sk-fading-circle .sk-circle2 {\
        -webkit-transform: rotate(30deg);\
        -ms-transform: rotate(30deg);\
        transform: rotate(30deg);\
    }\
    .sk-fading-circle .sk-circle3 {\
        -webkit-transform: rotate(60deg);\
        -ms-transform: rotate(60deg);\
        transform: rotate(60deg);\
    }\
    .sk-fading-circle .sk-circle4 {\
        -webkit-transform: rotate(90deg);\
        -ms-transform: rotate(90deg);\
        transform: rotate(90deg);\
    }\
    .sk-fading-circle .sk-circle5 {\
        -webkit-transform: rotate(120deg);\
        -ms-transform: rotate(120deg);\
        transform: rotate(120deg);\
    }\
    .sk-fading-circle .sk-circle6 {\
        -webkit-transform: rotate(150deg);\
        -ms-transform: rotate(150deg);\
        transform: rotate(150deg);\
    }\
    .sk-fading-circle .sk-circle7 {\
        -webkit-transform: rotate(180deg);\
        -ms-transform: rotate(180deg);\
        transform: rotate(180deg);\
    }\
    .sk-fading-circle .sk-circle8 {\
        -webkit-transform: rotate(210deg);\
        -ms-transform: rotate(210deg);\
        transform: rotate(210deg);\
    }\
    .sk-fading-circle .sk-circle9 {\
        -webkit-transform: rotate(240deg);\
        -ms-transform: rotate(240deg);\
        transform: rotate(240deg);\
    }\
    .sk-fading-circle .sk-circle10 {\
        -webkit-transform: rotate(270deg);\
        -ms-transform: rotate(270deg);\
        transform: rotate(270deg);\
    }\
    .sk-fading-circle .sk-circle11 {\
        -webkit-transform: rotate(300deg);\
        -ms-transform: rotate(300deg);\
        transform: rotate(300deg);\
    }\
    .sk-fading-circle .sk-circle12 {\
        -webkit-transform: rotate(330deg);\
        -ms-transform: rotate(330deg);\
        transform: rotate(330deg);\
    }\
    .sk-fading-circle .sk-circle2:before {\
        -webkit-animation-delay: -1.1s;\
        animation-delay: -1.1s;\
    }\
    .sk-fading-circle .sk-circle3:before {\
        -webkit-animation-delay: -1s;\
        animation-delay: -1s;\
    }\
    .sk-fading-circle .sk-circle4:before {\
        -webkit-animation-delay: -0.9s;\
        animation-delay: -0.9s;\
    }\
    .sk-fading-circle .sk-circle5:before {\
        -webkit-animation-delay: -0.8s;\
        animation-delay: -0.8s;\
    }\
    .sk-fading-circle .sk-circle6:before {\
        -webkit-animation-delay: -0.7s;\
        animation-delay: -0.7s;\
    }\
    .sk-fading-circle .sk-circle7:before {\
        -webkit-animation-delay: -0.6s;\
        animation-delay: -0.6s;\
    }\
    .sk-fading-circle .sk-circle8:before {\
        -webkit-animation-delay: -0.5s;\
        animation-delay: -0.5s;\
    }\
    .sk-fading-circle .sk-circle9:before {\
        -webkit-animation-delay: -0.4s;\
        animation-delay: -0.4s;\
    }\
    .sk-fading-circle .sk-circle10:before {\
        -webkit-animation-delay: -0.3s;\
        animation-delay: -0.3s;\
    }\
    .sk-fading-circle .sk-circle11:before {\
        -webkit-animation-delay: -0.2s;\
        animation-delay: -0.2s;\
    }\
    .sk-fading-circle .sk-circle12:before {\
        -webkit-animation-delay: -0.1s;\
        animation-delay: -0.1s;\
    }\
    @-webkit-keyframes sk-circleFadeDelay {\
        0%, 39%, 100% { opacity: 0; }\
        40% { opacity: 1; }\
    }\
    @keyframes sk-circleFadeDelay {\
        0%, 39%, 100% { opacity: 0; }\
        40% { opacity: 1; }\
    }";

class Spinner extends Component {

    /**
     JavaScript class name for this Component.

     For example: "xeogl.AmbientLight", "xeogl.MetallicMaterial" etc.

     @property type
     @type String
     @final
     */
    get type() {
        return type;
    }

    init(cfg) {
        super.init(cfg);
        this._canvas = cfg.canvas;
        this._injectSpinnerCSS();
        const div = document.createElement('div');
        const style = div.style;
        style["z-index"] = "9000";
        style.position = "absolute";
        div.innerHTML = '<div class="sk-fading-circle">\
                <div class="sk-circle1 sk-circle"></div>\
                <div class="sk-circle2 sk-circle"></div>\
                <div class="sk-circle3 sk-circle"></div>\
                <div class="sk-circle4 sk-circle"></div>\
                <div class="sk-circle5 sk-circle"></div>\
                <div class="sk-circle6 sk-circle"></div>\
                <div class="sk-circle7 sk-circle"></div>\
                <div class="sk-circle8 sk-circle"></div>\
                <div class="sk-circle9 sk-circle"></div>\
                <div class="sk-circle10 sk-circle"></div>\
                <div class="sk-circle11 sk-circle"></div>\
                <div class="sk-circle12 sk-circle"></div>\
                </div>';
        this._canvas.parentElement.appendChild(div);
        this._element = div;
        this._adjustPosition();
        this.processes = 0;
    }

    /**
     The number of processes this Spinner represents.

     The Spinner is visible while this property is greater than zero.

     Increment this property whenever you commence some process during which you want
     the Spinner to be visible, then decrement it again when the process is complete.

     Clamps to zero if you attempt to set to to a negative value.

     Fires a {{#crossLink "Spinner/processes:event"}}{{/crossLink}} event on change.

     @property processes
     @default 0
     @type Number
     */
    set processes(value) {
        value = value || 0;
        if (this._processes === value) {
            return;
        }
        if (value < 0) {
            return;
        }
        const prevValue = this._processes;
        this._processes = value;
        this._element.style["visibility"] = (this._processes > 0) ? "visible" : "hidden";
        /**
         Fired whenever this Spinner's {{#crossLink "Spinner/visible:property"}}{{/crossLink}} property changes.

         @event processes
         @param value The property's new value
         */
        this.fire("processes", this._processes);
        if (this._processes === 0 && this._processes !== prevValue) {
            /**
             Fired whenever this Spinner's {{#crossLink "Spinner/visible:property"}}{{/crossLink}} property becomes zero.

             @event zeroProcesses
             */
            this.fire("zeroProcesses", this._processes);
        }
    }

    get processes() {
        return this._processes;
    }

    _adjustPosition() { // (Re)positions spinner DIV over the center of the canvas
        if (!this._canvas || !this._element) {
            return;
        }
        const canvas = this._canvas;
        const spinner = this._element;
        const spinnerStyle = spinner.style;
        spinnerStyle["left"] = (canvas.offsetLeft + (canvas.clientWidth * 0.5) - (spinner.clientWidth * 0.5)) + "px";
        spinnerStyle["top"] = (canvas.offsetTop + (canvas.clientHeight * 0.5) - (spinner.clientHeight * 0.5)) + "px";
    }

    _injectSpinnerCSS() {
        if (spinnerCSSInjected) {
            return;
        }
        const node = document.createElement('style');
        node.innerHTML = spinnerCSS;
        document.body.appendChild(node);
        spinnerCSSInjected = true;
    }
}

export{Spinner};
