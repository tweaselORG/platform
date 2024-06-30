/* eslint-disable camelcase */
// Generated using quicktype by running
// `yarn quicktype -s ts --src tweasel-har.ts -l typescript-zod -o tweasel-har-zod.ts` and manually fixing the errors.
import * as z from 'zod';

export const FromCacheSchema = z.enum(['disk', 'memory']);
export type FromCache = z.infer<typeof FromCacheSchema>;

export const ResourceTypeSchema = z.enum([
    'csp-violation-report',
    'document',
    'eventsource',
    'fetch',
    'font',
    'image',
    'manifest',
    'media',
    'other',
    'ping',
    'prefetch',
    'preflight',
    'script',
    'signed-exchange',
    'sm-script',
    'sm-stylesheet',
    'stylesheet',
    'texttrack',
    'wasm',
    'webbundle',
    'websocket',
    'webtransport',
    'xhr',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const TypeSchema = z.enum(['receive', 'send']);
export type Type = z.infer<typeof TypeSchema>;

export const ArchitectureSchema = z.enum(['arm', 'arm64', 'mips', 'mips64', 'x86', 'x86_64']);
export type Architecture = z.infer<typeof ArchitectureSchema>;

// The platform the app is for.
//
// A platform that is supported by this library.
//
// The device's operating system.

export const SupportedPlatformSchema = z.enum(['android', 'ios']);
export type SupportedPlatform = z.infer<typeof SupportedPlatformSchema>;

// The type of device (emulator, physical device).
//
// A run target that is supported by this library for the given platform.

export const SupportedRunTargetSchema = z.enum(['device', 'emulator']);
export type SupportedRunTarget = z.infer<typeof SupportedRunTargetSchema>;

// The version of the tweasel-specific metadata format. Currently, `1.0` is the only
// version. If the format is ever
// changed or extended in the future, this version will be incremented.

export const MetaVersionSchema = z.enum(['1.0']);
export type MetaVersion = z.infer<typeof MetaVersionSchema>;

export const ModeSchema = z.enum(['all-apps', 'allowlist', 'denylist']);
export type Mode = z.infer<typeof ModeSchema>;

export const BrowserSchema = z.object({
    comment: z.string().optional(),
    name: z.string(),
    version: z.string(),
});
export type Browser = z.infer<typeof BrowserSchema>;

export const CreatorSchema = z.object({
    comment: z.string().optional(),
    name: z.string(),
    version: z.string(),
});
export type Creator = z.infer<typeof CreatorSchema>;

export const CacheDetailsSchema = z.object({
    comment: z.string().optional(),
    eTag: z.string(),
    expires: z.string().optional(),
    hitCount: z.number(),
    lastAccess: z.string(),
});
export type CacheDetails = z.infer<typeof CacheDetailsSchema>;

export const ChunkSchema = z.object({
    bytes: z.number(),
    ts: z.number(),
});
export type Chunk = z.infer<typeof ChunkSchema>;

export const CookieSchema = z.object({
    comment: z.string().optional(),
    domain: z.string().optional(),
    expires: z.string().optional(),
    httpOnly: z.boolean().optional(),
    name: z.string(),
    path: z.string().optional(),
    secure: z.boolean().optional(),
    value: z.string(),
});
export type Cookie = z.infer<typeof CookieSchema>;

export const HeaderSchema = z.object({
    comment: z.string().optional(),
    name: z.string(),
    value: z.string(),
});
export type Header = z.infer<typeof HeaderSchema>;

export const ParamSchema = z.object({
    comment: z.string().optional(),
    contentType: z.string().optional(),
    fileName: z.string().optional(),
    name: z.string(),
    value: z.string().optional(),
});
export type Param = z.infer<typeof ParamSchema>;

export const QueryStringSchema = z.object({
    comment: z.string().optional(),
    name: z.string(),
    value: z.string(),
});
export type QueryString = z.infer<typeof QueryStringSchema>;

export const ContentSchema = z.object({
    comment: z.string().optional(),
    compression: z.number().optional(),
    encoding: z.string().optional(),
    mimeType: z.string(),
    size: z.number(),
    text: z.string().optional(),
});
export type Content = z.infer<typeof ContentSchema>;

export const TimingsSchema = z.object({
    blocked: z.number().optional(),
    comment: z.string().optional(),
    connect: z.number().optional(),
    dns: z.number().optional(),
    receive: z.number(),
    send: z.number().optional(),
    ssl: z.number().optional(),
    wait: z.number(),
});
export type Timings = z.infer<typeof TimingsSchema>;

export const WebSocketMessageSchema = z.object({
    data: z.string(),
    opcode: z.number(),
    time: z.number(),
    type: TypeSchema,
});
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

export const PageTimingSchema = z.object({
    _startRender: z.union([z.number(), z.null()]).optional(),
    comment: z.string().optional(),
    onContentLoad: z.number().optional(),
    onLoad: z.number().optional(),
});
export type PageTiming = z.infer<typeof PageTimingSchema>;

export const PostDataSchema = z.object({
    comment: z.string().optional(),
    mimeType: z.string(),
    params: z.array(ParamSchema).optional(),
    text: z.string().optional(),
});
export type PostData = z.infer<typeof PostDataSchema>;

export const PostDataCommonSchema = z.object({
    comment: z.string().optional(),
    mimeType: z.string(),
});
export type PostDataCommon = z.infer<typeof PostDataCommonSchema>;

export const PostDataParamsSchema = z.object({
    params: z.array(ParamSchema),
});
export type PostDataParams = z.infer<typeof PostDataParamsSchema>;

export const PostDataTextSchema = z.object({
    text: z.string(),
});
export type PostDataText = z.infer<typeof PostDataTextSchema>;

export const TweaselAppSchema = z.object({
    architectures: z.array(ArchitectureSchema),
    id: z.string(),
    md5: z.string().optional(),
    name: z.string().optional(),
    platform: SupportedPlatformSchema,
    version: z.string().optional(),
    versionCode: z.string().optional(),
});
export type TweaselApp = z.infer<typeof TweaselAppSchema>;

export const TweaselDeviceSchema = z.object({
    architectures: z.string(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    modelCodeName: z.string().optional(),
    osBuild: z.string().optional(),
    osVersion: z.string(),
    platform: SupportedPlatformSchema,
    runTarget: SupportedRunTargetSchema,
});
export type TweaselDevice = z.infer<typeof TweaselDeviceSchema>;

export const TrafficCollectionOptionsSchema = z.object({
    mode: ModeSchema,
    apps: z.array(z.string()).optional(),
});
export type TrafficCollectionOptions = z.infer<typeof TrafficCollectionOptionsSchema>;

export const RecordStringStringSchema = z.object({}).passthrough();
export type RecordStringString = z.infer<typeof RecordStringStringSchema>;

export const TweaselHarMetaV1AppSchema = z.object({
    architectures: z.array(ArchitectureSchema),
    id: z.string(),
    md5: z.string().optional(),
    name: z.string().optional(),
    platform: SupportedPlatformSchema,
    version: z.string().optional(),
    versionCode: z.string().optional(),
});
export type TweaselHarMetaV1App = z.infer<typeof TweaselHarMetaV1AppSchema>;

export const TweaselHarMetaV1DeviceSchema = z.object({
    architectures: z.string(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    modelCodeName: z.string().optional(),
    osBuild: z.string().optional(),
    osVersion: z.string(),
    platform: SupportedPlatformSchema,
    runTarget: SupportedRunTargetSchema,
});
export type TweaselHarMetaV1Device = z.infer<typeof TweaselHarMetaV1DeviceSchema>;

export const DeviceSchema = z.object({
    architectures: z.string(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    modelCodeName: z.string().optional(),
    osBuild: z.string().optional(),
    osVersion: z.string(),
    platform: SupportedPlatformSchema,
    runTarget: SupportedRunTargetSchema,
});
export type Device = z.infer<typeof DeviceSchema>;

export const AppSchema = z.object({
    architectures: z.array(ArchitectureSchema),
    id: z.string(),
    md5: z.string().optional(),
    name: z.string().optional(),
    platform: SupportedPlatformSchema,
    version: z.string().optional(),
    versionCode: z.string().optional(),
});
export type App = z.infer<typeof AppSchema>;

export const CacheSchema = z.object({
    afterRequest: z.union([CacheDetailsSchema, z.null()]).optional(),
    beforeRequest: z.union([CacheDetailsSchema, z.null()]).optional(),
    comment: z.string().optional(),
});
export type Cache = z.infer<typeof CacheSchema>;

export const PostDataClassSchema = z.object({
    comment: z.string().optional(),
    mimeType: z.string(),
    params: z.array(ParamSchema).optional(),
    text: z.string().optional(),
});
export type PostDataClass = z.infer<typeof PostDataClassSchema>;

export const ResponseSchema = z.object({
    _transferSize: z.union([z.number(), z.null()]).optional(),
    bodySize: z.number(),
    comment: z.string().optional(),
    content: ContentSchema,
    cookies: z.array(CookieSchema),
    headers: z.array(HeaderSchema),
    headersSize: z.number(),
    httpVersion: z.string(),
    redirectURL: z.string(),
    status: z.number(),
    statusText: z.string(),
});
export type Response = z.infer<typeof ResponseSchema>;

export const PageSchema = z.object({
    _adult_site: z.union([z.number(), z.null()]).optional(),
    _aft: z.union([z.number(), z.null()]).optional(),
    _base_page_cdn: z.union([z.null(), z.string()]).optional(),
    _base_page_redirects: z.union([z.number(), z.null()]).optional(),
    _base_page_ttfb: z.union([z.number(), z.null()]).optional(),
    _browser_main_memory_kb: z.union([z.number(), z.null()]).optional(),
    _browser_name: z.union([z.null(), z.string()]).optional(),
    _browser_other_private_memory_kb: z.union([z.number(), z.null()]).optional(),
    _browser_process_count: z.union([z.number(), z.null()]).optional(),
    _browser_version: z.union([z.null(), z.string()]).optional(),
    _browser_working_set_kb: z.union([z.number(), z.null()]).optional(),
    _bytesIn: z.union([z.number(), z.null()]).optional(),
    _bytesInDoc: z.union([z.number(), z.null()]).optional(),
    _bytesOut: z.union([z.number(), z.null()]).optional(),
    _bytesOutDoc: z.union([z.number(), z.null()]).optional(),
    _cached: z.union([z.number(), z.null()]).optional(),
    _certificate_bytes: z.union([z.number(), z.null()]).optional(),
    _connections: z.union([z.number(), z.null()]).optional(),
    _date: z.union([z.number(), z.null()]).optional(),
    _docCPUms: z.union([z.number(), z.null()]).optional(),
    _docCPUpct: z.union([z.number(), z.null()]).optional(),
    _docTime: z.union([z.number(), z.null()]).optional(),
    _domContentLoadedEventEnd: z.union([z.number(), z.null()]).optional(),
    _domContentLoadedEventStart: z.union([z.number(), z.null()]).optional(),
    _domElements: z.union([z.number(), z.null()]).optional(),
    _domInteractive: z.union([z.number(), z.null()]).optional(),
    _domLoading: z.union([z.number(), z.null()]).optional(),
    _domTime: z.union([z.number(), z.null()]).optional(),
    _effectiveBps: z.union([z.number(), z.null()]).optional(),
    _effectiveBpsDoc: z.union([z.number(), z.null()]).optional(),
    _eventName: z.union([z.null(), z.string()]).optional(),
    _firstPaint: z.union([z.number(), z.null()]).optional(),
    _fixed_viewport: z.union([z.number(), z.null()]).optional(),
    _fullyLoaded: z.union([z.number(), z.null()]).optional(),
    _fullyLoadedCPUms: z.union([z.number(), z.null()]).optional(),
    _fullyLoadedCPUpct: z.union([z.number(), z.null()]).optional(),
    _gzip_savings: z.union([z.number(), z.null()]).optional(),
    _gzip_total: z.union([z.number(), z.null()]).optional(),
    _image_savings: z.union([z.number(), z.null()]).optional(),
    _image_total: z.union([z.number(), z.null()]).optional(),
    _isResponsive: z.union([z.number(), z.null()]).optional(),
    _lastVisualChange: z.union([z.number(), z.null()]).optional(),
    _loadEventEnd: z.union([z.number(), z.null()]).optional(),
    _loadEventStart: z.union([z.number(), z.null()]).optional(),
    _loadTime: z.union([z.number(), z.null()]).optional(),
    _minify_savings: z.union([z.number(), z.null()]).optional(),
    _minify_total: z.union([z.number(), z.null()]).optional(),
    _optimization_checked: z.union([z.number(), z.null()]).optional(),
    _pageSpeedVersion: z.union([z.null(), z.string()]).optional(),
    _render: z.union([z.number(), z.null()]).optional(),
    _requests: z.union([z.number(), z.null()]).optional(),
    _requestsDoc: z.union([z.number(), z.null()]).optional(),
    _requestsFull: z.union([z.number(), z.null()]).optional(),
    _responses_200: z.union([z.number(), z.null()]).optional(),
    _responses_404: z.union([z.number(), z.null()]).optional(),
    _responses_other: z.union([z.number(), z.null()]).optional(),
    _result: z.union([z.number(), z.null()]).optional(),
    _run: z.union([z.number(), z.null()]).optional(),
    _score_cache: z.union([z.number(), z.null()]).optional(),
    _score_cdn: z.union([z.number(), z.null()]).optional(),
    _score_combine: z.union([z.number(), z.null()]).optional(),
    _score_compress: z.union([z.number(), z.null()]).optional(),
    _score_cookies: z.union([z.number(), z.null()]).optional(),
    _score_etags: z.union([z.number(), z.null()]).optional(),
    _score_gzip: z.union([z.number(), z.null()]).optional(),
    '_score_keep-alive': z.union([z.number(), z.null()]).optional(),
    _score_minify: z.union([z.number(), z.null()]).optional(),
    _score_progressive_jpeg: z.union([z.number(), z.null()]).optional(),
    _server_count: z.union([z.number(), z.null()]).optional(),
    _server_rtt: z.union([z.number(), z.null()]).optional(),
    _SpeedIndex: z.union([z.number(), z.null()]).optional(),
    _step: z.union([z.number(), z.null()]).optional(),
    _title: z.union([z.null(), z.string()]).optional(),
    _titleTime: z.union([z.number(), z.null()]).optional(),
    _TTFB: z.union([z.number(), z.null()]).optional(),
    _URL: z.union([z.null(), z.string()]).optional(),
    _visualComplete: z.union([z.number(), z.null()]).optional(),
    comment: z.string().optional(),
    id: z.string(),
    pageTimings: PageTimingSchema,
    startedDateTime: z.string(),
    title: z.string(),
});
export type Page = z.infer<typeof PageSchema>;

export const TweaselSchema = z.object({
    apps: z.array(TweaselAppSchema).optional(),
    device: TweaselDeviceSchema,
    endDate: z.string(),
    metaVersion: MetaVersionSchema,
    options: TrafficCollectionOptionsSchema,
    startDate: z.string(),
    versions: RecordStringStringSchema,
});
export type Tweasel = z.infer<typeof TweaselSchema>;

export const TweaselHarMetaV1Schema = z.object({
    apps: z.array(TweaselHarMetaV1AppSchema).optional(),
    device: TweaselHarMetaV1DeviceSchema,
    endDate: z.string(),
    metaVersion: MetaVersionSchema,
    options: TrafficCollectionOptionsSchema,
    startDate: z.string(),
    versions: RecordStringStringSchema,
});
export type TweaselHarMetaV1 = z.infer<typeof TweaselHarMetaV1Schema>;

export const RequestSchema = z.object({
    bodySize: z.number(),
    comment: z.string().optional(),
    cookies: z.array(CookieSchema),
    headers: z.array(HeaderSchema),
    headersSize: z.number(),
    httpVersion: z.string(),
    method: z.string(),
    postData: PostDataClassSchema.optional(),
    queryString: z.array(QueryStringSchema),
    url: z.string(),
});
export type Request = z.infer<typeof RequestSchema>;

export const EntrySchema = z.object({
    _all_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _all_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _all_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _bytesIn: z.union([z.number(), z.null(), z.string()]).optional(),
    _bytesOut: z.union([z.number(), z.null(), z.string()]).optional(),
    _cache_time: z.union([z.number(), z.null(), z.string()]).optional(),
    _cacheControl: z.union([z.null(), z.string()]).optional(),
    _cdn_provider: z.union([z.null(), z.string()]).optional(),
    _certificate_bytes: z.union([z.number(), z.null(), z.string()]).optional(),
    _chunks: z.union([z.array(ChunkSchema), z.null()]).optional(),
    _client_port: z.union([z.number(), z.null(), z.string()]).optional(),
    _connect_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _connect_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _connect_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _contentEncoding: z.union([z.null(), z.string()]).optional(),
    _contentType: z.union([z.null(), z.string()]).optional(),
    _dns_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _dns_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _dns_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _download_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _download_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _download_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _expires: z.union([z.null(), z.string()]).optional(),
    _fromCache: z.union([FromCacheSchema, z.null()]).optional(),
    _full_url: z.union([z.null(), z.string()]).optional(),
    _gzip_save: z.union([z.number(), z.null(), z.string()]).optional(),
    _gzip_total: z.union([z.number(), z.null(), z.string()]).optional(),
    _host: z.union([z.null(), z.string()]).optional(),
    _http2_stream_dependency: z.union([z.number(), z.null(), z.string()]).optional(),
    _http2_stream_exclusive: z.union([z.number(), z.null(), z.string()]).optional(),
    _http2_stream_id: z.union([z.number(), z.null(), z.string()]).optional(),
    _http2_stream_weight: z.union([z.number(), z.null(), z.string()]).optional(),
    _image_save: z.union([z.number(), z.null(), z.string()]).optional(),
    _image_total: z.union([z.number(), z.null(), z.string()]).optional(),
    _index: z.union([z.number(), z.null()]).optional(),
    _initialPriority: z.union([z.null(), z.string()]).optional(),
    _initiator: z.union([z.null(), z.string()]).optional(),
    _initiator_column: z.union([z.null(), z.string()]).optional(),
    _initiator_detail: z.union([z.null(), z.string()]).optional(),
    _initiator_function: z.union([z.null(), z.string()]).optional(),
    _initiator_line: z.union([z.null(), z.string()]).optional(),
    _initiator_type: z.union([z.null(), z.string()]).optional(),
    _ip_addr: z.union([z.null(), z.string()]).optional(),
    _is_secure: z.union([z.number(), z.null(), z.string()]).optional(),
    _isLCP: z.union([z.boolean(), z.null()]).optional(),
    _jpeg_scan_count: z.union([z.number(), z.null(), z.string()]).optional(),
    _load_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _load_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _load_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _method: z.union([z.null(), z.string()]).optional(),
    _minify_save: z.union([z.number(), z.null(), z.string()]).optional(),
    _minify_total: z.union([z.number(), z.null(), z.string()]).optional(),
    _number: z.union([z.number(), z.null()]).optional(),
    _objectSize: z.union([z.number(), z.null(), z.string()]).optional(),
    _objectSizeUncompressed: z.union([z.number(), z.null(), z.string()]).optional(),
    _priority: z.union([z.null(), z.string()]).optional(),
    _protocol: z.union([z.number(), z.null(), z.string()]).optional(),
    _renderBlocking: z.union([z.null(), z.string()]).optional(),
    _request_id: z.union([z.number(), z.null(), z.string()]).optional(),
    _resourceType: z.union([ResourceTypeSchema, z.null()]).optional(),
    _responseCode: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_cache: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_cdn: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_combine: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_compress: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_cookies: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_etags: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_gzip: z.union([z.number(), z.null(), z.string()]).optional(),
    '_score_keep-alive': z.union([z.number(), z.null(), z.string()]).optional(),
    _score_minify: z.union([z.number(), z.null(), z.string()]).optional(),
    _score_progressive_jpeg: z.union([z.number(), z.null()]).optional(),
    _server_count: z.union([z.number(), z.null(), z.string()]).optional(),
    _server_rtt: z.union([z.number(), z.null(), z.string()]).optional(),
    _socket: z.union([z.number(), z.null(), z.string()]).optional(),
    _ssl_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _ssl_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _ssl_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _ttfb_end: z.union([z.number(), z.null(), z.string()]).optional(),
    _ttfb_ms: z.union([z.number(), z.null(), z.string()]).optional(),
    _ttfb_start: z.union([z.number(), z.null(), z.string()]).optional(),
    _type: z.union([z.number(), z.null(), z.string()]).optional(),
    _url: z.union([z.null(), z.string()]).optional(),
    _was_pushed: z.union([z.number(), z.null(), z.string()]).optional(),
    _webSocketMessages: z.union([z.array(WebSocketMessageSchema), z.null()]).optional(),
    cache: CacheSchema,
    comment: z.string().optional(),
    connection: z.string().optional(),
    pageref: z.string().optional(),
    request: RequestSchema,
    response: ResponseSchema,
    serverIPAddress: z.string().optional(),
    startedDateTime: z.string(),
    time: z.number(),
    timings: TimingsSchema,
});
export type Entry = z.infer<typeof EntrySchema>;

export const LogClassSchema = z.object({
    browser: BrowserSchema.optional(),
    comment: z.string().optional(),
    creator: CreatorSchema,
    entries: z.array(EntrySchema),
    pages: z.array(PageSchema).optional(),
    version: z.string(),
    _tweasel: TweaselSchema,
});
export type LogClass = z.infer<typeof LogClassSchema>;

export const TweaselHarSchema = z.object({
    log: LogClassSchema,
});
export type TweaselHar = z.infer<typeof TweaselHarSchema>;

export const LogSchema = z.object({
    browser: BrowserSchema.optional(),
    comment: z.string().optional(),
    creator: CreatorSchema,
    entries: z.array(EntrySchema),
    pages: z.array(PageSchema).optional(),
    version: z.string(),
});
export type Log = z.infer<typeof LogSchema>;

export const HarSchema = z.object({
    log: LogSchema,
});
export type Har = z.infer<typeof HarSchema>;

/*
Partly based on https://www.npmjs.com/package/@types/har-format, which is licensed under the following license:

MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
*/
/* eslint-enable camelcase */
