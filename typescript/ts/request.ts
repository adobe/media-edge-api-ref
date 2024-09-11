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

import axios from "axios";
import {BASE_URL, CONFIG_ID} from "./config";
import {AbstractMediaCollection, DefaultMediaCollection, EventType} from "./data";

export interface Request {
  path?: string,
  data?: RequestBody
}

export interface RequestBody {
  events: Array<XdmItem>
}

export interface XdmItem {
  xdm: XDM
}

export interface XDM {
  eventType: EventType
  mediaCollection: MediaCollection,
  timestamp: string,
  identityMap?: Array<Object>
}

export type MediaCollection = AbstractMediaCollection | DefaultMediaCollection;

export const sendRequest = (req: Request) => {
  const configIdQueryParam = `?configId=${CONFIG_ID}`;
  return axios.post(`${BASE_URL}${req.path}${configIdQueryParam}`, req.data)
}
