﻿var LogPage = {

    onPageShow: function () {

        LogPage.startLine = 0;

        $('#logContents', this).html('');

        $(ApiClient).on("websocketmessage", LogPage.onWebSocketMessage).on("websocketopen", LogPage.onWebSocketConnectionChange).on("websocketerror", LogPage.onWebSocketConnectionChange).on("websocketclose", LogPage.onWebSocketConnectionChange);

        LogPage.startInterval();

        var autoScroll = localStorage.getItem("autoScrollLogPage");
        
        if (autoScroll == "true") {
            LogPage.updateAutoScroll(true);
        }
        else if (autoScroll == "false") {
            LogPage.updateAutoScroll(false);
        }
    },

    onPageHide: function () {

        $(ApiClient).off("websocketmessage", LogPage.onWebSocketMessage).off("websocketopen", LogPage.onWebSocketConnectionChange).off("websocketerror", LogPage.onWebSocketConnectionChange).off("websocketclose", LogPage.onWebSocketConnectionChange);

        LogPage.stopInterval();
    },

    startInterval: function () {

        if (ApiClient.isWebSocketOpen()) {
            ApiClient.sendWebSocketMessage("LogFileStart", "0,2000");
        } 
    },

    stopInterval: function () {

        if (ApiClient.isWebSocketOpen()) {
            ApiClient.sendWebSocketMessage("LogFileStop");
        }
    },

    onWebSocketConnectionChange: function () {
        LogPage.stopInterval();
        LogPage.startInterval();
    },

    onWebSocketMessage: function (e, msg) {

        if (msg.MessageType == "LogFile") {
            LogPage.appendLines(msg.Data);
        }
    },

    appendLines: function (lines) {

        if (!lines.length) {
            return;
        }

        LogPage.startLine += lines.length;

        lines = lines.join('\n') + '\n';

        var elem = $('#logContents', $.mobile.activePage).append(lines)[0];

        elem.style.height = (elem.scrollHeight) + 'px';

        if ($('#chkAutoScroll', $.mobile.activePage).checked()) {
            $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
        }
    },

    updateAutoScroll: function (value) {

        var page = $.mobile.activePage;
        
        $('#chkAutoScrollBottom', page).checked(value).checkboxradio('refresh');
        $('#chkAutoScroll', page).checked(value).checkboxradio('refresh');
        
        localStorage.setItem("autoScrollLogPage", value.toString());
    }
};

$(document).on('pageshow', "#logPage", LogPage.onPageShow).on('pagehide', "#logPage", LogPage.onPageHide);