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

class XdmWrapper {
    constructor(xdmPayload) {
        this.xdm = xdmPayload;
    }
}

class XdmPayload {
    constructor(xdmEvent) {
        this.events = [new XdmWrapper(xdmEvent)];
    }
}

class XdmEvent {
    constructor(mediaCollection, eventType, timestamp) {
        this.mediaCollection = mediaCollection;
        this.eventType = eventType;
        this.timestamp = timestamp;
    }
}

class XdmDownloadedEvent {
    constructor(mediaDownloadedEvents, eventType) {
        this.mediaDownloadedEvents = mediaDownloadedEvents;
        this.eventType = eventType;
    }
}

class NonSessionStartMediaCollection {
    constructor(playhead, sessionID, qoeDataDetails = null) {
        this.playhead = playhead;
        this.sessionID = sessionID;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class AdBreakStartMediaCollection {
    constructor(
        playhead,
        sessionID,
        advertisingPodDetails,
        qoeDataDetails = null
    ) {
        this.playhead = playhead;
        this.advertisingPodDetails = advertisingPodDetails;
        this.sessionID = sessionID;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class AdStartMediaCollection {
    constructor(
        playhead,
        sessionID,
        advertisingDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        this.playhead = playhead;
        this.advertisingDetails = advertisingDetails;
        this.sessionID = sessionID;
        this.customMetadata = customMetadata;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class ChapterStartMediaCollection {
    constructor(
        playhead,
        sessionID,
        chapterDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        this.playhead = playhead;
        this.chapterDetails = chapterDetails;
        this.sessionID = sessionID;
        this.customMetadata = customMetadata;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class ErrorMediaCollection {
    constructor(playhead, sessionID, errorDetails, qoeDataDetails = null) {
        this.playhead = playhead;
        this.errorDetails = errorDetails;
        this.sessionID = sessionID;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class StatesUpdateMediaCollection {
    constructor(
        playhead,
        sessionID,
        statesStartIdentifiers = null,
        statesEndIdentifiers = null,
        qoeDataDetails = null
    ) {
        this.playhead = playhead;
        this.sessionID = sessionID;
        this.statesStart = statesStartIdentifiers;
        this.statesEnd = statesEndIdentifiers;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class SessionStartMediaCollection {
    constructor(
        playhead,
        sessionDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        this.playhead = playhead;
        this.sessionDetails = sessionDetails;
        this.customMetadata = customMetadata;
        this.qoeDataDetails = qoeDataDetails;
    }
}

class SessionDetails {
    constructor(
        name,
        playerName,
        length,
        channel,
        contentType,
        adLoad = null,
        appVersion = null,
        artist = null,
        rating = null,
        show = null,
        episode = null,
        originator = null,
        firstAirDate = null,
        streamType = null,
        authorized = null,
        hasResume = null,
        streamFormat = null,
        station = null,
        genre = null,
        season = null,
        showType = null,
        friendlyName = null,
        author = null,
        album = null,
        dayPart = null,
        label = null,
        mvpd = null,
        feed = null,
        assetID = null,
        publisher = null,
        firstDigitalDate = null,
        network = null,
        isDownloaded = null
    ) {
        this.name = name;
        this.playerName = playerName;
        this.length = length;
        this.channel = channel;
        this.contentType = contentType;
        this.adLoad = adLoad;
        this.appVersion = appVersion;
        this.artist = artist;
        this.rating = rating;
        this.show = show;
        this.episode = episode;
        this.originator = originator;
        this.firstAirDate = firstAirDate;
        this.streamType = streamType;
        this.authorized = authorized;
        this.hasResume = hasResume;
        this.streamFormat = streamFormat;
        this.station = station;
        this.genre = genre;
        this.season = season;
        this.showType = showType;
        this.friendlyName = friendlyName;
        this.author = author;
        this.album = album;
        this.dayPart = dayPart;
        this.label = label;
        this.mvpd = mvpd;
        this.feed = feed;
        this.assetID = assetID;
        this.publisher = publisher;
        this.firstDigitalDate = firstDigitalDate;
        this.network = network;
        this.isDownloaded = isDownloaded;
    }
}

class AdBreakStartDetails {
    constructor(index, offset, friendlyName = null) {
        this.index = index;
        this.offset = offset;
        this.friendlyName = friendlyName;
    }
}

class AdStartDetails {
    constructor(
        name,
        length,
        playerName,
        podPosition,
        advertiser = null,
        campaignID = null,
        creativeID = null,
        creativeURL = null,
        placementID = null,
        friendlyName = null,
        siteID = null
    ) {
        this.name = name;
        this.length = length;
        this.playerName = playerName;
        this.podPosition = podPosition;
        this.advertiser = advertiser;
        this.campaignID = campaignID;
        this.creativeID = creativeID;
        this.creativeURL = creativeURL;
        this.placementID = placementID;
        this.friendlyName = friendlyName;
        this.siteID = siteID;
    }
}

class ChapterStartDetails {
    constructor(offset, length, index, friendlyName = null) {
        this.offset = offset;
        this.length = length;
        this.index = index;
        this.friendlyName = friendlyName;
    }
}

class ErrorDetails {
    constructor(name, source) {
        this.name = name;
        this.source = source;
    }
}

class StateIdentifier {
    constructor(name) {
        this.name = name;
    }
}

class CustomMetadata {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

class QoeDataDetails {
    constructor(
        bitrate = null,
        droppedFrames = null,
        framesPerSecond = null,
        timeToStart = null
    ) {
        this.bitrate = bitrate;
        this.droppedFrames = droppedFrames;
        this.framesPerSecond = framesPerSecond;
        this.timeToStart = timeToStart;
    }
}

const EventType = {
    AD_BREAK_START: "media.adBreakStart",
    AD_BREAK_COMPLETE: "media.adBreakComplete",
    AD_START: "media.adStart",
    AD_COMPLETE: "media.adComplete",
    AD_SKIP: "media.adSkip",
    BITRATE_CHANGE: "media.bitrateChange",
    BUFFER_START: "media.bufferStart",
    CHAPTER_START: "media.chapterStart",
    CHAPTER_COMPLETE: "media.chapterComplete",
    CHAPTER_SKIP: "media.chapterSkip",
    ERROR: "media.error",
    PAUSE_START: "media.pauseStart",
    PING: "media.ping",
    PLAY: "media.play",
    SESSION_COMPLETE: "media.sessionComplete",
    SESSION_END: "media.sessionEnd",
    SESSION_START: "media.sessionStart",
    STATES_UPDATE: "media.statesUpdate",
    DOWNLOADED: "media.downloaded",
};

class XdmEventFactory {
    // Create a new XdmEvent instance for each of the events described in the EventType object
    static _createXdmEvent(eventType, timestamp, mediaCollection) {
        return new XdmEvent(mediaCollection, eventType, timestamp);
    }

    static _createXdmDownloadedEvent(eventType, mediaDownloadedEvents) {
        return new XdmDownloadedEvent(mediaDownloadedEvents, eventType);
    }

    static createAdBreakStartEvent(
        sessionID,
        timestamp,
        playhead,
        adBreakStartDetails,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.AD_BREAK_START,
            timestamp,
            new AdBreakStartMediaCollection(
                playhead,
                sessionID,
                adBreakStartDetails,
                qoeDataDetails
            )
        );
    }

    static createAdBreakCompleteEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.AD_BREAK_COMPLETE,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createAdStartEvent(
        sessionID,
        timestamp,
        playhead,
        adStartDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.AD_START,
            timestamp,
            new AdStartMediaCollection(
                playhead,
                sessionID,
                adStartDetails,
                customMetadata,
                qoeDataDetails
            )
        );
    }

    static createAdCompleteEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.AD_COMPLETE,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createAdSkipEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.AD_SKIP,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createBitrateChangeEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.BITRATE_CHANGE,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createBufferStartEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.BUFFER_START,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createChapterStartEvent(
        sessionID,
        timestamp,
        playhead,
        chapterStartDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.CHAPTER_START,
            timestamp,
            new ChapterStartMediaCollection(
                playhead,
                sessionID,
                chapterStartDetails,
                customMetadata,
                qoeDataDetails
            )
        );
    }

    static createChapterCompleteEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.CHAPTER_COMPLETE,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createChapterSkipEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.CHAPTER_SKIP,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createErrorEvent(
        sessionID,
        timestamp,
        playhead,
        errorDetails,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.ERROR,
            timestamp,
            new ErrorMediaCollection(
                playhead,
                sessionID,
                errorDetails,
                qoeDataDetails
            )
        );
    }

    static createPauseStartEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.PAUSE_START,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createPingEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.PING,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createPlayEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.PLAY,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createSessionCompleteEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.SESSION_COMPLETE,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createSessionEndEvent(
        sessionID,
        timestamp,
        playhead,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.SESSION_END,
            timestamp,
            new NonSessionStartMediaCollection(
                playhead,
                sessionID,
                qoeDataDetails
            )
        );
    }

    static createSessionStartEvent(
        timestamp,
        playhead,
        sessionDetails,
        customMetadata = null,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.SESSION_START,
            timestamp,
            new SessionStartMediaCollection(
                playhead,
                sessionDetails,
                customMetadata,
                qoeDataDetails
            )
        );
    }

    static createStatesUpdateEvent(
        sessionID,
        timestamp,
        playhead,
        statesStartIdentifiers = null,
        statesEndIdentifiers = null,
        qoeDataDetails = null
    ) {
        return this._createXdmEvent(
            EventType.STATES_UPDATE,
            timestamp,
            new StatesUpdateMediaCollection(
                playhead,
                sessionID,
                statesStartIdentifiers,
                statesEndIdentifiers,
                qoeDataDetails
            )
        );
    }

    // Create a downloaded event. The mediaDownloadedEvents field is an array of XdmEvents without a sessionId
    // It is enough to set the sessionId to null for it to not be included in the payload
    static createDownloadedEvent(
        mediaDownloadedEvents
    ) {
        return this._createXdmDownloadedEvent(
            EventType.DOWNLOADED,
            mediaDownloadedEvents
        );
    }
}

class XdmEventConverter {
    static _convertPayloadToJson(xdmPayload) {
        return JSON.stringify(xdmPayload, (key, value) => {
            // Exclude properties with null values
            return value !== null ? value : undefined;
        });
    }

    static convertToJson(event) {
        return this._convertPayloadToJson(new XdmPayload(event));
    }
}

module.exports = {
    XdmEvent,
    XdmDownloadedEvent,
    XdmPayload,
    SessionDetails,
    AdBreakStartDetails,
    AdStartDetails,
    ChapterStartDetails,
    ErrorDetails,
    StateIdentifier,
    CustomMetadata,
    QoeDataDetails,
    XdmEventFactory,
    XdmEventConverter,
    EventType,
};
