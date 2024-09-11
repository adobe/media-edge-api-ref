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

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    "ui": "./src/js/video.player.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].video.player.js"
  },
  plugins: [
    new HtmlWebpackPlugin({template: "./src/js/player/index.html"}),
    new CopyWebpackPlugin([
    	{from: "./src/js/player/style", to: "style"},
		{from: "./src/js/player/script", to: "script"},
		{from: "./src/js/player/vid", to: "vid"}
	])
  ],
  watch: true
};
