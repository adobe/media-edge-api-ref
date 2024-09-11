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

"use strict";

module.exports = {
    // Session events
    sessionStartPath: "/sessionStart",
    sessionEndPath: "/sessionEnd",
    sessionCompletePath: "/sessionComplete",
    // Ad Break events
    adBreakStartPath: "/adBreakStart",
    adBreakCompletePath: "/adBreakComplete",
    // Ad events
    adStartPath: "/adStart",
    adCompletePath: "/adComplete",
    adSkipPath: "/adSkip",
    // Chapter events
    chapterStartPath: "/chapterStart",
    chapterCompletePath: "/chapterComplete",
    chapterSkipPath: "/chapterSkip",
    // Other events
    bitrateChangePath: "/bitrateChange",
    bufferStartPath: "/bufferStart",
    errorPath: "/error",
    pauseStartPath: "/pauseStart",
    pingPath: "/ping",
    playPath: "/play",
    statesUpdatePath: "/statesUpdate",
    downloadedPath: "/downloaded"
};
