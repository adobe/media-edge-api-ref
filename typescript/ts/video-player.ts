/***************************************************************************************
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ***************************************************************************************/

import {
  AdBreakStartMediaCollection,
  AdStartMediaCollection,
  ChapterStartMediaCollection,
  CustomMetadata,
  DefaultMediaCollection,
  ErrorMediaCollection,
  ErrorSourceType,
  EventType,
  PlayerStateData,
  SessionStartMediaCollection,
  StatesUpdateMediaCollection,
} from "./data";
import {Request, sendRequest} from "./request";

const PING_INTERVAL_MS = 10000;
const MONITOR_TIMER_INTERVAL = 500;
const AD_POD_START_POS = 25;
const AD_POD_END_POS = 55;
const AD_ONE_START_POS = 25;
const AD_ONE_COMPLETE_POS = 40;
const AD_TWO_START_POS = 40;
const AD_TWO_COMPLETE_POS = 55;

// The sample VideoPlayer simulates 2 chapters, delimited by the ad break at time 25, containing 2 ads
const CHAPTER_ONE_START_POS = 2;
const CHAPTER_ONE_COMPLETE_POS = 25;
const CHAPTER_TWO_START_POS = 55;
const CHAPTER_TWO_COMPLETE_POS = 104;
const CONTENT_LENGTH = 74

// Subtitle state is on/off at the following timestamps
const STATE_SUBTITLES_ON = 80
const STATE_SUBTITLES_OFF = 93


// VideoPlayer class which encapsulates all the logic
// Works as a wrapper on <video> element ( what to do when <video> fires an event ( play, pause, etc.)
export class VideoPlayer {
  private $el: JQuery<HTMLVideoElement>;
  private _videoLoaded: boolean;
  private _clock: NodeJS.Timeout;
  private _hbTimer: NodeJS.Timeout;
  private sessionId: string;
  private _pendingRequests: Request[];
  private customMetadata: Array<CustomMetadata>;
  private isMuteOn: boolean;
  private areSubtitlesOn: boolean;
  private isAdBreakInProgress: boolean;
  private isFirstAdStarted: boolean;
  private isSecondAdStarted: boolean;
  private isFirstChapterStarted: boolean;
  private isSecondChapterStarted: boolean;
  private isFullscreenOn: boolean;

  constructor(id: string) {
    this.$el = $(`#${id}`);
    this._videoLoaded = false;
    // add event listeners
    if (this.$el) {
      this.$el.on("play", () => this._onPlay());
      this.$el.on("pause", () => this._onPause());
      this.$el.on("ended", () => this._onEnd());
      this.$el.on("waiting", () => this._onWaiting());
      this.$el.on("playing", () => this._onPlaying());
      this.$el.on("volumechange", (ev) => this._onVolumeChange(ev));
      this.$el.on("error", (ev) => this._onError(ev));
      this.$el.on("fullscreenchange", (ev) => this._onFullscreenChange(ev));
    }
    this._pendingRequests = [];
    this.customMetadata = [
      {
        name: "_dcbl.customUserId",
        value: "4248",
      },
    ];
    this.isMuteOn = false;
    this.areSubtitlesOn = false;
    this.isAdBreakInProgress = false;
    this.isFirstAdStarted = false;
    this.isSecondAdStarted = false;
    this.isFirstChapterStarted = false;
    this.isSecondChapterStarted = false;
    this.isFullscreenOn = false;
  }

  public getVideoPlayerTime(): number {
    return this.$el.get(0).currentTime;
  }

  public getPlayhead() {
    let playhead;
    const vTime = this.getVideoPlayerTime();
    if (AD_POD_START_POS <= vTime && vTime <= AD_POD_END_POS) {
      // During ad playback the main video playhead remains constant at where it was when the ad started
      playhead = AD_POD_START_POS;
    } else {
      playhead =
        vTime < AD_POD_START_POS
          ? vTime
          : vTime - (AD_POD_END_POS - AD_POD_START_POS);
    }
    return Math.floor(playhead); // playhead - BigInt
  }

  public _onPlay(): void {
    this._openVideoIfNecessary();
  }

  private _openVideoIfNecessary() {
    if (!this._videoLoaded) {
      this._startVideo();
      // Start the monitor timer in order to simulate the events from video (stateUpdate, adBreak, chapterStart etc.).
      this._clock = setInterval(() => this._onTick(), MONITOR_TIMER_INTERVAL);
    }
  }

  private _startVideo() {
    if (!this._videoLoaded) {
      // startSession
      this.startSession();
      this._videoLoaded = true;
      // startHeartbeatTimer
      this._hbTimer = setInterval(() => this._sendPing(), PING_INTERVAL_MS);
    }
  }

  private _onTick() {
    if (this.$el.get(0).seeking || this.$el.get(0).paused) {
      return;
    }

    const vTime = this.getVideoPlayerTime();

    // Subtitles state
    if (vTime >= STATE_SUBTITLES_ON && vTime < STATE_SUBTITLES_OFF) {
      if (!this.areSubtitlesOn) {
        this._sendSubtitlesStateOn();
      }
    } else if (vTime >= STATE_SUBTITLES_OFF) {
      if (this.areSubtitlesOn) {
        this._sendSubtitlesStateOff();
      }
    }

    if (vTime >= AD_POD_START_POS && vTime < AD_POD_END_POS) {
      if (vTime < AD_ONE_COMPLETE_POS) {
        if (!this.isAdBreakInProgress) {
          this._startAdBreak();
        }
        if (!this.isFirstAdStarted) {
          this._startFirstAd();
        }
      } else {
        if (this.isFirstAdStarted && !this.isSecondAdStarted) {
          this._completeFirstAd();
          this._startSecondAd();
        }
      }
    } else if (vTime >= AD_POD_END_POS) {
      if (this.isSecondAdStarted) {
        this._completeSecondAd();
      }
      if (this.isAdBreakInProgress) {
        this._completeAdBreak();
      }
    }

    if (vTime >= CHAPTER_ONE_START_POS && vTime < CHAPTER_ONE_COMPLETE_POS) {
      if (!this.isFirstChapterStarted) {
        this.isFirstChapterStarted = true;
        this._startChapter(
          1,
          CHAPTER_ONE_START_POS,
          CHAPTER_ONE_COMPLETE_POS - CHAPTER_ONE_START_POS
        );
      }
    } else if (
      vTime >= CHAPTER_ONE_COMPLETE_POS &&
      vTime < CHAPTER_TWO_START_POS
    ) {
      if (this.isFirstChapterStarted) {
        this.isFirstChapterStarted = false;
        this._completeChapter();
      }
    }

    if (vTime >= CHAPTER_TWO_START_POS && vTime < CHAPTER_TWO_COMPLETE_POS) {
      if (!this.isSecondChapterStarted) {
        this.isSecondChapterStarted = true;
        this._startChapter(
          2,
          CHAPTER_TWO_START_POS,
          CHAPTER_TWO_COMPLETE_POS - CHAPTER_TWO_START_POS
        );
      }
    }
  }

  // Events are being queued because the sessionStart response might be available later that other calls need to be fired
  // Request calls are executed after we are sure that we have a session id
  private _processPendingRequests() {
    console.log(`[Player] Processing ${this._pendingRequests.length} pending requests `);
    this._pendingRequests.forEach((request) => {
      this._collectRequest(request);
    });
    this._pendingRequests = [];
  }

  private _collectRequest(request: Request) {
    // works like a barrier for requests that should be sent before the promise from sessionStart is completed
    if (this.sessionId == null) {
      console.log("Queue request");
      this._pendingRequests.push(request);
      return;
    }
    (request.data.events[0].xdm.mediaCollection as DefaultMediaCollection).sessionID = this.sessionId;
    console.log(request.data.events[0].xdm);
    sendRequest(request)
      .then((response) => {
        console.log("[Player] Received success response");
      })
      .catch((err) => {
        console.log("[Player] Error");
        console.log(err);
      });
  }

  private _startAdBreak() {
    const adBreakStartMediaCollection = <AdBreakStartMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      advertisingPodDetails: {
        index: 1,
        offset: Math.floor(this.getVideoPlayerTime()),
        friendlyName: "Mid-roll",
      },
    };
    const req: Request = {
      path: `/adBreakStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_BREAK_START,
              timestamp: new Date().toISOString(),
              mediaCollection: adBreakStartMediaCollection,
            },
          },
        ],
      },
    };
    this.isAdBreakInProgress = true;
    this._collectRequest(req);
  }

  private _onPause() {
    const pauseStartMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };
    const request: Request = {
      path: `/pauseStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.PAUSE_START,
              timestamp: new Date().toISOString(),
              mediaCollection: pauseStartMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(request);
  }

  private _onEnd() {
    clearInterval(this._clock);
    clearInterval(this._hbTimer);
    if (this._videoLoaded) {
      this._completeSecondChapter();
      this._completeSession();
      this._videoLoaded = false;
    }
  }

  // TODO - this call can be simulated with this.$el.trigger("error")
  private _onError(
    ev: JQuery.TriggeredEvent<
      HTMLVideoElement,
      Error,
      HTMLVideoElement,
      HTMLVideoElement
    >
  ) {
    console.log("error");
    const errorMediaCollection = <ErrorMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      errorDetails: {
        name: "Error",
        source: ErrorSourceType.PLAYER,
      },
    };

    const req: Request = {
      path: `/error`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.ERROR,
              timestamp: new Date().toISOString(),
              mediaCollection: errorMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private _completeSecondChapter() {
    // complete 2nd chapter
    this._completeChapter();
    this.isSecondChapterStarted = false;
  }

  private _completeSession() {
    const completeSessionMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };
    const req: Request = {
      path: `/sessionComplete`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.SESSION_COMPLETE,
              timestamp: new Date().toISOString(),
              mediaCollection: completeSessionMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private _onWaiting() {
    var bufferStartMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };
    const req: Request = {
      path: `/bufferStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.BUFFER_START,
              timestamp: new Date().toISOString(),
              mediaCollection: bufferStartMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private _startChapter(
    chapterIndex: number,
    chapterOffset: number,
    chapterLength: number
  ) {
    const chapterStartMediaCollection = <ChapterStartMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      chapterDetails: {
        length: chapterLength,
        offset: chapterOffset,
        index: chapterIndex,
      },
    };
    const req: Request = {
      path: `/chapterStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.CHAPTER_START,
              timestamp: new Date().toISOString(),
              mediaCollection: chapterStartMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private _onPlaying() {
    const playMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };

    const req: Request = {
      path: `/play`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.PLAY,
              timestamp: new Date().toISOString(),
              mediaCollection: playMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private sendStateUpdate(
    statesStart: Array<PlayerStateData> = [],
    statesEnd: Array<PlayerStateData> = []
  ) {
    if (statesStart.length == 0 && statesEnd.length == 0) {
      console.log(
        "At least one of statesStart or statesEnd list should be non-empty"
      );
      return;
    }
    const statesUpdateMediaCollection = <StatesUpdateMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      statesStart: statesStart,
      statesEnd: statesEnd,
    };
    const req: Request = {
      path: `/statesUpdate`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.STATE_UPDATE,
              timestamp: new Date().toISOString(),
              mediaCollection: statesUpdateMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private startSession() {
    const sessionStartMediaCollection = <SessionStartMediaCollection>{
      playhead: 0,
      sessionDetails: {
        channel: "test-channel",
        contentType: "VOD",
        length: CONTENT_LENGTH, // without ads
        name: "test-session",
        playerName: "vlc",
        rating: "10",
      },
      customMetadata: this.customMetadata,
      qoeDataDetails: {
        framesPerSecond: 30,
      },
    };

    const req: Request = {
      path: `/sessionStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.SESSION_START,
              timestamp: new Date().toISOString(),
              mediaCollection: sessionStartMediaCollection,
            },
          },
        ],
      },
    };
    sendRequest(req)
      .then((response) => {
        console.log("[Player] Received success response");
        this.sessionId = response.data.handle[0].payload[0]["sessionId"];
        this._processPendingRequests();
      })
      .catch((err) => {
        console.log("[Player] Error");
        console.log(err);
      });
  }

  private _sendPing() {
    const pingMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };
    const request: Request = {
      path: "/ping",
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.PING,
              timestamp: new Date().toISOString(),
              mediaCollection: pingMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(request);
  }

  private _startFirstAd() {
    const advertisingDetailsMediaCollection = <AdStartMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      advertisingDetails: {
        name: "Ad-1",
        length: AD_ONE_COMPLETE_POS - AD_ONE_START_POS,
        playerName: "PlayerName",
        podPosition: 0,
      },
      customMetadata: this.customMetadata,
    };

    const req: Request = {
      path: `/adStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_START,
              timestamp: new Date().toISOString(),
              mediaCollection: advertisingDetailsMediaCollection,
            },
          },
        ],
      },
    };
    this.isFirstAdStarted = true;
    this._collectRequest(req);
  }

  private _completeFirstAd() {
    const completeAdMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };

    const req: Request = {
      path: `/adComplete`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_COMPLETE,
              timestamp: new Date().toISOString(),
              mediaCollection: completeAdMediaCollection,
            },
          },
        ],
      },
    };
    this.isFirstAdStarted = false;
    this._collectRequest(req);
  }

  private _startSecondAd() {
    const advertisingDetailsMediaCollection = <AdStartMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
      advertisingDetails: {
        name: "Ad-2",
        length: AD_TWO_COMPLETE_POS - AD_TWO_START_POS,
        playerName: "PlayerName",
        podPosition: 1,
      },
    };
    const req: Request = {
      path: `/adStart`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_START,
              timestamp: new Date().toISOString(),
              mediaCollection: advertisingDetailsMediaCollection,
            },
          },
        ],
      },
    };
    this.isSecondAdStarted = true;
    this._collectRequest(req);
  }

  private _completeSecondAd() {
    const completeAdMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };
    const req: Request = {
      path: `/adComplete`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_COMPLETE,
              timestamp: new Date().toISOString(),
              mediaCollection: completeAdMediaCollection,
            },
          },
        ],
      },
    };
    this.isSecondAdStarted = false;
    this._collectRequest(req);
  }

  private _completeAdBreak() {
    const completeAdBreakMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };

    const req: Request = {
      path: `/adBreakComplete`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.AD_BREAK_COMPLETE,
              timestamp: new Date().toISOString(),
              mediaCollection: completeAdBreakMediaCollection,
            },
          },
        ],
      },
    };
    this.isAdBreakInProgress = false;
    this._collectRequest(req);
  }

  private _completeChapter() {
    const chapterCompleteMediaCollection = <DefaultMediaCollection>{
      playhead: this.getPlayhead(),
      sessionID: this.sessionId,
    };

    const req: Request = {
      path: `/chapterComplete`,
      data: {
        events: [
          {
            xdm: {
              eventType: EventType.CHAPTER_COMPLETE,
              timestamp: new Date().toISOString(),
              mediaCollection: chapterCompleteMediaCollection,
            },
          },
        ],
      },
    };
    this._collectRequest(req);
  }

  private _sendMuteStateOn() {
    this.sendStateUpdate([
      {
        name: "mute",
      },
    ], []);
    this.isMuteOn = true;
  }

  private _sendMuteStateOff() {
    this.sendStateUpdate(
      [],
      [
        {
          name: "mute",
        },
      ]
    );
    this.isMuteOn = false;
  }

  private _sendSubtitlesStateOn() {
    this.sendStateUpdate([
      {
        name: "subtitles",
      },
    ], []);
    this.areSubtitlesOn = true;
  }

  private _sendSubtitlesStateOff() {
    this.sendStateUpdate(
      [],
      [
        {
          name: "subtitles",
        },
      ]
    );
    this.areSubtitlesOn = false;
  }

  private _sendFullscreenStateOn() {
    this.sendStateUpdate([
      {
        name: "fullscreen",
      },
    ], []);
    this.isFullscreenOn = true;
  }

  private _sendFullscreenStateOff() {
    this.sendStateUpdate(
      [],
      [
        {
          name: "fullscreen",
        },
      ]
    );
    this.isFullscreenOn = false;
  }

  private _onVolumeChange(
    ev: JQuery.TriggeredEvent<
      HTMLVideoElement,
      undefined,
      HTMLVideoElement,
      HTMLVideoElement
    >
  ) {
    if (ev.currentTarget.volume == 0 || ev.currentTarget.muted) {
      if (!this.isMuteOn) {
        this._sendMuteStateOn();
      }
    } else if (this.isMuteOn) {
      if (ev.currentTarget.volume > 0) {
        this._sendMuteStateOff();
      }
    }
  }

  private _onFullscreenChange(
    ev: JQuery.TriggeredEvent<
      HTMLVideoElement,
      undefined,
      HTMLVideoElement,
      HTMLVideoElement
    >
  ) {
    if (this._isDocumentFullscreen()) {
      if (!this.isFullscreenOn) {
        this._sendFullscreenStateOn();
      }
    } else {
      if (this.isFullscreenOn) {
        this._sendFullscreenStateOff();
      }
    }
  }

  private _isDocumentFullscreen() {
    return document.fullscreenElement != null;
  }
}
