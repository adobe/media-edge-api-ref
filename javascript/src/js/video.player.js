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

const apiClient = require("./xdm-http-browser");
const xdmConfig = require("./xdm-collector-config");
const xdmPath = require("./xdm-event-paths");

const {
    SessionDetails,
    AdBreakStartDetails,
    AdStartDetails,
    ChapterStartDetails,
    StateIdentifier,
    CustomMetadata,
    QoeDataDetails,
    XdmEventFactory,
    XdmEventConverter,
} = require("./xdm-payloads");

var i = 0;

(function () {
    "use strict";

    const PING_INTERVAL_MS = 10000;
    const MONITOR_TIMER_INTERVAL = 500;
    const CONTENT_LENGTH = 74;

    // This sample VideoPlayer simulates a mid-roll with 2 ads at time 15:
    const AD_BREAK_START_POS = 25;
    const AD_BREAK_END_POS = 55;
    const AD_ONE_START_POS = 25;
    const AD_ONE_COMPLETE_POS = 40;
    const AD_TWO_START_POS = 40;
    const AD_TWO_COMPLETE_POS = 55;
    const AD_POD_LENGTH = 15;

    // The sample VideoPlayer simulates 2 chapters, delimited by the ad break and the start and end of the video
    const CHAPTER_ONE_START_POS = 1;
    const CHAPTER_ONE_COMPLETE_POS = 25;
    const CHAPTER_TWO_START_POS = 55;
    const CHAPTER_TWO_COMPLETE_POS = 104;

    // Subtitle state timestamps
    const SUBTITLES_ON_POS = 80;
    const SUBTITLES_OFF_POS = 93;

    // Constant values
    const SESSION_NAME = "Test name";
    const PLAYER_NAME = "Test player name";
    const CHANNEL = "test-channel";
    const STREAM_TYPE = "VOD";

    const AD_BREAK_NAME = "Mid-roll";
    const FIRST_AD_NAME = "Sample ad 1";
    const SECOND_AD_NAME = "Sample ad 2";

    const CHAPTER_FRIENDLY_NAME = "Sample friendly name";

    const MUTE_STATE_IDENTIFIER = "mute";
    const SUBTITLES_STATE_IDENTIFIER = "subtitles";
    const FULLSCREEN_STATE_IDENTIFIER = "fullscreen";

    const CUSTOM_METADATA = [new CustomMetadata("_dcbl.customUserID", "4384")];
    const QOE_DATA_DETAILS = new QoeDataDetails(null, null, 30, null);

    function VideoPlayer(id) {
        this._videoLoaded = false;
        this._clock = null;

        this.$el = $("#" + id);

        var self = this;
        if (this.$el) {
            this.$el.on("play", function () {
                self._onPlay();
            });
            this.$el.on("pause", function () {
                self._onPause();
            });
            this.$el.on("ended", function () {
                self._onTick(); // Check one last time for events that should be triggered at the end of the video
                self._onComplete();
            });
            this.$el.on("waiting", function () {
                self._onWaiting();
            });
            this.$el.on("playing", function () {
                self._onPlaying();
            });
            this.$el.on("volumechange", function () {
                self._onVolumeChange();
            });
            this.$el.on("fullscreenchange", function () {
                self._onFullscreenChange();
            });
        }

        this._pendingEvents = [];
        this._sessionStarted = false;
        this._chapterStarted = false;
        this._adBreakStarted = false;
        this._adOneStarted = false;
        this._adTwoStarted = false;
        this._muteOn = false;
        this._subtitlesOn = false;
        this._fullscreenOn = false;
    }

    VideoPlayer.prototype.getDuration = function () {
        return this.$el.get(0).duration - AD_POD_LENGTH;
    };

    VideoPlayer.prototype.getCurrentTime = function () {
        return this.$el.get(0).currentTime;
    };

    VideoPlayer.prototype.getCurrentPlaybackTime = function () {
        var playhead;
        if (this._adBreakStarted) {
            // During ad playback the main video playhead remains
            // constant at where it was when the ad started
            playhead = AD_BREAK_START_POS;
        } else {
            var vTime = this.getCurrentTime();
            playhead =
                vTime < AD_BREAK_START_POS
                    ? vTime
                    : Math.max(
                          AD_BREAK_START_POS,
                          vTime - (AD_BREAK_END_POS - AD_BREAK_START_POS)
                      );
        }
        return Math.floor(playhead);
    };

    VideoPlayer.prototype.getCurrentTimestamp = function () {
        return new Date().toISOString();
    };

    VideoPlayer.prototype._onPlay = function () {
        this._openVideoIfNecessary();
    };

    VideoPlayer.prototype._onPlaying = function () {
        var xdmEvent = XdmEventFactory.createPlayEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.playPath);
    };

    VideoPlayer.prototype._onWaiting = function () {
        var xdmEvent = XdmEventFactory.createBufferStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.bufferStartPath);
    };

    VideoPlayer.prototype._onPause = function () {
        var xdmEvent = XdmEventFactory.createPauseStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.pauseStartPath);
    };

    VideoPlayer.prototype._onVolumeChange = function () {
        const video = this.$el.get(0);
        if (video.volume == 0 || video.muted) {
            if (!this._muteOn) {
                this._startMuteState();
            }
        } else if (this._muteOn) {
            if (video.volume > 0) {
                this._endMuteState();
            }
        }
    };

    VideoPlayer.prototype._onFullscreenChange = function () {
        const video = this.$el.get(0);
        if (
            video.webkitDisplayingFullscreen ||
            video.mozFullScreen ||
            video.fullscreen
        ) {
            if (!this._fullscreenOn) {
                var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
                    this.sessionID,
                    this.getCurrentTimestamp(),
                    this.getCurrentPlaybackTime(),
                    [new StateIdentifier(FULLSCREEN_STATE_IDENTIFIER)],
                    null,
                    QOE_DATA_DETAILS
                );
                this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
                this._fullscreenOn = true;
            }
        } else {
            if (this._fullscreenOn) {
                var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
                    this.sessionID,
                    this.getCurrentTimestamp(),
                    this.getCurrentPlaybackTime(),
                    null,
                    [new StateIdentifier(FULLSCREEN_STATE_IDENTIFIER)],
                    QOE_DATA_DETAILS
                );
                this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
                this._fullscreenOn = false;
            }
        }
    };

    VideoPlayer.prototype._onComplete = function () {
        this._completeVideo();
    };

    VideoPlayer.prototype._openVideoIfNecessary = function () {
        if (!this._videoLoaded) {
            this._resetInternalState();
            this._startVideo();

            // Start the monitor timer.
            this._clock = setInterval(
                () => this._onTick(),
                MONITOR_TIMER_INTERVAL
            );
        }
    };

    VideoPlayer.prototype._completeVideo = function () {
        if (this._videoLoaded) {
            var xdmEvent = XdmEventFactory.createSessionCompleteEvent(
                this.sessionID,
                this.getCurrentTimestamp(),
                this.getCurrentPlaybackTime(),
                QOE_DATA_DETAILS
            );
            this._collectEvent(xdmEvent, xdmPath.sessionCompletePath);
            this._unloadVideo();
        }
    };

    VideoPlayer.prototype._unloadVideo = function () {
        clearInterval(this._clock);
        clearInterval(this._hbTimer);

        this._resetInternalState();
        this._sessionStarted = false;

        console.log("Video Unloaded. API Collector reset.");
    };

    VideoPlayer.prototype._resetInternalState = function () {
        this._videoLoaded = false;
        this._clock = null;
    };

    VideoPlayer.prototype._startVideo = function () {
        this._videoLoaded = true;

        var sessionDetails = new SessionDetails(
            SESSION_NAME,
            PLAYER_NAME,
            CONTENT_LENGTH,
            CHANNEL,
            STREAM_TYPE
        );
        var xdmEvent = XdmEventFactory.createSessionStartEvent(
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            sessionDetails,
            CUSTOM_METADATA,
            QOE_DATA_DETAILS
        );

        this._startSession(xdmEvent);
        this._hbTimer = setInterval(() => this._sendPing(), PING_INTERVAL_MS);
    };

    VideoPlayer.prototype._startSession = function (xdmEvent) {
        var jsonPayload = XdmEventConverter.convertToJson(xdmEvent);
        console.log("[Player] Start session");
        console.log(jsonPayload);

        apiClient
            .request({
                baseUrl: xdmConfig.apiBaseUrl,
                path: xdmPath.sessionStartPath,
                method: "POST",
                data: jsonPayload,
            })
            .then((response) => {
                console.log("[Player] Received response");
                console.log(response);

                this.sessionID = response.data.handle[0].payload[0].sessionId;
                this._sessionStarted = true;

                this._processPendingEvents();
            })
            .catch((error) => {
                console.log("[Player] Error");
                console.log(error);
            });
    };

    VideoPlayer.prototype._processPendingEvents = function () {
        this._pendingEvents.forEach((pendingEvent) => {
            this._collectEvent(pendingEvent.xdmEvent, pendingEvent.eventPath);
        });

        this._pendingEvents = [];
    };

    VideoPlayer.prototype._collectEvent = function (xdmEvent, eventPath) {
        if (!this._sessionStarted) {
            console.log("[Player] Queueing event ");
            this._pendingEvents.push(new PendingEvent(xdmEvent, eventPath));
            return;
        }

        if (xdmEvent.mediaCollection.sessionID == null) {
            xdmEvent.mediaCollection.sessionID = this.sessionID;
        }
        var jsonPayload = XdmEventConverter.convertToJson(xdmEvent);
        console.log("[Player] Collect event");
        console.log(jsonPayload);

        apiClient
            .request({
                baseUrl: xdmConfig.apiBaseUrl,
                path: eventPath,
                method: "POST",
                data: jsonPayload,
            })
            .then((response) => {
                console.log("[Player] Received response");
                console.log(response);
            })
            .catch((error) => {
                console.log("[Player] Error");
                console.log(error);
            });
    };

    VideoPlayer.prototype._startAdBreak = function () {
        this._adBreakStarted = true;
        var adBreakStartDetails = new AdBreakStartDetails(
            1,
            AD_BREAK_START_POS,
            AD_BREAK_NAME
        );
        var xdmEvent = XdmEventFactory.createAdBreakStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            adBreakStartDetails,
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.adBreakStartPath);
    };

    VideoPlayer.prototype._completeAdBreak = function () {
        this._adBreakStarted = false;
        var xdmEvent = XdmEventFactory.createAdBreakCompleteEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.adBreakCompletePath);
    };

    VideoPlayer.prototype._startFirstAd = function () {
        this._adOneStarted = true;
        var adStartDetails = new AdStartDetails(
            FIRST_AD_NAME,
            AD_ONE_COMPLETE_POS - AD_ONE_START_POS,
            PLAYER_NAME,
            1
        );
        var xdmEvent = XdmEventFactory.createAdStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            adStartDetails,
            CUSTOM_METADATA,
            QOE_DATA_DETAILS
        );

        this._collectEvent(xdmEvent, xdmPath.adStartPath);
    };

    VideoPlayer.prototype._startSecondAd = function () {
        this._adTwoStarted = true;
        var adStartDetails = new AdStartDetails(
            SECOND_AD_NAME,
            AD_TWO_COMPLETE_POS - AD_TWO_START_POS,
            PLAYER_NAME,
            2
        );
        var xdmEvent = XdmEventFactory.createAdStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            adStartDetails,
            CUSTOM_METADATA,
            QOE_DATA_DETAILS
        );

        this._collectEvent(xdmEvent, xdmPath.adStartPath);
    };

    VideoPlayer.prototype._completeFirstAd = function () {
        this._adOneStarted = false;
        var xdmEvent = XdmEventFactory.createAdCompleteEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.adCompletePath);
    };

    VideoPlayer.prototype._completeSecondAd = function () {
        this._adTwoStarted = false;
        var xdmEvent = XdmEventFactory.createAdCompleteEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.adCompletePath);
    };

    VideoPlayer.prototype._startChapter = function (
        chapterIndex,
        chapterOffset,
        chapterLength
    ) {
        this._chapterStarted = true;
        var chapterStartDetails = new ChapterStartDetails(
            chapterOffset,
            chapterLength,
            chapterIndex,
            CHAPTER_FRIENDLY_NAME
        );
        var xdmEvent = XdmEventFactory.createChapterStartEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            chapterStartDetails,
            CUSTOM_METADATA,
            QOE_DATA_DETAILS
        );

        this._collectEvent(xdmEvent, xdmPath.chapterStartPath);
    };

    VideoPlayer.prototype._completeChapter = function () {
        this._chapterStarted = false;
        var xdmEvent = XdmEventFactory.createChapterCompleteEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.chapterCompletePath);
    };

    VideoPlayer.prototype._startMuteState = function () {
        this._muteOn = true;
        var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            [new StateIdentifier(MUTE_STATE_IDENTIFIER)],
            null,
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
    };

    VideoPlayer.prototype._endMuteState = function () {
        this._muteOn = false;
        var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            null,
            [new StateIdentifier(MUTE_STATE_IDENTIFIER)],
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
    };

    VideoPlayer.prototype._startSubtitlesState = function () {
        this._subtitlesOn = true;
        var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            [new StateIdentifier(SUBTITLES_STATE_IDENTIFIER)],
            null,
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
    };

    VideoPlayer.prototype._endSubtitlesState = function () {
        this._subtitlesOn = false;
        var xdmEvent = XdmEventFactory.createStatesUpdateEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            null,
            [new StateIdentifier(SUBTITLES_STATE_IDENTIFIER)],
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.statesUpdatePath);
    };

    VideoPlayer.prototype._onTick = function () {
        if (!this.$el.get(0).ended) {
            if (this.$el.get(0).seeking || this.$el.get(0).paused) {
                return;
            }
        }

        var vTime = this.getCurrentTime();

        // If we are inside the first chapter
        if (
            vTime >= CHAPTER_ONE_START_POS &&
            vTime < CHAPTER_ONE_COMPLETE_POS
        ) {
            if (!this._chapterStarted) {
                this._startChapter(
                    0,
                    CHAPTER_ONE_START_POS,
                    CHAPTER_ONE_COMPLETE_POS - CHAPTER_ONE_START_POS
                );
            }
        }

        // If we finished the first chapter
        else if (
            vTime >= CHAPTER_ONE_COMPLETE_POS &&
            vTime < CHAPTER_TWO_START_POS
        ) {
            if (this._chapterStarted) {
                this._completeChapter();
            }
        }

        // If we are inside the second chapter
        if (
            vTime >= CHAPTER_TWO_START_POS &&
            vTime < CHAPTER_TWO_COMPLETE_POS
        ) {
            if (!this._chapterStarted) {
                this._startChapter(
                    1,
                    CHAPTER_TWO_START_POS,
                    CHAPTER_TWO_COMPLETE_POS - CHAPTER_TWO_START_POS
                );
            }
        }
        // If we finished the second chapter
        else if (vTime >= CHAPTER_TWO_COMPLETE_POS) {
            if (this._chapterStarted) {
                this._completeChapter();
            }
        }

        // If we're inside ad break content
        if (vTime >= AD_BREAK_START_POS && vTime < AD_BREAK_END_POS) {
            // If we're inside the first ad
            if (vTime <= AD_ONE_COMPLETE_POS) {
                if (!this._adBreakStarted) {
                    this._startAdBreak();
                }
                if (!this._adOneStarted) {
                    this._startFirstAd();
                }
            } else {
                // If we're inside second ad
                if (this._adOneStarted) {
                    this._completeFirstAd();
                    this._startSecondAd();
                }
            }
        } else if (vTime > AD_BREAK_END_POS) {
            // Complete the last ad
            if (this._adTwoStarted) {
                this._completeSecondAd();
            }

            if (this._adBreakStarted) {
                // Complete the ad break
                this._completeAdBreak();
            }
        }

        if (vTime >= SUBTITLES_ON_POS && vTime < SUBTITLES_OFF_POS) {
            // If we are inside the subtitles state
            if (!this._subtitlesOn) this._startSubtitlesState();
        } else if (vTime >= SUBTITLES_OFF_POS) {
            // If we exit the subtitles state
            if (this._subtitlesOn) {
                this._endSubtitlesState();
            }
        }
    };

    VideoPlayer.prototype._sendPing = function () {
        var xdmEvent = XdmEventFactory.createPingEvent(
            this.sessionID,
            this.getCurrentTimestamp(),
            this.getCurrentPlaybackTime(),
            QOE_DATA_DETAILS
        );
        this._collectEvent(xdmEvent, xdmPath.pingPath);
    };

    // Export symbols.
    window.VideoPlayer = VideoPlayer;

    window.addEventListener("load", () => {
        new VideoPlayer("movie");
    });
})();

class PendingEvent {
    constructor(xdmEvent, eventPath) {
        this.xdmEvent = xdmEvent;
        this.eventPath = eventPath;
    }
}
