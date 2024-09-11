# Media Edge API

For more information on Media Edge API and how to use it, please visit our [developer documentation](https://developer.adobe.com/cja-apis/docs/endpoints/media-edge/).

For information on how to set up Media Edge API on Experience Platform, please visit our [official documentation](https://experienceleague.adobe.com/en/docs/media-analytics/using/implementation/edge-recommended/media-edge-sdk/implementation-edge).

This is a reference implementation of the Media Edge API. The implementation is written in TypeScript and JavaScript.

In this implementation, requests are made based on a video which follows a specific scenario. The scenario is described as follows:

- The video has a total length of 104 seconds.
- It consists of two chapters separated by an ad break. 
- The ad break consists of two ads that run one after the other. Note that the ads are not counted as actual runtime of the video, so the actual content length is 74 seconds.
- At the end of the video, subtitles are turned on and then turned off.
- The player also contains listeners for the mute and fullscreen video states, which send an event when the video is muted or unmuted, and when the video is set to fullscreen or not respectively.

The timestamps and time values (in seconds) of the scenario listed above are the following:

- total video length &rarr; 104
- actual content length &rarr; 74
- chapter one start &rarr; 1, chapter one complete &rarr; 25
- ad break start &rarr; 25, ad break complete &rarr; 55
- first ad start &rarr; 25, first ad complete &rarr; 40
- second ad start &rarr; 40, second ad complete &rarr; 55
- chapter two start &rarr; 55, chapter two complete &rarr; 104
- subtitles on start &rarr; 80, subtitles on complete &rarr; 93


Example of sent events:

| **Event**       | **Playhead** | **Timestamp**            |
|-----------------|--------------|--------------------------|
| sessionStart    | 0            | 2024-03-04T16:39:36.855Z |
| play            | 0            | 2024-03-04T16:39:36.860Z |
| chapterStart    | 1            | 2024-03-04T16:39:38.361Z |
| ping            | 9            | 2024-03-04T16:39:46.862Z |
| ping            | 19           | 2024-03-04T16:39:56.863Z |
| chapterStart    | 25           | 2024-03-04T16:40:02.362Z |
| adBreakStart    | 25           | 2024-03-04T16:40:02.364Z |
| adStart         | 25           | 2024-03-04T16:40:02.365Z |
| ping            | 25           | 2024-03-04T16:40:16.863Z |
| adComplete      | 25           | 2024-03-04T16:40:17.364Z |
| adStart         | 25           | 2024-03-04T16:40:17.366Z |
| ping            | 25           | 2024-03-04T16:40:26.862Z |
| adComplete      | 25           | 2024-03-04T16:40:32.366Z |
| adBreakComplete | 25           | 2024-03-04T16:40:32.368Z |
| chapterStart    | 25           | 2024-03-04T16:40:32.369Z |
| ping            | 29           | 2024-03-04T16:40:36.862Z |
| ping            | 39           | 2024-03-04T16:40:46.865Z |
| ping            | 49           | 2024-03-04T16:40:56.866Z |
| statesUpdate    | 50           | 2024-03-04T16:40:57.363Z |
| ping            | 59           | 2024-03-04T16:41:06.863Z |
| statesUpdate    | 63           | 2024-03-04T16:41:10.363Z |
| ping            | 69           | 2024-03-04T16:41:16.866Z |
| pauseStart      | 74           | 2024-03-04T16:41:21.272Z |
| chapterComplete | 74           | 2024-03-04T16:41:21.280Z |
| sessionComplete | 74           | 2024-03-04T16:41:21.281Z |
