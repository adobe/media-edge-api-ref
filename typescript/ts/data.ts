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

export interface AbstractMediaCollection {
  playhead: number,
}

export interface SessionStartMediaCollection extends AbstractMediaCollection {
  sessionDetails: SessionDetails,
  customMetadata?: Array<CustomMetadata>,
}

export interface DefaultMediaCollection extends AbstractMediaCollection {
  sessionID?: string, // Note: for downloaded events, the sessionId is not sent
  qoeDataDetails?: QoeDataDetails,
}

export interface AdBreakStartMediaCollection extends DefaultMediaCollection {
  advertisingPodDetails: AdvertisingPodDetails,
  customMetadata?: Array<CustomMetadata>,
}

export interface AdStartMediaCollection extends DefaultMediaCollection {
  advertisingDetails: AdvertisingDetails,
  customMetadata?: Array<CustomMetadata>,
}

export interface ChapterStartMediaCollection extends DefaultMediaCollection {
  chapterDetails: ChapterDetails,
  customMetadata?: Array<CustomMetadata>,
}

export interface StatesUpdateMediaCollection extends DefaultMediaCollection {
  statesStart?: Array<PlayerStateData>,
  statesEnd?: Array<PlayerStateData>
}

export interface BitrateChangeMediaCollection extends DefaultMediaCollection {
  qoeDataDetails: QoeDataDetails
}

export interface ErrorMediaCollection extends DefaultMediaCollection {
  errorDetails: ErrorDetails
}

export interface DownloadedMediaCollection {
  mediaDownloadedEvents: Array<DefaultMediaCollection>
}

export interface CustomMetadata {
  name: string,
  value: string,
}

export interface AdvertisingPodDetails {
  index: number,
  offset: number,
  friendlyName?: string,
}

export interface QoeDataDetails {
  bitrate?: number,
  droppedFrames?: number,
  framesPerSecond?: number,
  timeToStart?: number
}

export interface AdvertisingDetails {
  name: string,
  playerName: string,
  podPosition: number,
  advertiser?: string,
  campaignID?: string,
  creativeID?: string,
  creativeURL?: string,
  length: number,
  placementID?: string,
  friendlyName?: string,
  siteId?: string,
}

export interface ChapterDetails {
  offset: number,
  length: number,
  index: number
  friendlyName?: string
}

export enum StreamType {
  AUDIO = "audio",
  VIDEO = "video",
}

export enum ErrorSourceType {
  PLAYER = "player",
  EXTERNAL = "external",
}

export interface ErrorDetails {
  name: string,
  source: ErrorSourceType
}

export enum EventType {
  SESSION_START = "media.sessionStart",
  SESSION_END = "media.sessionEnd",
  SESSION_COMPLETE = "media.sessionComplete",
  PING = "media.ping",
  PLAY = "media.play",
  PAUSE_START = "media.pauseStart",
  BUFFER_START = "media.bufferStart",
  AD_BREAK_START = "media.adBreakStart",
  AD_BREAK_COMPLETE = "media.adBreakComplete",
  AD_START = "media.adStart",
  AD_COMPLETE = "media.adComplete",
  AD_SKIP = "media.adSkip",
  CHAPTER_START = "media.chapterStart",
  CHAPTER_COMPLETE = "media.chapterComplete",
  CHAPTER_SKIP = "media.chapterSkip",
  ERROR = "media.error",
  BITRATE_CHANGE = "media.bitrateChange",
  STATE_UPDATE = "media.statesUpdate",
  DOWNLOADED = "media.downloaded",
}


export interface SessionDetails {
  name: string,
  length: number,
  contentType: string,
  playerName: string,
  rating?: string,
  adLoad?: string,
  appVersion?: string,
  artist?: string,
  show?: string,
  channel: string,
  episode?: string,
  originator?: string,
  firstAirDate?: Date,
  streamType?: StreamType,
  authorised?: boolean,
  hasResume?: string,
  streamFormat?: string,
  station?: string,
  genre?: string,
  season?: string,
  showType?: string,
  friendlyName?: string,
  author?: string,
  album?: string,
  dayPart?: string,
  label?: string,
  mvps?: string,
  feed?: string,
  assetId?: string,
  publisher?: string,
  firstDigitalDate?: string,
  network?: string,
  isDownloaded?: boolean,
}

export interface PlayerStateData {
  name: string,
}
