<template>
  <div class="audio_player">
    <div>
      <!-- 时间线容器 -->
      <div id="timeline" ref="timeline" />
      <!-- 音频容器 -->
      <div id="waveform" ref="waveform" />
    </div>
    <!-- 操作栏 -->
    <div class="audio_player_opeartion">
      <div class="audio_player_opeartion_name" :title="getCurrentName">
        {{ getCurrentName }}
      </div>
      <div class="audio_player_opeartion_btn">
        <div
          class="audio_player_opeartion_btn_pre"
          :class="srcType === 'single' ? 'disabled' : ''"
          @click="pre"
        >
          <svg
            class="icon"
            viewBox="0 0 1171 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              d="M49.487.619A49.487 49.487 0 0 0 0 50.105v923.79a49.487 49.487 0 0 0 98.973 0V50.105A49.487 49.487 0 0 0 49.487.62zm823.332 26.97L339.6 341.333a197.946 197.946 0 0 0 0 341.334L872.82 996.41a197.946 197.946 0 0 0 298.403-170.728V197.946A197.946 197.946 0 0 0 872.82 27.59zm199.43 798.094v8.784a98.973 98.973 0 0 1-148.46 76.58L389.707 597.302l-8.165-5.32a98.973 98.973 0 0 1 8.165-165.284l533.341-313.745 7.67-4.083a98.973 98.973 0 0 1 141.532 89.076z"
              fill="#fff"
            />
          </svg>
        </div>
        <div class="audio_player_opeartion_btn_toggle_play">
          <!-- 播放 -->
          <svg
            v-show="status === 'pause'"
            class="audio_player_opeartion_btn_toggle_play__play"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            @click="play"
          >
            <path
              d="M744.727 551.564L325.818 795.927C295.564 814.545 256 791.273 256 756.364V267.636c0-34.909 39.564-58.181 69.818-39.563l418.91 244.363c30.254 16.291 30.254 62.837 0 79.128z"
              fill="#e6e6e6"
            />
          </svg>
          <!-- 暂停 -->
          <svg
            v-show="status === 'playing'"
            class="audio_player_opeartion_btn_toggle_play__pause"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            @click="pause"
          >
            <path
              d="M442.182 709.818c0 37.237-30.255 69.818-69.818 69.818s-69.819-30.254-69.819-69.818V314.182c0-37.237 30.255-69.818 69.819-69.818s69.818 30.254 69.818 69.818v395.636zm279.273 0c0 37.237-30.255 69.818-69.819 69.818s-69.818-30.254-69.818-69.818V314.182c0-37.237 30.255-69.818 69.818-69.818s69.819 30.254 69.819 69.818v395.636z"
              fill="#e6e6e6"
            />
          </svg>
          <!-- loading -->
          <div
            v-show="status === 'loading'"
            class="audio_player_opeartion_btn_toggle_play__loading"
          ></div>
        </div>
        <div
          class="audio_player_opeartion_btn_next"
          :class="srcType === 'single' ? 'disabled' : ''"
          @click="next"
        >
          <svg
            class="icon"
            viewBox="0 0 1171 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              d="M1121.736.619a49.487 49.487 0 0 0-49.487 49.486v923.79a49.487 49.487 0 0 0 98.973 0V50.105A49.487 49.487 0 0 0 1121.736.62zM831.62 341.333L298.281 27.59l-9.65-5.32A197.946 197.946 0 0 0 0 197.946v638.871a197.946 197.946 0 0 0 298.28 159.47l533.341-313.744 11.135-7.052a197.946 197.946 0 0 0-11.135-334.158zm-49.486 255.97L248.05 911.046a98.973 98.973 0 0 1-148.46-85.364V197.946a98.973 98.973 0 0 1 148.46-84.993l533.465 313.745a98.973 98.973 0 0 1 0 170.604z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>
      <div class="audio_player_opeartion_right">
        <div class="audio_player_opeartion_right_speed">
          <div
            class="audio_player_opeartion_right_speed__current"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
          >
            {{ getCurrentSpeed }}
            <ul
              v-show="isShowSpeedList"
              class="audio_player_opeartion_right_speed__list"
            >
              <li
                class="audio_player_opeartion_right_speed__list__li"
                :class="currentSpeed === item ? 'active' : ''"
                v-for="item in speedList"
                :key="item"
                @click="setSpeed(item)"
              >
                {{ item }}X
              </li>
            </ul>
          </div>
        </div>
        <div class="audio_player_opeartion_right_time">
          {{ currentTime }}/{{ duration }}
        </div>
        <div class="audio_player_opeartion_right_download" @click="extraClick">
          {{ extraText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugin/wavesurfer.timeline.js";
import { formatTime } from "../../../utils/index.js";
export default {
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
      this.wavesurfer = WaveSurfer.create({
        container: document.querySelector("#waveform"),
        forceDecode: true,
        waveColor: "#A8DBA8",
        progressColor: "#3B8686",
        backend: "MediaElement",
        plugins: [
          Timeline.create({
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
      this.$emit('extraClick')
    },
  },
};
</script>

<style lang="less" scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.audio_player {
  min-width: 500px;
  &_opeartion {
    height: 50px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &_name {
      width: 150px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    &_btn {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &_toggle_play {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #b54f41;
        margin: 0 15px;
        &__play {
          margin-left: 5px;
        }
        &__loading,
        &__loading > div {
          position: relative;
          box-sizing: border-box;
        }

        &__loading {
          display: block;
          font-size: 0;
          color: #fff;
        }

        &__loading.la-dark {
          color: #333;
        }

        &__loading > div {
          display: inline-block;
          float: none;
          background-color: currentColor;
          border: 0 solid currentColor;
        }

        &__loading {
          width: 32px;
          height: 32px;
        }

        &__loading > div {
          width: 32px;
          height: 32px;
          background: transparent;
          border-width: 2px;
          border-radius: 100%;
          opacity: 0;
          animation: ball-scale-ripple 1s 0s infinite
            cubic-bezier(0.21, 0.53, 0.56, 0.8);
        }

        &__loading.la-sm {
          width: 16px;
          height: 16px;
        }

        &__loading.la-sm > div {
          width: 16px;
          height: 16px;
          border-width: 1px;
        }

        &__loading.la-2x {
          width: 64px;
          height: 64px;
        }

        &__loading.la-2x > div {
          width: 64px;
          height: 64px;
          border-width: 4px;
        }

        &__loading.la-3x {
          width: 96px;
          height: 96px;
        }

        &__loading.la-3x > div {
          width: 96px;
          height: 96px;
          border-width: 6px;
        }

        @keyframes ball-scale-ripple {
          0% {
            opacity: 1;
            transform: scale(0.1);
          }

          70% {
            opacity: 0.65;
            transform: scale(1);
          }

          100% {
            opacity: 0;
          }
        }
      }
      &_pre {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #b54f41;
        &.disabled {
          user-select: none;
          cursor: not-allowed;
          background: rgba(21, 21, 21, 0.3);
        }
      }
      &_next {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #b54f41;
        &.disabled {
          user-select: none;
          cursor: not-allowed;
          background: rgba(21, 21, 21, 0.3);
        }
      }
    }
    &_right {
      display: flex;
      justify-content: center;
      align-items: center;
      &_speed {
        margin: 0 10px;
        color: #333;
        position: relative;
        width: 40px;
        text-align: center;
        cursor: pointer;
        &__current {
          font-size: 14px;
        }
        &__list {
          position: absolute;
          text-align: center;
          left: 50%;
          transform: translateX(-50%);
          top: 17px;
          background: rgba(21, 21, 21, 0.8);
          color: #fff;
          border-radius: 7px;
          &__li {
            height: 36px;
            line-height: 36px;
            padding: 2px 18px;
            word-break: normal;
            &:hover {
              background: hsla(0, 0%, 100%, 0.1);
            }
            &.active {
              color: #12c286;
            }
          }
        }
      }
      &_time {
        min-width: 100px;
        color: #333;
        font-size: 14px;
      }
      &_download {
        font-size: 14px;
        color: #12c286;
        cursor: pointer;
      }
    }
  }
}
</style>
