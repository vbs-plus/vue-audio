(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('wavesurfer.js'), require('wavesurfer.js/dist/plugin/wavesurfer.timeline.js')) :
  typeof define === 'function' && define.amd ? define(['wavesurfer.js', 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["vue-plugins"] = factory(global.WaveSurfer, global.Timeline));
})(this, (function (WaveSurfer, Timeline) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var WaveSurfer__default = /*#__PURE__*/_interopDefaultLegacy(WaveSurfer);
  var Timeline__default = /*#__PURE__*/_interopDefaultLegacy(Timeline);

  const formatTime = (time) => {
    if (typeof time !== "number" || isNaN(time)) {
      return "--:--";
    }
    const duration = Math.floor(Number(time));
    let second = duration % 60;
    let minute = Math.floor(duration / 60);
    let hour = Math.floor(duration / 60 / 60);
    if (second < 10) {
      second = `0${second}`;
    }
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (hour < 1) {
      return `${minute}:${second}`;
    }
    return `${hour}:${minute}:${second}`;
  };

  var script = {
    name: "VbsVueAudio",
    props: {
      options: {
        type: Object,
        default: () => {
          return {
            audioRate: 1, // 控制播放速度
          };
        },
      },
      src: {
        type: [Array, String],
        required: true,
      },
      speedList: {
        type: Array,
        default: () => [0.5, 1, 2],
      },
      extraText: {
        type: String,
        default: "下载",
      }
    },
    data() {
      return {
        wavesurfer: "",
        speed: 1,
        status: "pause",
        duration: "00:00",
        currentTime: "00:00",
        srcType: "single",
        currentPlayIndex: 0,
        isShowSpeedList: false,
        currentSpeed: 1,
        currentSrc: "",
      };
    },
    computed: {
      getCurrentName() {
        if (this.srcType === "single") {
          return this.src;
        } else {
          return this.src[this.currentPlayIndex];
        }
      },
      getCurrentSpeed() {
        if (this.currentSpeed === 1) {
          return "倍速";
        }
        return `${this.currentSpeed}X`;
      },
    },
    watch: {
      src: {
        handler(value) {
          if (!value) return;
          const type = Object.prototype.toString.call(value);
          if (type === "[object Array]") {
            this.srcType = "list";
            this.currentSrc = this.src[0];
          } else if (type === "[object String]") {
            this.srcType = "single";
            this.currentSrc = this.src;
          } else {
            throw new Error("src类型应为string 或 array");
          }
          this.$nextTick(() => {
            this.wavesurfer.load(this.currentSrc);
          });
        },
        immediate: true,
      },
      options: {
        handler(value) {
          if (value.audioRate) {
            this.currentSpeed = value.audioRate;
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.init();
      // 事件监听
      this.addEvent();
    },
    methods: {
      // 初始化
      init() {
        this.wavesurfer = WaveSurfer__default["default"].create({
          container: document.querySelector("#waveform"),
          forceDecode: true,
          waveColor: "#A8DBA8",
          progressColor: "#3B8686",
          backend: "MediaElement",
          plugins: [
            Timeline__default["default"].create({
              container: document.querySelector("#timeline"), //绑定容器
              secondaryColor: "#3498DB", //次要时间标签颜色，红色
              secondaryFontColor: "#3498DB",
              primaryColor: "#3498DB", //主要时间标签颜色，蓝色
              primaryFontColor: "#3498DB",
              labelPadding: 2,
            }),
          ],
          // ...this.options,
        });
      },
      addEvent() {
        // 播放完成
        this.wavesurfer.on("finish", () => {
          this.status = "pause";
        });
        // wave加载中
        this.wavesurfer.on("loading", () => {
          console.log("loading");
        });
        // wave加载完成
        this.wavesurfer.on("waveform-ready", () => {
          console.log("waveform-ready");
        });
        // 音频加载中
        this.wavesurfer.on("audioprocess", () => {
          this.currentTime = formatTime(this.wavesurfer.getCurrentTime());
        });
        // 跳转
        this.wavesurfer.on("seek", () => {
          this.currentTime = formatTime(this.wavesurfer.getCurrentTime());
        });
        // 音频加载完成
        this.wavesurfer.on("ready", () => {
          console.log("ready");
          // 获取总时长
          this.duration = formatTime(this.wavesurfer.getDuration() || 0);
        });
      },
      play() {
        this.wavesurfer.play();
        this.status = "playing";
      },
      pause() {
        this.wavesurfer.pause();
        this.status = "pause";
      },
      // 上一曲
      pre() {
        const num = this.src.length;
        if (this.srcType === "list") {
          this.currentPlayIndex -= 1;
          if (this.currentPlayIndex <= 0) {
            this.currentPlayIndex = num - 1;
          }
          this.status = "pause";
          this.wavesurfer.load(this.src[this.currentPlayIndex]);
        }
      },
      // 下一曲
      next() {
        const num = this.src.length;
        if (this.srcType === "list") {
          this.currentPlayIndex += 1;
          if (this.currentPlayIndex >= num) {
            this.currentPlayIndex = 0;
          }
          this.status = "pause";
          this.wavesurfer.load(this.src[this.currentPlayIndex]);
        }
      },
      onMouseEnter() {
        this.isShowSpeedList = true;
      },
      onMouseLeave() {
        this.isShowSpeedList = false;
      },
      destroy() {
        this.wavesurfer.destroy();
        this.status = "pause";
      },
      // 调节播放速度
      setSpeed(value) {
        this.wavesurfer.setPlaybackRate(value);
        this.currentSpeed = value;
        this.isShowSpeedList = false;
      },
      // 停止
      stop() {
        this.wavesurfer.stop();
        this.status = "pause";
      },
      extraClick() {
        this.$emit('extraClick');
      },
    },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "audio_player" }, [
      _c("div", [
        _c("div", { ref: "timeline", attrs: { id: "timeline" } }),
        _vm._v(" "),
        _c("div", { ref: "waveform", attrs: { id: "waveform" } }),
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "audio_player_opeartion" }, [
        _c(
          "div",
          {
            staticClass: "audio_player_opeartion_name",
            attrs: { title: _vm.getCurrentName },
          },
          [_vm._v("\n      " + _vm._s(_vm.getCurrentName) + "\n    ")]
        ),
        _vm._v(" "),
        _c("div", { staticClass: "audio_player_opeartion_btn" }, [
          _c(
            "div",
            {
              staticClass: "audio_player_opeartion_btn_pre",
              class: _vm.srcType === "single" ? "disabled" : "",
              on: { click: _vm.pre },
            },
            [
              _c(
                "svg",
                {
                  staticClass: "icon",
                  attrs: {
                    viewBox: "0 0 1171 1024",
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "20",
                    height: "20",
                  },
                },
                [
                  _c("path", {
                    attrs: {
                      d: "M49.487.619A49.487 49.487 0 0 0 0 50.105v923.79a49.487 49.487 0 0 0 98.973 0V50.105A49.487 49.487 0 0 0 49.487.62zm823.332 26.97L339.6 341.333a197.946 197.946 0 0 0 0 341.334L872.82 996.41a197.946 197.946 0 0 0 298.403-170.728V197.946A197.946 197.946 0 0 0 872.82 27.59zm199.43 798.094v8.784a98.973 98.973 0 0 1-148.46 76.58L389.707 597.302l-8.165-5.32a98.973 98.973 0 0 1 8.165-165.284l533.341-313.745 7.67-4.083a98.973 98.973 0 0 1 141.532 89.076z",
                      fill: "#fff",
                    },
                  }),
                ]
              ),
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "audio_player_opeartion_btn_toggle_play" }, [
            _c(
              "svg",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.status === "pause",
                    expression: "status === 'pause'",
                  },
                ],
                staticClass: "audio_player_opeartion_btn_toggle_play__play",
                attrs: {
                  viewBox: "0 0 1024 1024",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "40",
                  height: "40",
                },
                on: { click: _vm.play },
              },
              [
                _c("path", {
                  attrs: {
                    d: "M744.727 551.564L325.818 795.927C295.564 814.545 256 791.273 256 756.364V267.636c0-34.909 39.564-58.181 69.818-39.563l418.91 244.363c30.254 16.291 30.254 62.837 0 79.128z",
                    fill: "#e6e6e6",
                  },
                }),
              ]
            ),
            _vm._v(" "),
            _c(
              "svg",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.status === "playing",
                    expression: "status === 'playing'",
                  },
                ],
                staticClass: "audio_player_opeartion_btn_toggle_play__pause",
                attrs: {
                  viewBox: "0 0 1024 1024",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "40",
                  height: "40",
                },
                on: { click: _vm.pause },
              },
              [
                _c("path", {
                  attrs: {
                    d: "M442.182 709.818c0 37.237-30.255 69.818-69.818 69.818s-69.819-30.254-69.819-69.818V314.182c0-37.237 30.255-69.818 69.819-69.818s69.818 30.254 69.818 69.818v395.636zm279.273 0c0 37.237-30.255 69.818-69.819 69.818s-69.818-30.254-69.818-69.818V314.182c0-37.237 30.255-69.818 69.818-69.818s69.819 30.254 69.819 69.818v395.636z",
                    fill: "#e6e6e6",
                  },
                }),
              ]
            ),
            _vm._v(" "),
            _c("div", {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.status === "loading",
                  expression: "status === 'loading'",
                },
              ],
              staticClass: "audio_player_opeartion_btn_toggle_play__loading",
            }),
          ]),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "audio_player_opeartion_btn_next",
              class: _vm.srcType === "single" ? "disabled" : "",
              on: { click: _vm.next },
            },
            [
              _c(
                "svg",
                {
                  staticClass: "icon",
                  attrs: {
                    viewBox: "0 0 1171 1024",
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "20",
                    height: "20",
                  },
                },
                [
                  _c("path", {
                    attrs: {
                      d: "M1121.736.619a49.487 49.487 0 0 0-49.487 49.486v923.79a49.487 49.487 0 0 0 98.973 0V50.105A49.487 49.487 0 0 0 1121.736.62zM831.62 341.333L298.281 27.59l-9.65-5.32A197.946 197.946 0 0 0 0 197.946v638.871a197.946 197.946 0 0 0 298.28 159.47l533.341-313.744 11.135-7.052a197.946 197.946 0 0 0-11.135-334.158zm-49.486 255.97L248.05 911.046a98.973 98.973 0 0 1-148.46-85.364V197.946a98.973 98.973 0 0 1 148.46-84.993l533.465 313.745a98.973 98.973 0 0 1 0 170.604z",
                      fill: "#fff",
                    },
                  }),
                ]
              ),
            ]
          ),
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "audio_player_opeartion_right" }, [
          _c("div", { staticClass: "audio_player_opeartion_right_speed" }, [
            _c(
              "div",
              {
                staticClass: "audio_player_opeartion_right_speed__current",
                on: {
                  mouseenter: _vm.onMouseEnter,
                  mouseleave: _vm.onMouseLeave,
                },
              },
              [
                _vm._v(
                  "\n          " + _vm._s(_vm.getCurrentSpeed) + "\n          "
                ),
                _c(
                  "ul",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.isShowSpeedList,
                        expression: "isShowSpeedList",
                      },
                    ],
                    staticClass: "audio_player_opeartion_right_speed__list",
                  },
                  _vm._l(_vm.speedList, function (item) {
                    return _c(
                      "li",
                      {
                        key: item,
                        staticClass:
                          "audio_player_opeartion_right_speed__list__li",
                        class: _vm.currentSpeed === item ? "active" : "",
                        on: {
                          click: function ($event) {
                            return _vm.setSpeed(item)
                          },
                        },
                      },
                      [
                        _vm._v(
                          "\n              " + _vm._s(item) + "X\n            "
                        ),
                      ]
                    )
                  }),
                  0
                ),
              ]
            ),
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "audio_player_opeartion_right_time" }, [
            _vm._v(
              "\n        " +
                _vm._s(_vm.currentTime) +
                "/" +
                _vm._s(_vm.duration) +
                "\n      "
            ),
          ]),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "audio_player_opeartion_right_download",
              on: { click: _vm.extraClick },
            },
            [_vm._v("\n        " + _vm._s(_vm.extraText) + "\n      ")]
          ),
        ]),
      ]),
    ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-73f9c352_0", { source: "ul[data-v-73f9c352],\nli[data-v-73f9c352] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.audio_player[data-v-73f9c352] {\n  min-width: 500px;\n}\n.audio_player_opeartion[data-v-73f9c352] {\n  height: 50px;\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.audio_player_opeartion_name[data-v-73f9c352] {\n  width: 150px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  cursor: pointer;\n}\n.audio_player_opeartion_btn[data-v-73f9c352] {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  cursor: pointer;\n}\n.audio_player_opeartion_btn_toggle_play[data-v-73f9c352] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: #b54f41;\n  margin: 0 15px;\n}\n.audio_player_opeartion_btn_toggle_play__play[data-v-73f9c352] {\n  margin-left: 5px;\n}\n.audio_player_opeartion_btn_toggle_play__loading[data-v-73f9c352],\n.audio_player_opeartion_btn_toggle_play__loading > div[data-v-73f9c352] {\n  position: relative;\n  box-sizing: border-box;\n}\n.audio_player_opeartion_btn_toggle_play__loading[data-v-73f9c352] {\n  display: block;\n  font-size: 0;\n  color: #fff;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-dark[data-v-73f9c352] {\n  color: #333;\n}\n.audio_player_opeartion_btn_toggle_play__loading > div[data-v-73f9c352] {\n  display: inline-block;\n  float: none;\n  background-color: currentColor;\n  border: 0 solid currentColor;\n}\n.audio_player_opeartion_btn_toggle_play__loading[data-v-73f9c352] {\n  width: 32px;\n  height: 32px;\n}\n.audio_player_opeartion_btn_toggle_play__loading > div[data-v-73f9c352] {\n  width: 32px;\n  height: 32px;\n  background: transparent;\n  border-width: 2px;\n  border-radius: 100%;\n  opacity: 0;\n  animation: ball-scale-ripple-data-v-73f9c352 1s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8);\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-sm[data-v-73f9c352] {\n  width: 16px;\n  height: 16px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-sm > div[data-v-73f9c352] {\n  width: 16px;\n  height: 16px;\n  border-width: 1px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-2x[data-v-73f9c352] {\n  width: 64px;\n  height: 64px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-2x > div[data-v-73f9c352] {\n  width: 64px;\n  height: 64px;\n  border-width: 4px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-3x[data-v-73f9c352] {\n  width: 96px;\n  height: 96px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-3x > div[data-v-73f9c352] {\n  width: 96px;\n  height: 96px;\n  border-width: 6px;\n}\n@keyframes ball-scale-ripple-data-v-73f9c352 {\n0% {\n    opacity: 1;\n    transform: scale(0.1);\n}\n70% {\n    opacity: 0.65;\n    transform: scale(1);\n}\n100% {\n    opacity: 0;\n}\n}\n.audio_player_opeartion_btn_pre[data-v-73f9c352] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: #b54f41;\n}\n.audio_player_opeartion_btn_pre.disabled[data-v-73f9c352] {\n  user-select: none;\n  cursor: not-allowed;\n  background: rgba(21, 21, 21, 0.3);\n}\n.audio_player_opeartion_btn_next[data-v-73f9c352] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: #b54f41;\n}\n.audio_player_opeartion_btn_next.disabled[data-v-73f9c352] {\n  user-select: none;\n  cursor: not-allowed;\n  background: rgba(21, 21, 21, 0.3);\n}\n.audio_player_opeartion_right[data-v-73f9c352] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.audio_player_opeartion_right_speed[data-v-73f9c352] {\n  margin: 0 10px;\n  color: #333;\n  position: relative;\n  width: 40px;\n  text-align: center;\n  cursor: pointer;\n}\n.audio_player_opeartion_right_speed__current[data-v-73f9c352] {\n  font-size: 14px;\n}\n.audio_player_opeartion_right_speed__list[data-v-73f9c352] {\n  position: absolute;\n  text-align: center;\n  left: 50%;\n  transform: translateX(-50%);\n  top: 17px;\n  background: rgba(21, 21, 21, 0.8);\n  color: #fff;\n  border-radius: 7px;\n}\n.audio_player_opeartion_right_speed__list__li[data-v-73f9c352] {\n  height: 36px;\n  line-height: 36px;\n  padding: 2px 18px;\n  word-break: normal;\n}\n.audio_player_opeartion_right_speed__list__li[data-v-73f9c352]:hover {\n  background: hsla(0, 0%, 100%, 0.1);\n}\n.audio_player_opeartion_right_speed__list__li.active[data-v-73f9c352] {\n  color: #12c286;\n}\n.audio_player_opeartion_right_time[data-v-73f9c352] {\n  min-width: 100px;\n  color: #333;\n  font-size: 14px;\n}\n.audio_player_opeartion_right_download[data-v-73f9c352] {\n  font-size: 14px;\n  color: #12c286;\n  cursor: pointer;\n}\n", map: {"version":3,"sources":["index.vue"],"names":[],"mappings":"AAAA;;EAEE,gBAAgB;EAChB,SAAS;EACT,UAAU;AACZ;AACA;EACE,gBAAgB;AAClB;AACA;EACE,YAAY;EACZ,kBAAkB;EAClB,aAAa;EACb,mBAAmB;EACnB,8BAA8B;AAChC;AACA;EACE,YAAY;EACZ,gBAAgB;EAChB,mBAAmB;EACnB,uBAAuB;EACvB,eAAe;AACjB;AACA;EACE,kBAAkB;EAClB,SAAS;EACT,2BAA2B;EAC3B,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,eAAe;AACjB;AACA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,mBAAmB;EACnB,cAAc;AAChB;AACA;EACE,gBAAgB;AAClB;AACA;;EAEE,kBAAkB;EAClB,sBAAsB;AACxB;AACA;EACE,cAAc;EACd,YAAY;EACZ,WAAW;AACb;AACA;EACE,WAAW;AACb;AACA;EACE,qBAAqB;EACrB,WAAW;EACX,8BAA8B;EAC9B,4BAA4B;AAC9B;AACA;EACE,WAAW;EACX,YAAY;AACd;AACA;EACE,WAAW;EACX,YAAY;EACZ,uBAAuB;EACvB,iBAAiB;EACjB,mBAAmB;EACnB,UAAU;EACV,+FAA+E;AACjF;AACA;EACE,WAAW;EACX,YAAY;AACd;AACA;EACE,WAAW;EACX,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,WAAW;EACX,YAAY;AACd;AACA;EACE,WAAW;EACX,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,WAAW;EACX,YAAY;AACd;AACA;EACE,WAAW;EACX,YAAY;EACZ,iBAAiB;AACnB;AACA;AACE;IACE,UAAU;IACV,qBAAqB;AACvB;AACA;IACE,aAAa;IACb,mBAAmB;AACrB;AACA;IACE,UAAU;AACZ;AACF;AACA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,mBAAmB;AACrB;AACA;EACE,iBAAiB;EACjB,mBAAmB;EACnB,iCAAiC;AACnC;AACA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,mBAAmB;AACrB;AACA;EACE,iBAAiB;EACjB,mBAAmB;EACnB,iCAAiC;AACnC;AACA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;AACrB;AACA;EACE,cAAc;EACd,WAAW;EACX,kBAAkB;EAClB,WAAW;EACX,kBAAkB;EAClB,eAAe;AACjB;AACA;EACE,eAAe;AACjB;AACA;EACE,kBAAkB;EAClB,kBAAkB;EAClB,SAAS;EACT,2BAA2B;EAC3B,SAAS;EACT,iCAAiC;EACjC,WAAW;EACX,kBAAkB;AACpB;AACA;EACE,YAAY;EACZ,iBAAiB;EACjB,iBAAiB;EACjB,kBAAkB;AACpB;AACA;EACE,kCAAkC;AACpC;AACA;EACE,cAAc;AAChB;AACA;EACE,gBAAgB;EAChB,WAAW;EACX,eAAe;AACjB;AACA;EACE,eAAe;EACf,cAAc;EACd,eAAe;AACjB","file":"index.vue","sourcesContent":["ul,\nli {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.audio_player {\n  min-width: 500px;\n}\n.audio_player_opeartion {\n  height: 50px;\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.audio_player_opeartion_name {\n  width: 150px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  cursor: pointer;\n}\n.audio_player_opeartion_btn {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  cursor: pointer;\n}\n.audio_player_opeartion_btn_toggle_play {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: #b54f41;\n  margin: 0 15px;\n}\n.audio_player_opeartion_btn_toggle_play__play {\n  margin-left: 5px;\n}\n.audio_player_opeartion_btn_toggle_play__loading,\n.audio_player_opeartion_btn_toggle_play__loading > div {\n  position: relative;\n  box-sizing: border-box;\n}\n.audio_player_opeartion_btn_toggle_play__loading {\n  display: block;\n  font-size: 0;\n  color: #fff;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-dark {\n  color: #333;\n}\n.audio_player_opeartion_btn_toggle_play__loading > div {\n  display: inline-block;\n  float: none;\n  background-color: currentColor;\n  border: 0 solid currentColor;\n}\n.audio_player_opeartion_btn_toggle_play__loading {\n  width: 32px;\n  height: 32px;\n}\n.audio_player_opeartion_btn_toggle_play__loading > div {\n  width: 32px;\n  height: 32px;\n  background: transparent;\n  border-width: 2px;\n  border-radius: 100%;\n  opacity: 0;\n  animation: ball-scale-ripple 1s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8);\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-sm {\n  width: 16px;\n  height: 16px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-sm > div {\n  width: 16px;\n  height: 16px;\n  border-width: 1px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-2x {\n  width: 64px;\n  height: 64px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-2x > div {\n  width: 64px;\n  height: 64px;\n  border-width: 4px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-3x {\n  width: 96px;\n  height: 96px;\n}\n.audio_player_opeartion_btn_toggle_play__loading.la-3x > div {\n  width: 96px;\n  height: 96px;\n  border-width: 6px;\n}\n@keyframes ball-scale-ripple {\n  0% {\n    opacity: 1;\n    transform: scale(0.1);\n  }\n  70% {\n    opacity: 0.65;\n    transform: scale(1);\n  }\n  100% {\n    opacity: 0;\n  }\n}\n.audio_player_opeartion_btn_pre {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: #b54f41;\n}\n.audio_player_opeartion_btn_pre.disabled {\n  user-select: none;\n  cursor: not-allowed;\n  background: rgba(21, 21, 21, 0.3);\n}\n.audio_player_opeartion_btn_next {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: #b54f41;\n}\n.audio_player_opeartion_btn_next.disabled {\n  user-select: none;\n  cursor: not-allowed;\n  background: rgba(21, 21, 21, 0.3);\n}\n.audio_player_opeartion_right {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.audio_player_opeartion_right_speed {\n  margin: 0 10px;\n  color: #333;\n  position: relative;\n  width: 40px;\n  text-align: center;\n  cursor: pointer;\n}\n.audio_player_opeartion_right_speed__current {\n  font-size: 14px;\n}\n.audio_player_opeartion_right_speed__list {\n  position: absolute;\n  text-align: center;\n  left: 50%;\n  transform: translateX(-50%);\n  top: 17px;\n  background: rgba(21, 21, 21, 0.8);\n  color: #fff;\n  border-radius: 7px;\n}\n.audio_player_opeartion_right_speed__list__li {\n  height: 36px;\n  line-height: 36px;\n  padding: 2px 18px;\n  word-break: normal;\n}\n.audio_player_opeartion_right_speed__list__li:hover {\n  background: hsla(0, 0%, 100%, 0.1);\n}\n.audio_player_opeartion_right_speed__list__li.active {\n  color: #12c286;\n}\n.audio_player_opeartion_right_time {\n  min-width: 100px;\n  color: #333;\n  font-size: 14px;\n}\n.audio_player_opeartion_right_download {\n  font-size: 14px;\n  color: #12c286;\n  cursor: pointer;\n}\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = "data-v-73f9c352";
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  __vue_component__.install = function (Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
  };

  // 批量引入组件❤

  const components = [__vue_component__];

  const install = function (Vue) {
    components.forEach((component) => {
      Vue.component(component.name, component);
    });
  };
  // 全部导出支持按需引入
  var index = {
    install, VueAudio: __vue_component__
  };

  return index;

}));
