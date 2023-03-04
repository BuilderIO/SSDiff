"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = __importDefault(require("puppeteer"));
var pixelmatch_1 = __importDefault(require("pixelmatch"));
var fs_1 = __importDefault(require("fs"));
var pngjs_1 = require("pngjs");
// import Links from '../links.json';
var url_3 = require("url");
var ScreenshotDiff = /** @class */ (function () {
    function ScreenshotDiff(config) {
        var _a, _b, _c;
        var defaultScreenshotConfig = {
            type: 'png'
        };
        var defaultBrowserConfig = {
            defaultViewport: {
                width: 1294,
                height: 1280,
            }
        };
        var defaultDebugOption = false;
        this.url_1 = config.url_1;
        this.url_2 = config.url_2;
        this.pathnames = config.pathnames;
        this.debug = (_a = config.debug) !== null && _a !== void 0 ? _a : defaultDebugOption;
        this.browserConfig = (_b = config.browserConfig) !== null && _b !== void 0 ? _b : defaultBrowserConfig;
        this.screenshotConfig = (_c = config.screenshotConfig) !== null && _c !== void 0 ? _c : defaultScreenshotConfig;
        this.browser = null;
        // TODO: make the file naming dynamic based on hostnames
        this.screenshotsFolder = process.cwd() + '/screenshots';
        var todaysDate = new Date().toISOString().split('T')[0];
        this.todaysScreenshotFolder = this.screenshotsFolder + '/' + todaysDate;
        this.diffScreenshots = this.todaysScreenshotFolder + '/diff';
        if (!fs_1.default.existsSync(this.diffScreenshots)) {
            fs_1.default.mkdirSync(this.diffScreenshots, { recursive: true });
            this.log("Created diff folder for todays ss");
        }
    }
    ScreenshotDiff.prototype.log = function (text) {
        if (this.debug) {
            console.log(text);
        }
    };
    ScreenshotDiff.prototype.puppeteer_browser_open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.browser) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, puppeteer_1.default.launch(this.browserConfig)];
                    case 1:
                        _a.browser = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ScreenshotDiff.prototype.puppeteer_browser_close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.browser) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.browser.close()
                            // setting this as null so we dont get closed instance the next time
                        ];
                    case 1:
                        _a.sent();
                        // setting this as null so we dont get closed instance the next time
                        this.browser = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ScreenshotDiff.prototype.getFileName = function (url) {
        var parsedURL = new url_3.URL(url);
        return parsedURL.pathname.split('/')[3];
    };
    ScreenshotDiff.prototype.screenshot = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, screenshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        this.log('New Page in browser opened');
                        return [4 /*yield*/, page.goto(url, {
                                waitUntil: "networkidle0",
                                timeout: 0
                            })];
                    case 2:
                        _a.sent();
                        this.log("URL opened on page ".concat(url));
                        return [4 /*yield*/, page.screenshot(this.screenshotConfig)];
                    case 3:
                        screenshot = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 4:
                        _a.sent();
                        this.log('Page closed');
                        return [2 /*return*/, screenshot];
                }
            });
        });
    };
    ScreenshotDiff.prototype.compare = function (compareObj) {
        return __awaiter(this, void 0, void 0, function () {
            var url_1, url_2, fileName, screenshots, image_1, image_2, height, width, diff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url_1 = compareObj.url_1, url_2 = compareObj.url_2, fileName = compareObj.fileName;
                        return [4 /*yield*/, Promise.all([this.screenshot(url_1), this.screenshot(url_2)])];
                    case 1:
                        screenshots = _a.sent();
                        image_1 = pngjs_1.PNG.sync.read(screenshots[0]);
                        image_2 = pngjs_1.PNG.sync.read(screenshots[1]);
                        height = image_1.height, width = image_1.width;
                        diff = new pngjs_1.PNG({ width: width, height: height });
                        (0, pixelmatch_1.default)(image_1.data, image_2.data, diff.data, width, height, { threshold: 0.7, includeAA: true });
                        fs_1.default.writeFileSync(this.diffScreenshots + "/".concat(fileName), pngjs_1.PNG.sync.write(diff));
                        return [2 /*return*/];
                }
            });
        });
    };
    ScreenshotDiff.prototype.result = function () {
        return __awaiter(this, void 0, void 0, function () {
            var urls, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.puppeteer_browser_open()];
                    case 1:
                        _a.sent();
                        this.log('Browser opened');
                        urls = this.pathnames.map(function (pathname) {
                            return {
                                url_1: _this.url_1 + pathname,
                                url_2: _this.url_2 + pathname,
                                fileName: _this.getFileName(_this.url_1 + pathname)
                            };
                        });
                        promises = urls.map(function (compareObj) { return _this.compare(compareObj); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.puppeteer_browser_close()];
                    case 3:
                        _a.sent();
                        this.log('Browser closed');
                        return [2 /*return*/];
                }
            });
        });
    };
    return ScreenshotDiff;
}());
var localhost = 'http://site-qwik.vercel.app';
// const localhost = 'http://localhost:5173'
var production = 'https://www.builder.io';
var getLinks = function (links, result) {
    links.forEach(function (link) {
        if (link.subLinks) {
            getLinks(link.subLinks, result);
        }
        else {
            // only take the links that are in the docs
            if (link.link.indexOf('/c/docs') !== -1) {
                try {
                    var url = new url_3.URL(link.link);
                    result.push(url.pathname);
                }
                catch (e) {
                    result.push(link.link);
                }
            }
        }
    });
    return result;
};
var helper = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pathnames, config, ssDiff;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pathnames = ['/c/docs/quickstart', '/c/docs/models-intro', '/c/docs/enterprise-hub'];
                config = {
                    url_1: localhost,
                    url_2: production,
                    pathnames: pathnames,
                    debug: true
                };
                ssDiff = new ScreenshotDiff(config);
                return [4 /*yield*/, ssDiff.result()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
helper();
//# sourceMappingURL=index.js.map