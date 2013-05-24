﻿var LibraryBrowser = (function (window, document, $, screen, localStorage) {

    var defaultBackground = "#999;";

    return {

        getDefaultPageSize: function () {

            var saved = localStorage.getItem('pagesize');

            if (saved) {
                return parseInt(saved);
            }

            if (window.location.toString().toLowerCase().indexOf('localhost') != -1) {
                return 100;
            }
            return 20;
        },

        getPosterDetailViewHtml: function (options) {

            var items = options.items;
            var currentYear;

            if (!options.shape) {
                options.shape = options.preferBackdrop ? "backdrop" : "poster";
            }

            var primaryImageAspectRatio = options.useAverageAspectRatio ? LibraryBrowser.getAveragePrimaryImageAspectRatio(items) : null;

            var html = '';

            for (var i = 0, length = items.length; i < length; i++) {

                var item = items[i];

                if (options.timeline) {
                    var year = item.ProductionYear || "Unknown Year";

                    if (year != currentYear) {

                        html += '<h2 class="timelineHeader">' + year + '</h2>';
                        currentYear = year;
                    }
                }

                var imgUrl;
                var isDefault = false;

                var cssClass = "tileItem";

                if (options.shape) {
                    cssClass += " " + options.shape + "TileItem";
                }

                html += '<a class="' + cssClass + '" href="' + LibraryBrowser.getHref(item, options.context) + '">';

                if (options.preferBackdrop && item.BackdropImageTags && item.BackdropImageTags.length) {

                    imgUrl = LibraryBrowser.getImageUrl(item, 'Backdrop', 0, {
                        height: 198,
                        width: 352
                    });

                }
                else if (options.preferBackdrop && item.ImageTags && item.ImageTags.Thumb) {

                    imgUrl = ApiClient.getImageUrl(item.Id, {
                        type: "Thumb",
                        height: 198,
                        width: 352,
                        tag: item.ImageTags.Thumb
                    });
                }
                else if (item.ImageTags && item.ImageTags.Primary) {

                    var height = 300;
                    var width = primaryImageAspectRatio ? parseInt(height * primaryImageAspectRatio) : null;

                    imgUrl = LibraryBrowser.getImageUrl(item, 'Primary', 0, {
                        height: height,
                        width: width
                    });

                }
                else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                    imgUrl = LibraryBrowser.getImageUrl(item, 'Backdrop', 0, {
                        height: 198,
                        width: 352
                    });
                }
                else if (item.MediaType == "Audio" || item.Type == "MusicAlbum" || item.Type == "MusicArtist") {

                    imgUrl = "css/images/items/list/audio.png";
                    isDefault = true;
                }
                else if (item.MediaType == "Video" || item.Type == "Season" || item.Type == "Series") {

                    imgUrl = "css/images/items/list/video.png";
                    isDefault = true;
                }
                else if (item.Type == "Person") {

                    imgUrl = "css/images/items/list/person.png";
                    isDefault = true;
                }
                else if (item.Type == "Artist") {

                    imgUrl = "css/images/items/list/audiocollection.png";
                    isDefault = true;
                }
                else if (item.MediaType == "Game") {

                    imgUrl = "css/images/items/list/game.png";
                    isDefault = true;
                }
                else if (item.Type == "Studio" || item.Type == "Genre") {

                    if (options.context == "games") {

                        imgUrl = "css/images/items/list/game.png";
                    }
                    else if (options.context == "music") {

                        imgUrl = "css/images/items/list/audio.png";
                    }
                    else if (options.context == "movies") {

                        imgUrl = "css/images/items/list/chapter.png";
                    }
                    else {
                        imgUrl = "css/images/items/list/collection.png";
                    }
                    isDefault = true;
                }
                else {

                    imgUrl = "css/images/items/list/collection.png";
                    isDefault = true;
                }

                cssClass = isDefault ? "tileImage defaultTileImage" : "tileImage";

                html += '<div class="' + cssClass + '" style="background-image: url(\'' + imgUrl + '\');"></div>';

                html += '<div class="tileContent">';

                if (item.SeriesName || item.Album) {
                    var seriesName = item.SeriesName || item.Album;
                    html += '<div class="tileName">' + seriesName + '</div>';
                }

                var name = LibraryBrowser.getPosterViewDisplayName(item);

                html += '<div class="tileName">' + name + '</div>';

                if (item.CommunityRating) {
                    html += '<p>' + LibraryBrowser.getRatingHtml(item) + '</p>';
                }

                var childText;

                if (item.Type == "BoxSet") {

                    childText = item.ChildCount == 1 ? "1 Movie" : item.ChildCount + " Movies";

                    html += '<p class="itemMiscInfo">' + childText + '</p>';
                }
                else if (item.Type == "GamePlatform") {

                    childText = item.ChildCount == 1 ? "1 Game" : item.ChildCount + " Games";

                    html += '<p class="itemMiscInfo">' + childText + '</p>';
                }
                else if (item.Type == "MusicAlbum") {

                    childText = item.ChildCount == 1 ? "1 Song" : item.ChildCount + " Songs";

                    html += '<p class="itemMiscInfo">' + childText + '</p>';
                }
                else if (item.Type == "Genre" || item.Type == "Studio" || item.Type == "Person" || item.Type == "Artist") {

                    childText = item.ChildCount == 1 ? "1 " + options.countNameSingular : item.ChildCount + " " + options.countNamePlural;

                    html += '<p class="itemMiscInfo">' + childText + '</p>';
                }
                else if (item.Type == "Game") {

                    html += '<p class="itemMiscInfo">' + item.GameSystem + '</p>';
                }
                else {
                    html += '<p class="itemMiscInfo">' + LibraryBrowser.getMiscInfoHtml(item) + '</p>';
                }

                if (item.Type == "MusicAlbum") {

                    html += '<p class="itemMiscInfo">' + LibraryBrowser.getMiscInfoHtml(item) + '</p>';
                }

                html += '<p class="userDataIcons">' + LibraryBrowser.getUserDataIconsHtml(item) + '</p>';

                html += '</div>';

                html += LibraryBrowser.getNewIndicatorHtml(item);

                html += "</a>";
            }

            return html;
        },

        getSongTableHtml: function (items, options) {

            options = options || {};

            var html = '';

            var cssClass = "detailTable";

            html += '<div class="detailTableContainer"><table class="' + cssClass + '">';

            html += '<tr>';

            html += '<th></th>';
            html += '<th></th>';

            html += '<th>Track</th>';

            if (options.showAlbum) {
                html += '<th>Album</th>';
            }
            if (options.showArtist) {
                html += '<th>Artist</th>';
            }

            html += '<th class="tabletColumn">Duration</th>';
            html += '<th class="tabletColumn">Play Count</th>';
            html += '<th class="tabletColumn userDataCell"></th>';

            html += '</tr>';

            for (var i = 0, length = items.length; i < length; i++) {

                var item = items[i];

                html += '<tr>';

                html += '<td><button class="btnPlay" type="button" data-role="none" onclick="LibraryBrowser.showPlayMenu(this, \'' + item.Id + '\', \'Audio\');"><img src="css/images/media/playCircle.png" style="height: 20px;"></button></td>';

                var num = item.IndexNumber;

                if (num && item.ParentIndexNumber) {
                    num = item.ParentIndexNumber + "." + num;
                }
                html += '<td>' + (num || "") + '</td>';

                html += '<td><a href="' + LibraryBrowser.getHref(item, "music") + '">' + (item.Name || "") + '</a></td>';

                if (options.showAlbum) {
                    if (item.Album && item.ParentId) {
                        html += '<td><a href="itemdetails.html?id=' + item.ParentId + '">' + item.Album + '</a></td>';
                    } else {
                        html += '<td>' + (item.Album || '') + '</td>';
                    }
                }

                if (options.showArtist) {

                    if (item.Artists && item.Artists.length && item.Artists[0]) {

                        var artist = item.Artists[0];

                        html += '<td><a href="itembynamedetails.html?context=music&artist=' + ApiClient.encodeName(artist) + '">' + artist + '</a></td>';
                    } else {
                        html += '<td>' + (artist || '') + '</td>';
                    }
                }

                var time = DashboardPage.getDisplayText(item.RunTimeTicks || 0);

                html += '<td class="tabletColumn">' + time + '</td>';

                html += '<td class="tabletColumn">' + (item.UserData ? item.UserData.PlayCount : 0) + '</td>';

                html += '<td class="tabletColumn userDataCell">' + LibraryBrowser.getUserDataIconsHtml(item) + '</td>';

                html += '</tr>';
            }

            html += '</table></div>';

            return html;
        },

        showPlayMenu: function (positionTo, itemId, mediaType, resumePositionTicks) {

            var canPlay = MediaPlayer.canPlayMediaType(mediaType);

            var isPlaying = MediaPlayer.isPlaying();

            if (canPlay && !isPlaying && !resumePositionTicks) {
                MediaPlayer.playById(itemId);
                return;
            }

            $('.playFlyout').popup("close").remove();

            var html = '<div data-role="popup" class="playFlyout" style="max-width:300px;" data-corners="false" data-theme="c" data-history="false">';

            html += '<ul data-role="listview" style="min-width: 150px;" data-theme="c">';
            html += '<li data-role="list-divider" data-theme="a">Play Menu</li>';

            if (canPlay) {
                html += '<li><a href="#" onclick="MediaPlayer.playById(\'' + itemId + '\');LibraryBrowser.closePlayMenu();">Play</a></li>';

                if (resumePositionTicks) {
                    html += '<li><a href="#" onclick="MediaPlayer.playById(\'' + itemId + '\', ' + resumePositionTicks + ');LibraryBrowser.closePlayMenu();">Resume</a></li>';
                }

                if (isPlaying && MediaPlayer.canQueue(mediaType)) {
                    html += '<li><a href="#" onclick="MediaPlayer.playNext(\'' + itemId + '\');LibraryBrowser.closePlayMenu();">Play Next</a></li>';
                    html += '<li><a href="#" onclick="MediaPlayer.playLast(\'' + itemId + '\');LibraryBrowser.closePlayMenu();">Play Last</a></li>';
                }
            }

            html += '</ul>';

            html += '</div>';

            $($.mobile.activePage).append(html);

            $('.playFlyout').popup({ positionTo: positionTo || "window" }).trigger('create').popup("open").on("popupafterclose", function () {

                $(this).off("popupafterclose").remove();

            }).parents(".ui-popup-container").css("margin-left", 100).css("margin-top", 35);
        },

        closePlayMenu: function () {
            $('.playFlyout').popup("close").remove();
        },

        getHref: function (item, itemByNameContext) {

            if (item.url) {
                return item.url;
            }

            itemByNameContext = itemByNameContext || "";

            // Handle search hints
            var id = item.Id || item.ItemId;

            if (item.Type == "Series") {
                return "itemdetails.html?id=" + id;
            }
            if (item.Type == "Season") {
                return "itemdetails.html?id=" + id;
            }
            if (item.Type == "BoxSet") {
                return "itemdetails.html?id=" + id;
            }
            if (item.Type == "MusicAlbum") {
                return "itemdetails.html?id=" + id;
            }
            if (item.Type == "GamePlatform") {
                return "itemdetails.html?id=" + id;
            }
            if (item.Type == "Genre") {
                return "itembynamedetails.html?genre=" + ApiClient.encodeName(item.Name) + "&context=" + itemByNameContext;
            }
            if (item.Type == "Studio") {
                return "itembynamedetails.html?studio=" + ApiClient.encodeName(item.Name) + "&context=" + itemByNameContext;
            }
            if (item.Type == "Person") {
                return "itembynamedetails.html?person=" + ApiClient.encodeName(item.Name) + "&context=" + itemByNameContext;
            }
            if (item.Type == "Artist") {
                return "itembynamedetails.html?artist=" + ApiClient.encodeName(item.Name) + "&context=" + (itemByNameContext || "music");
            }

            return item.IsFolder ? (id ? "itemList.html?parentId=" + id : "#") : "itemdetails.html?id=" + id;

        },

        getImageUrl: function (item, type, index, options) {

            options = options || {};
            options.type = type;
            options.index = index;

            if (type == 'Backdrop') {
                options.tag = item.BackdropImageTags[index];
            }
            else if (type == 'Screenshot') {
                options.tag = item.ScreenshotImageTags[index];
            }
            else if (type == 'Primary') {
                options.tag = item.PrimaryImageTag || item.ImageTags[type];
            }
            else {
                options.tag = item.ImageTags[type];
            }

            if (item.Type == "Studio") {

                return ApiClient.getStudioImageUrl(item.Name, options);
            }
            if (item.Type == "Person") {

                return ApiClient.getPersonImageUrl(item.Name, options);
            }
            if (item.Type == "Genre") {

                return ApiClient.getGenreImageUrl(item.Name, options);
            }
            if (item.Type == "Artist") {

                return ApiClient.getArtistImageUrl(item.Name, options);
            }

            // For search hints
            return ApiClient.getImageUrl(item.Id || item.ItemId, options);

        },

        getPosterViewHtml: function (options) {

            var items = options.items;

            options.shape = options.shape || "portrait";

            var primaryImageAspectRatio = options.useAverageAspectRatio ? LibraryBrowser.getAveragePrimaryImageAspectRatio(items) : null;

            var html = "";

            for (var i = 0, length = items.length; i < length; i++) {

                var item = items[i];

                var imgUrl = null;
                var background;

                if (options.preferBackdrop && item.BackdropImageTags && item.BackdropImageTags.length) {

                    imgUrl = ApiClient.getImageUrl(item.Id, {
                        type: "Backdrop",
                        height: 198,
                        width: 352,
                        tag: item.BackdropImageTags[0]
                    });

                } else if (item.ImageTags && item.ImageTags.Primary) {

                    var height = 300;
                    var width = primaryImageAspectRatio ? parseInt(height * primaryImageAspectRatio) : null;

                    imgUrl = ApiClient.getImageUrl(item.Id, {
                        type: "Primary",
                        height: height,
                        width: width,
                        tag: item.ImageTags.Primary
                    });

                } else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                    imgUrl = ApiClient.getImageUrl(item.Id, {
                        type: "Backdrop",
                        height: 198,
                        width: 352,
                        tag: item.BackdropImageTags[0]
                    });

                }
                else if (item.MediaType == "Audio" || item.Type == "MusicAlbum" || item.Type == "MusicArtist") {

                    if (item.Name && options.showTitle) {
                        imgUrl = 'css/images/items/list/audio.png';
                        background = defaultBackground;
                    } else {
                        background = '#555';
                    }
                }
                else if (item.MediaType == "Video" || item.Type == "Season" || item.Type == "Series") {

                    if (item.Name && options.showTitle) {
                        imgUrl = 'css/images/items/list/video.png';
                        background = defaultBackground;
                    } else {
                        background = '#555';
                    }
                }
                else {
                    if (item.Name && options.showTitle) {
                        imgUrl = 'css/images/items/list/collection.png';
                        background = LibraryBrowser.getMetroColor(item.Id);
                    } else {
                        background = '#555';
                    }
                }


                var cssClass = "posterItem";

                if (options.transparent !== false) {
                    cssClass += " transparentPosterItem";
                }

                cssClass += ' ' + options.shape + 'PosterItem';

                html += '<a class="' + cssClass + '" href="' + LibraryBrowser.getHref(item, options.context) + '">';

                var style = "";

                if (imgUrl) {
                    style += 'background-image:url(\'' + imgUrl + '\');';
                }

                if (background) {
                    style += "background-color:" + background + ";";
                }

                html += '<div class="posterItemImage" style="' + style + '"></div>';

                var name = LibraryBrowser.getPosterViewDisplayName(item);

                if (!imgUrl && !options.showTitle) {
                    html += "<div class='posterItemDefaultText'>";
                    html += name;
                    html += "</div>";
                }

                var cssclass = options.centerText ? "posterItemText posterItemTextCentered" : "posterItemText";

                if (options.showParentTitle) {

                    html += "<div class='" + cssclass + "'>";
                    html += item.SeriesName || item.Album || "&nbsp;";
                    html += "</div>";
                }

                if (options.showTitle) {

                    html += "<div class='" + cssclass + "'>";
                    html += name;
                    html += "</div>";
                }

                if (options.showProgressBar) {

                    html += "<div class='posterItemText posterItemProgress'>";
                    html += LibraryBrowser.getItemProgressBarHtml(item) || "&nbsp;";
                    html += "</div>";
                }

                if (options.showNewIndicator !== false) {
                    html += LibraryBrowser.getNewIndicatorHtml(item);
                }

                html += "</a>";

            }

            return html;
        },
        
        getPosterViewDisplayName: function(item) {
            
            var name = item.Name;

            if (item.Type == "Episode" && item.IndexNumber != null && item.ParentIndexNumber != null) {

                var displayIndexNumber = item.IndexNumber < 10 ? "0" + item.IndexNumber : item.IndexNumber;

                var number = item.ParentIndexNumber + "x" + displayIndexNumber;

                if (item.IndexNumberEnd) {

                    displayIndexNumber = item.IndexNumberEnd < 10 ? "0" + item.IndexNumberEnd : item.IndexNumberEnd;
                    number += "-x" + displayIndexNumber;
                }

                name = number + " - " + name;

            } else {
                if (item.IndexNumber != null && item.Type !== "Season") {
                    name = item.IndexNumber + " - " + name;
                }
                if (item.ParentIndexNumber != null && item.Type != "Episode") {
                    name = item.ParentIndexNumber + "." + name;
                }
            }

            return name;
        },

        getNewIndicatorHtml: function (item) {

            if (item.RecentlyAddedItemCount) {
                return '<div class="posterRibbon">' + item.RecentlyAddedItemCount + ' New</div>';
            }

            if (!item.IsFolder && item.Type !== "Genre" && item.Type !== "Studio" && item.Type !== "Person" && item.Type !== "Artist") {

                var date = item.DateCreated;

                try {
                    if (date && (new Date().getTime() - parseISO8601Date(date).getTime()) < 604800000) {
                        return "<div class='posterRibbon'>New</div>";
                    }
                } catch (err) {

                }
            }

            return '';
        },

        getAveragePrimaryImageAspectRatio: function (items) {

            var values = [];

            for (var i = 0, length = items.length; i < length; i++) {

                var ratio = items[i].PrimaryImageAspectRatio || 0;

                if (!ratio) {
                    continue;
                }

                values[values.length] = ratio;
            }

            if (!values.length) {
                return null;
            }

            // Use the median
            values.sort(function (a, b) { return a - b; });

            var half = Math.floor(values.length / 2);

            if (values.length % 2)
                return values[half];
            else
                return (values[half - 1] + values[half]) / 2.0;
        },

        metroColors: ["#6FBD45", "#4BB3DD", "#4164A5", "#E12026", "#800080", "#E1B222", "#008040", "#0094FF", "#FF00C7", "#FF870F", "#7F0037"],

        getRandomMetroColor: function () {

            var index = Math.floor(Math.random() * (LibraryBrowser.metroColors.length - 1));

            return LibraryBrowser.metroColors[index];
        },

        getMetroColor: function (str) {

            if (str) {
                var character = String(str.substr(0, 1).charCodeAt());
                var sum = 0;
                for (var i = 0; i < character.length; i++) {
                    sum += parseInt(character.charAt(i));
                }
                var index = String(sum).substr(-1);

                return LibraryBrowser.metroColors[index];
            } else {
                return LibraryBrowser.getRandomMetroColor();
            }

        },

        renderName: function (item, nameElem, linkToElement) {

            Dashboard.setPageTitle(LibraryBrowser.getPosterViewDisplayName(item));

            if (linkToElement) {
                nameElem.html('<a class="detailPageParentLink" href="' + LibraryBrowser.getHref(item) + '">' + name + '</a>').trigger('create');
            } else {
                nameElem.html(name);
            }
        },

        renderParentName: function (item, parentNameElem) {

            var html = [];

            if (item.AlbumArtist && item.Type == "Audio") {
                html.push('<a class="detailPageParentLink" href="itembynamedetails.html?context=music&artist=' + ApiClient.encodeName(item.AlbumArtist) + '">' + item.AlbumArtist + '</a>');
            }
            else if (item.AlbumArtist && item.Type == "MusicAlbum") {
                html.push('<a class="detailPageParentLink" href="itembynamedetails.html?context=music&artist=' + ApiClient.encodeName(item.AlbumArtist) + '">' + item.AlbumArtist + '</a>');
            }
            else if (item.SeriesName && item.Type == "Episode") {

                html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + item.SeriesId + '">' + item.SeriesName + '</a>');
            }

            if (item.SeriesName && item.Type == "Season") {

                html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + item.SeriesId + '">' + item.SeriesName + '</a>');
            }
            else if (item.ParentIndexNumber && item.Type == "Episode") {

                html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + item.ParentId + '">Season ' + item.ParentIndexNumber + '</a>');
            }
            else if (item.Album && item.Type == "Audio" && item.ParentId) {
                html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + item.ParentId + '">' + item.Album + '</a>');

            }
            else if (item.AlbumArtist && item.Type == "MusicAlbum") {

            }
            else if (item.Album) {
                html.push(item.Album);

            }

            if (html.length) {
                parentNameElem.show().html(html.join(' - ')).trigger('create');
            } else {
                parentNameElem.hide();
            }
        },

        renderLinks: function (linksElem, item) {

            var links = [];

            if (item.HomePageUrl) {
                links.push('<a class="textlink" href="' + item.HomePageUrl + '" target="_blank">Website</a>');
            }

            var providerIds = item.ProviderIds || {};

            if (providerIds.Imdb) {
                if (item.Type == "Movie" || item.Type == "Episode" || item.Type == "Trailer")
                    links.push('<a class="textlink" href="http://www.imdb.com/title/' + providerIds.Imdb + '" target="_blank">IMDb</a>');
                else if (item.Type == "Person")
                    links.push('<a class="textlink" href="http://www.imdb.com/name/' + providerIds.Imdb + '" target="_blank">IMDb</a>');
            }
            if (providerIds.Tmdb) {
                if (item.Type == "Movie" || item.Type == "Trailer")
                    links.push('<a class="textlink" href="http://www.themoviedb.org/movie/' + providerIds.Tmdb + '" target="_blank">TheMovieDB</a>');
                else if (item.Type == "BoxSet")
                    links.push('<a class="textlink" href="http://www.themoviedb.org/collection/' + providerIds.Tmdb + '" target="_blank">TheMovieDB</a>');
                else if (item.Type == "Person")
                    links.push('<a class="textlink" href="http://www.themoviedb.org/person/' + providerIds.Tmdb + '" target="_blank">TheMovieDB</a>');
            }
            if (providerIds.Tvdb)
                links.push('<a class="textlink" href="http://thetvdb.com/index.php?tab=series&id=' + providerIds.Tvdb + '" target="_blank">TheTVDB</a>');
            if (providerIds.Tvcom) {
                if (item.Type == "Episode")
                    links.push('<a class="textlink" href="http://www.tv.com/shows/' + providerIds.Tvcom + '" target="_blank">TV.com</a>');
                else if (item.Type == "Person")
                    links.push('<a class="textlink" href="http://www.tv.com/people/' + providerIds.Tvcom + '" target="_blank">TV.com</a>');
            }
            if (providerIds.Musicbrainz) {

                if (item.Type == "MusicArtist" || item.Type == "Artist") {
                    links.push('<a class="textlink" href="http://musicbrainz.org/artist/' + providerIds.Musicbrainz + '" target="_blank">MusicBrainz</a>');
                } else {
                    links.push('<a class="textlink" href="http://musicbrainz.org/release/' + providerIds.Musicbrainz + '" target="_blank">MusicBrainz</a>');
                }

            }
            if (providerIds.Gamesdb)
                links.push('<a class="textlink" href="http://www.games-db.com/Game/' + providerIds.Gamesdb + '" target="_blank">GamesDB</a>');


            if (links.length) {

                var html = 'Links:&nbsp;&nbsp;' + links.join('&nbsp;&nbsp;/&nbsp;&nbsp;');

                $(linksElem).html(html).trigger('create');

            } else {
                $(linksElem).hide();
            }
        },

        getPagingHtml: function (query, totalRecordCount) {

            if (query.Limit) {
                localStorage.setItem('pagesize', query.Limit);
            }

            var html = '';

            var pageCount = Math.ceil(totalRecordCount / query.Limit);
            var pageNumber = (query.StartIndex / query.Limit) + 1;

            var dropdownHtml = '<select class="selectPage" data-enhance="false" data-role="none">';
            for (var i = 1; i <= pageCount; i++) {

                if (i == pageNumber) {
                    dropdownHtml += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else {
                    dropdownHtml += '<option value="' + i + '">' + i + '</option>';
                }
            }
            dropdownHtml += '</select>';

            var recordsEnd = Math.min(query.StartIndex + query.Limit, totalRecordCount);

            // 20 is the minimum page size
            var showControls = totalRecordCount > 20;

            html += '<div class="listPaging">';

            html += '<span style="margin-right: 10px;">';

            var startAtDisplay = totalRecordCount ? query.StartIndex + 1 : 0;
            html += startAtDisplay + '-' + recordsEnd + ' of ' + totalRecordCount;

            if (showControls) {
                html += ', page ' + dropdownHtml + ' of ' + pageCount;
            }

            html += '</span>';

            if (showControls) {
                html += '<button data-icon="arrow-left" data-iconpos="notext" data-inline="true" data-mini="true" class="btnPreviousPage" ' + (query.StartIndex ? '' : 'disabled') + '>Previous Page</button>';

                html += '<button data-icon="arrow-right" data-iconpos="notext" data-inline="true" data-mini="true" class="btnNextPage" ' + (query.StartIndex + query.Limit > totalRecordCount ? 'disabled' : '') + '>Next Page</button>';

                var id = "selectPageSize" + new Date().getTime();

                var options = '';

                function getOption(val) {

                    if (query.Limit == val) {

                        return '<option value="' + val + '" selected="selected">' + val + '</option>';

                    } else {
                        return '<option value="' + val + '">' + val + '</option>';
                    }
                }

                options += getOption(20);
                options += getOption(50);
                options += getOption(100);
                options += getOption(200);
                options += getOption(300);

                html += '<label class="labelPageSize" for="' + id + '">Limit: </label><select class="selectPageSize" id="' + id + '" data-enhance="false" data-role="none">' + options + '</select>';
            }

            html += '</div>';

            return html;
        },

        getRatingHtml: function (item) {

            var html = "";

            if (item.CommunityRating) {
                var rating = item.CommunityRating / 2;

                for (var i = 1; i <= 5; i++) {
                    if (rating < i - 1) {
                        html += "<div class='starRating emptyStarRating' title='" + item.CommunityRating + "'></div>";
                    }
                    else if (rating < i) {
                        html += "<div class='starRating halfStarRating' title='" + item.CommunityRating + "'></div>";
                    }
                    else {
                        html += "<div class='starRating' title='" + item.CommunityRating + "'></div>";
                    }
                }
            }

            if ((item.Type == "Movie" || item.Type == "Trailer") && item.CriticRating != null) {

                if (item.CriticRating >= 60) {
                    html += '<div class="fresh rottentomatoesicon" title="fresh"></div>';
                } else {
                    html += '<div class="rotten rottentomatoesicon" title="rotten"></div>';
                }

                html += '<div class="criticRating">' + item.CriticRating + '%</div>';
            }

            return html;
        },

        getItemProgressBarHtml: function (item) {

            var html = '';

            var tooltip;
            var pct;

            if (item.PlayedPercentage) {

                tooltip = item.PlayedPercentage.toFixed(1).toString().replace(".0", '') + '% ';

                if (item.Type == "Series" || item.Type == "Season" || item.Type == "BoxSet") {
                    tooltip += "watched";
                } else {
                    tooltip += "played";
                }

                pct = item.PlayedPercentage;
            }
            else if (item.UserData && item.UserData.PlaybackPositionTicks && item.RunTimeTicks) {

                tooltip = DashboardPage.getDisplayText(item.UserData.PlaybackPositionTicks) + " / " + DashboardPage.getDisplayText(item.RunTimeTicks);

                pct = (item.UserData.PlaybackPositionTicks / item.RunTimeTicks) * 100;
            }

            if (pct && pct < 100) {

                html += '<progress title="' + tooltip + '" class="itemProgressBar" min="0" max="100" value="' + pct + '">';
                html += '</progress>';

                html += '<span class="itemProgressText">' + tooltip + '</span>';
            }

            return html;
        },

        getUserDataIconsHtml: function (item) {

            var html = '';

            if (item.Type != "Audio") {
                html += LibraryBrowser.getItemProgressBarHtml(item);
            }

            var userData = item.UserData || {};

            var itemId = item.Id;
            var type = item.Type;

            if (type == "Person") {
                itemId = item.Name;
            }
            else if (type == "Studio") {
                itemId = item.Name;
            }
            else if (type == "Genre") {
                itemId = item.Name;
            }
            else if (type == "Artist") {
                itemId = item.Name;
            }

            if (item.MediaType || item.IsFolder) {
                if (userData.Played) {
                    html += '<img data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgPlayed" src="css/images/userdata/played.png" alt="Played" title="Played" onclick="LibraryBrowser.markPlayed(this);return false;" />';
                } else {
                    html += '<img data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgPlayedOff" src="css/images/userdata/unplayed.png" alt="Played" title="Played" onclick="LibraryBrowser.markPlayed(this);return false;" />';
                }
            }

            if (typeof userData.Likes == "undefined") {
                html += '<img onclick="LibraryBrowser.markDislike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgDislikeOff" src="css/images/userdata/thumbs_down_off.png" alt="Dislike" title="Dislike" />';
                html += '<img onclick="LibraryBrowser.markLike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgLikeOff" src="css/images/userdata/thumbs_up_off.png" alt="Like" title="Like" />';
            }
            else if (userData.Likes) {
                html += '<img onclick="LibraryBrowser.markDislike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgDislikeOff" src="css/images/userdata/thumbs_down_off.png" alt="Dislike" title="Dislike" />';
                html += '<img onclick="LibraryBrowser.markLike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgLike" src="css/images/userdata/thumbs_up_on.png" alt="Like" title="Like" />';
            }
            else {
                html += '<img onclick="LibraryBrowser.markDislike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgDislike" src="css/images/userdata/thumbs_down_on.png" alt="Dislike" title="Dislike" />';
                html += '<img onclick="LibraryBrowser.markLike(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgLikeOff" src="css/images/userdata/thumbs_up_off.png" alt="Like" title="Like" />';
            }

            if (userData.IsFavorite) {
                html += '<img onclick="LibraryBrowser.markFavorite(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgFavorite" src="css/images/userdata/heart_on.png" alt="Favorite" title="Favorite" />';
            } else {
                html += '<img onclick="LibraryBrowser.markFavorite(this);return false;" data-type="' + type + '" data-itemid="' + itemId + '" class="imgUserItemRating imgFavoriteOff" src="css/images/userdata/heart_off.png" alt="Favorite" title="Favorite" />';
            }

            return html;
        },

        markPlayed: function (link) {

            var id = link.getAttribute('data-itemid');

            var $link = $(link);

            var markAsPlayed = $link.hasClass('imgPlayedOff');

            ApiClient.updatePlayedStatus(Dashboard.getCurrentUserId(), id, markAsPlayed);

            if (markAsPlayed) {
                link.src = "css/images/userdata/played.png";
                $link.addClass('imgPlayed').removeClass('imgPlayedOff');
            } else {
                link.src = "css/images/userdata/unplayed.png";
                $link.addClass('imgPlayedOff').removeClass('imgPlayed');
            }
        },

        markFavorite: function (link) {

            var id = link.getAttribute('data-itemid');
            var type = link.getAttribute('data-type');

            var $link = $(link);

            var markAsFavorite = $link.hasClass('imgFavoriteOff');

            if (type == "Person") {
                ApiClient.updateFavoritePersonStatus(Dashboard.getCurrentUserId(), id, markAsFavorite);
            }
            else if (type == "Studio") {
                ApiClient.updateFavoriteStudioStatus(Dashboard.getCurrentUserId(), id, markAsFavorite);
            }
            else if (type == "Artist") {
                ApiClient.updateFavoriteArtistStatus(Dashboard.getCurrentUserId(), id, markAsFavorite);
            }
            else if (type == "Genre") {
                ApiClient.updateFavoriteGenreStatus(Dashboard.getCurrentUserId(), id, markAsFavorite);
            }
            else {
                ApiClient.updateFavoriteStatus(Dashboard.getCurrentUserId(), id, markAsFavorite);
            }

            if (markAsFavorite) {
                link.src = "css/images/userdata/heart_on.png";
                $link.addClass('imgFavorite').removeClass('imgFavoriteOff');
            } else {
                link.src = "css/images/userdata/heart_off.png";
                $link.addClass('imgFavoriteOff').removeClass('imgFavorite');
            }
        },

        markLike: function (link) {

            var id = link.getAttribute('data-itemid');
            var type = link.getAttribute('data-type');

            var $link = $(link);

            if ($link.hasClass('imgLikeOff')) {

                LibraryBrowser.updateUserItemRating(type, id, true);

                link.src = "css/images/userdata/thumbs_up_on.png";
                $link.addClass('imgLike').removeClass('imgLikeOff');

            } else {

                LibraryBrowser.clearUserItemRating(type, id);

                link.src = "css/images/userdata/thumbs_up_off.png";
                $link.addClass('imgLikeOff').removeClass('imgLike');
            }

            $link.prev().removeClass('imgDislike').addClass('imgDislikeOff').each(function () {
                this.src = "css/images/userdata/thumbs_down_off.png";
            });
        },

        markDislike: function (link) {

            var id = link.getAttribute('data-itemid');
            var type = link.getAttribute('data-type');

            var $link = $(link);

            if ($link.hasClass('imgDislikeOff')) {

                LibraryBrowser.updateUserItemRating(type, id, false);

                link.src = "css/images/userdata/thumbs_down_on.png";
                $link.addClass('imgDislike').removeClass('imgDislikeOff');

            } else {

                LibraryBrowser.clearUserItemRating(type, id);

                link.src = "css/images/userdata/thumbs_down_off.png";
                $link.addClass('imgDislikeOff').removeClass('imgDislike');
            }

            $link.next().removeClass('imgLike').addClass('imgLikeOff').each(function () {
                this.src = "css/images/userdata/thumbs_up_off.png";
            });
        },

        updateUserItemRating: function (type, id, likes) {

            if (type == "Person") {
                ApiClient.updatePersonRating(Dashboard.getCurrentUserId(), id, likes);
            }
            else if (type == "Studio") {
                ApiClient.updateStudioRating(Dashboard.getCurrentUserId(), id, likes);
            }
            else if (type == "Artist") {
                ApiClient.updateArtistRating(Dashboard.getCurrentUserId(), id, likes);
            }
            else if (type == "Genre") {
                ApiClient.updateGenreRating(Dashboard.getCurrentUserId(), id, likes);
            }
            else {
                ApiClient.updateUserItemRating(Dashboard.getCurrentUserId(), id, likes);
            }
        },

        clearUserItemRating: function (type, id) {

            if (type == "Person") {
                ApiClient.clearPersonRating(Dashboard.getCurrentUserId(), id);
            }
            else if (type == "Studio") {
                ApiClient.clearStudioRating(Dashboard.getCurrentUserId(), id);
            }
            else if (type == "Artist") {
                ApiClient.clearArtistRating(Dashboard.getCurrentUserId(), id);
            }
            else if (type == "Genre") {
                ApiClient.clearGenreRating(Dashboard.getCurrentUserId(), id);
            }
            else {
                ApiClient.clearUserItemRating(Dashboard.getCurrentUserId(), id);
            }
        },

        getDetailImageHtml: function (item) {

            var imageTags = item.ImageTags || {};

            var html = '';

            var url;

            if (imageTags.Primary) {

                if (item.Type == "Person") {
                    url = ApiClient.getPersonImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Primary,
                        type: "Primary"
                    });
                }
                else if (item.Type == "Genre") {
                    url = ApiClient.getGenreImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Primary,
                        type: "Primary"
                    });
                }
                else if (item.Type == "Studio") {
                    url = ApiClient.getStudioImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Primary,
                        type: "Primary"
                    });
                }
                else if (item.Type == "Artist") {
                    url = ApiClient.getArtistImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Primary,
                        type: "Primary"
                    });
                }
                else {
                    url = ApiClient.getImageUrl(item.Id, {
                        type: "Primary",
                        maxheight: 480,
                        tag: item.ImageTags.Primary
                    });
                }
            }
            else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                if (item.Type == "Person") {
                    url = ApiClient.getPersonImageUrl(item.Name, {
                        maxheight: 480,
                        tag: item.BackdropImageTags[0],
                        type: "Backdrop"
                    });
                }
                else if (item.Type == "Genre") {
                    url = ApiClient.getGenreImageUrl(item.Name, {
                        maxheight: 480,
                        tag: item.BackdropImageTags[0],
                        type: "Backdrop"
                    });
                }
                else if (item.Type == "Studio") {
                    url = ApiClient.getStudioImageUrl(item.Name, {
                        maxheight: 480,
                        tag: item.BackdropImageTags[0],
                        type: "Backdrop"
                    });
                }
                else if (item.Type == "Artist") {
                    url = ApiClient.getArtistImageUrl(item.Name, {
                        maxheight: 480,
                        tag: item.BackdropImageTags[0],
                        type: "Backdrop"
                    });
                }
                else {
                    url = ApiClient.getImageUrl(item.Id, {
                        type: "Backdrop",
                        maxheight: 480,
                        tag: item.BackdropImageTags[0]
                    });
                }
            }
            else if (imageTags.Thumb) {

                if (item.Type == "Person") {
                    url = ApiClient.getPersonImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Thumb,
                        type: "Thumb"
                    });
                }
                else if (item.Type == "Genre") {
                    url = ApiClient.getGenreImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Thumb,
                        type: "Thumb"
                    });
                }
                else if (item.Type == "Studio") {
                    url = ApiClient.getStudioImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Thumb,
                        type: "Thumb"
                    });
                }
                else if (item.Type == "Artist") {
                    url = ApiClient.getArtistImageUrl(item.Name, {
                        maxheight: 480,
                        tag: imageTags.Thumb,
                        type: "Thumb"
                    });
                }
                else {
                    url = ApiClient.getImageUrl(item.Id, {
                        type: "Thumb",
                        maxheight: 480,
                        tag: item.ImageTags.Thumb
                    });
                }
            }
            else if (imageTags.Disc) {

                url = ApiClient.getImageUrl(item.Id, {
                    type: "Disc",
                    maxheight: 480,
                    tag: item.ImageTags.Disc
                });
            }
            else if (item.MediaType == "Audio" || item.Type == "MusicAlbum") {
                url = "css/images/items/detail/audio.png";
            }
            else if (item.MediaType == "Game") {
                url = "css/images/items/detail/game.png";
            }
            else if (item.Type == "Person") {
                url = "css/images/items/detail/person.png";
            }
            else if (item.Type == "Genre" || item.Type == "Studio") {
                url = "css/images/items/detail/video.png";
            }
            else {
                url = "css/images/items/detail/video.png";
            }

            if (url) {

                html += "<img class='itemDetailImage' src='" + url + "' />";
            }

            return html;
        },

        getMiscInfoHtml: function (item) {

            var miscInfo = [];
            var text;

            if (item.Type == "Episode") {

                if (item.PremiereDate) {

                    try {
                        var date = parseISO8601Date(item.PremiereDate, { toLocal: true });

                        text = date.toLocaleDateString();
                        miscInfo.push(text);
                    }
                    catch (e) {
                        console.log("Error parsing date: " + item.PremiereDate);
                    }
                }
            }

            if (item.ProductionYear && item.Type == "Series") {

                if (item.Status == "Continuing") {
                    miscInfo.push(item.ProductionYear + "-Present");

                } else if (item.ProductionYear) {

                    text = item.ProductionYear;

                    if (item.EndDate) {

                        try {
                            text += "-" + parseISO8601Date(item.EndDate, { toLocal: true }).getFullYear();
                        }
                        catch (e) {
                            console.log("Error parsing date: " + item.EndDate);
                        }
                    }

                    miscInfo.push(text);
                }
            }

            if (item.Type != "Series" && item.Type != "Episode") {

                if (item.ProductionYear) {

                    miscInfo.push(item.ProductionYear);
                }
                else if (item.PremiereDate) {

                    try {
                        text = "-" + parseISO8601Date(item.PremiereDate, { toLocal: true }).getFullYear();
                        miscInfo.push(text);
                    }
                    catch (e) {
                        console.log("Error parsing date: " + item.PremiereDate);
                    }
                }
            }

            if (item.RunTimeTicks) {

                if (item.Type == "Audio") {

                    miscInfo.push(DashboardPage.getDisplayText(item.RunTimeTicks));
                } else {
                    var minutes = item.RunTimeTicks / 600000000;

                    minutes = minutes || 1;

                    miscInfo.push(parseInt(minutes) + "min");
                }
            }

            if (item.OfficialRating) {
                miscInfo.push(item.OfficialRating);
            }

            if (item.MediaType && item.DisplayMediaType && item.DisplayMediaType != item.Type) {
                miscInfo.push(item.DisplayMediaType);
            }

            if (item.VideoFormat && item.VideoFormat !== 'Standard') {
                miscInfo.push(item.VideoFormat);
            }

            return miscInfo.join('&nbsp;&nbsp;&nbsp;&nbsp;');
        },

        renderOverview: function (elem, item) {

            if (item.Overview || item.OverviewHtml) {
                var overview = item.OverviewHtml || item.Overview;

                elem.html(overview).show().trigger('create');

                $('a', elem).each(function () {
                    $(this).attr("target", "_blank");
                });
            } else {
                elem.hide();
            }

        },

        renderStudios: function (elem, item, context) {

            if (item.Studios && item.Studios.length) {

                var prefix = item.Studios.length > 1 ? "Studios" : "Studio";
                var html = prefix + ':&nbsp;&nbsp;';

                for (var i = 0, length = item.Studios.length; i < length; i++) {

                    if (i > 0) {
                        html += '&nbsp;&nbsp;/&nbsp;&nbsp;';
                    }

                    html += '<a class="textlink" href="itembynamedetails.html?context=' + context + '&studio=' + ApiClient.encodeName(item.Studios[i].Name) + '">' + item.Studios[i].Name + '</a>';
                }

                elem.show().html(html).trigger('create');


            } else {
                elem.hide();
            }
        },

        renderGenres: function (elem, item, context) {

            if (item.Genres && item.Genres.length) {

                var prefix = item.Genres.length > 1 ? "Genres" : "Genre";
                var html = prefix + ':&nbsp;&nbsp;';

                for (var i = 0, length = item.Genres.length; i < length; i++) {

                    if (i > 0) {
                        html += '&nbsp;&nbsp;/&nbsp;&nbsp;';
                    }

                    html += '<a class="textlink" href="itembynamedetails.html?context=' + context + '&genre=' + ApiClient.encodeName(item.Genres[i]) + '">' + item.Genres[i] + '</a>';
                }

                elem.show().html(html).trigger('create');


            } else {
                elem.hide();
            }
        },

        renderPremiereDate: function (elem, item) {
            if (item.PremiereDate) {
                try {

                    var date = parseISO8601Date(item.PremiereDate, { toLocal: true });

                    var text = new Date().getTime() > date.getTime() ? "Premiered" : "Premieres";

                    elem.show().html(text + '&nbsp;&nbsp;' + date.toLocaleDateString());
                } catch (err) {
                    elem.hide();
                }
            } else {
                elem.hide();
            }
        },

        renderBudget: function (elem, item) {
            if (item.Budget) {
                elem.show().html('Budget:&nbsp;&nbsp;$<span class="autoNumeric" data-a-pad="false">' + item.Budget + '</span>');
            } else {
                elem.hide();
            }
        },

        renderRevenue: function (elem, item) {
            if (item.Revenue) {
                elem.show().html('Revenue:&nbsp;&nbsp;$<span class="autoNumeric" data-a-pad="false">' + item.Revenue + '</span>');
            } else {
                elem.hide();
            }
        },

        renderDetailPageBackdrop: function (page, item) {

            var screenWidth = Math.max(screen.height, screen.width);

            var imgUrl;

            if (item.BackdropImageTags && item.BackdropImageTags.length) {

                imgUrl = LibraryBrowser.getImageUrl(item, 'Backdrop', 0, {
                    maxwidth: screenWidth
                });

                $('#itemBackdrop', page).removeClass('noBackdrop').css('background-image', 'url("' + imgUrl + '")');

            }
            else if (item.ParentBackdropItemId && item.ParentBackdropImageTags && item.ParentBackdropImageTags.length) {

                imgUrl = ApiClient.getImageUrl(item.ParentBackdropItemId, {
                    type: 'Backdrop',
                    index: 0,
                    tag: item.ParentBackdropImageTags[0],
                    maxwidth: screenWidth
                });

                $('#itemBackdrop', page).removeClass('noBackdrop').css('background-image', 'url("' + imgUrl + '")');

            }
            else {

                $('#itemBackdrop', page).addClass('noBackdrop').css('background-image', 'none');
            }
        },

        shouldDisplayGallery: function (item) {

            var imageTags = item.ImageTags || {};

            if (imageTags.Banner) {

                return true;
            }

            if (imageTags.Logo) {

                return true;
            }
            if (imageTags.Thumb) {

                return true;
            }
            if (imageTags.Art) {

                return true;

            }
            if (imageTags.Menu) {

                return true;

            }
            if (imageTags.Disc) {

                return true;
            }
            if (imageTags.Box) {

                return true;
            }
            if (imageTags.BoxRear) {

                return true;
            }

            if (item.BackdropImageTags && item.BackdropImageTags.length) {
                return true;

            }

            if (item.ScreenshotImageTags && item.ScreenshotImageTags.length) {
                return true;
            }

            return false;
        },

        getGalleryHtml: function (item) {

            var html = '';
            var i, length;

            var imageTags = item.ImageTags || {};

            if (imageTags.Banner) {

                html += LibraryBrowser.createGalleryImage(item, "Banner", imageTags.Banner);
            }

            if (imageTags.Logo) {

                html += LibraryBrowser.createGalleryImage(item, "Logo", imageTags.Logo);
            }
            if (imageTags.Thumb) {

                html += LibraryBrowser.createGalleryImage(item, "Thumb", imageTags.Thumb);
            }
            if (imageTags.Art) {

                html += LibraryBrowser.createGalleryImage(item, "Art", imageTags.Art);

            }
            if (imageTags.Menu) {

                html += LibraryBrowser.createGalleryImage(item, "Menu", imageTags.Menu);

            }
            if (imageTags.Box) {

                html += LibraryBrowser.createGalleryImage(item, "Box", imageTags.Box);
            }
            if (imageTags.BoxRear) {

                html += LibraryBrowser.createGalleryImage(item, "BoxRear", imageTags.BoxRear);
            }

            if (item.BackdropImageTags) {

                for (i = 0, length = item.BackdropImageTags.length; i < length; i++) {
                    html += LibraryBrowser.createGalleryImage(item, "Backdrop", item.BackdropImageTags[i], i);
                }

            }

            if (item.ScreenshotImageTags) {

                for (i = 0, length = item.ScreenshotImageTags.length; i < length; i++) {
                    html += LibraryBrowser.createGalleryImage(item, "Screenshot", item.ScreenshotImageTags[i], i);
                }
            }
            if (imageTags.Disc) {

                html += LibraryBrowser.createGalleryImage(item, "Disc", imageTags.Disc);
            }

            return html;
        },

        createGalleryImage: function (item, type, tag, index) {

            var screenWidth = Math.max(screen.height, screen.width);
            screenWidth = Math.min(screenWidth, 1280);

            var html = '';

            if (typeof (index) == "undefined") index = 0;

            html += '<div class="galleryImageContainer">';
            html += '<a href="#pop_' + index + '_' + tag + '" data-transition="fade" data-rel="popup" data-position-to="window">';
            html += '<img class="galleryImage" src="' + LibraryBrowser.getImageUrl(item, type, index, {
                maxwidth: screenWidth,
                tag: tag
            }) + '" />';
            html += '</div>';

            html += '<div class="galleryPopup" id="pop_' + index + '_' + tag + '" data-role="popup" data-theme="d" data-corners="false" data-overlay-theme="a">';
            html += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>';
            html += '<img class="" src="' + LibraryBrowser.getImageUrl(item, type, index, {

                maxwidth: screenWidth,
                tag: tag

            }) + '" />';
            html += '</div>';

            return html;
        }

    };

})(window, document, jQuery, screen, localStorage);


(function (window, document, $) {

    var itemCountsPromise;

    function renderHeader(page, user, counts) {

        var html = '<div class="viewMenuBar">';

        html += '<a class="viewMenuLink" href="index.html" title="Home"><img src="css/images/mblogoicon.png" alt="Home" /></a>';

        var selectedCssClass = ' selectedViewLink';
        var selectedHtml = "<span class='selectedViewIndicator'>&#9654;</span>";
        var view = page.getAttribute('data-view');

        if (counts.MovieCount || counts.TrailerCount) {

            html += '<a class="viewMenuLink viewMenuImageLink" href="moviesrecommended.html" title="Movies"><img src="css/images/views/movies.png" alt="Movies" /></a>';
            html += '<a class="viewMenuLink viewMenuTextLink' + (view == 'movies' ? selectedCssClass : '') + '" href="moviesrecommended.html">' + (view == 'movies' ? selectedHtml : '') + '<span class="viewName">Movies</span></a>';
        }

        if (counts.EpisodeCount || counts.SeriesCount) {
            html += '<a class="viewMenuLink viewMenuImageLink" href="tvrecommended.html" title="TV"><img src="css/images/views/tvshows.png" alt="TV" /></a>';
            html += '<a class="viewMenuLink viewMenuTextLink' + (view == 'tvshows' ? selectedCssClass : '') + '" href="tvrecommended.html">' + (view == 'tvshows' ? selectedHtml : '') + '<span class="viewName">TV</span></a>';
        }

        if (counts.SongCount) {
            html += '<a class="viewMenuLink viewMenuImageLink" href="musicrecommended.html" title="Music"><img src="css/images/views/music.png" alt="Music" /></a>';
            html += '<a class="viewMenuLink viewMenuTextLink' + (view == 'music' ? selectedCssClass : '') + '" href="musicrecommended.html">' + (view == 'music' ? selectedHtml : '') + '<span class="viewName">Music</span></a>';
        }

        if (counts.GameCount) {
            html += '<a class="viewMenuLink viewMenuImageLink" href="gamesrecommended.html" title="Games"><img src="css/images/views/games.png" alt="Games" /></a>';
            html += '<a class="viewMenuLink viewMenuTextLink' + (view == 'games' ? selectedCssClass : '') + '" href="gamesrecommended.html">' + (view == 'games' ? selectedHtml : '') + '<span class="viewName">Games</span></a>';
        }

        html += '<div class="viewMenuSecondary">';

        html += Search.getSearchHtml();

        html += '<a class="viewMenuLink" class="btnCurrentUser" href="#" onclick="Dashboard.showUserFlyout(this);">';

        if (user.PrimaryImageTag) {

            var url = ApiClient.getUserImageUrl(user.Id, {
                width: 225,
                tag: user.PrimaryImageTag,
                type: "Primary"
            });

            html += '<img src="' + url + '" />';
        } else {
            html += '<img src="css/images/currentuserdefaultwhite.png" />';
        }

        html += '</a>';

        html += '<a class="viewMenuLink" href="dashboard.html" title="Dashboard"><img src="css/images/toolswhite.png" alt="Dashboard" /></a>';

        html += '</div>';

        html += '</div>';

        $(page).prepend(html);

        Search.onSearchRendered($('.viewMenuBar', page));
    }

    $(document).on('pagebeforeshow', ".libraryPage", function () {

        var page = this;

        if (!$('.viewMenuBar', page).length) {

            itemCountsPromise = itemCountsPromise || ApiClient.getItemCounts(Dashboard.getCurrentUserId());

            itemCountsPromise.done(function (counts) {

                Dashboard.getCurrentUser().done(function (user) {

                    renderHeader(page, user, counts);

                });
            });

        }
    });

})(window, document, jQuery);

(function (window, document, $) {

    function getPickerHtml() {

        var html = '';

        html += '<a href="#">#</a>';
        html += '<a href="#">A</a>';
        html += '<a href="#">B</a>';
        html += '<a href="#">C</a>';
        html += '<a href="#">D</a>';
        html += '<a href="#">E</a>';
        html += '<a href="#">F</a>';
        html += '<a href="#">G</a>';
        html += '<a href="#">H</a>';
        html += '<a href="#">I</a>';
        html += '<a href="#">J</a>';
        html += '<a href="#">K</a>';
        html += '<a href="#">L</a>';
        html += '<a href="#">M</a>';
        html += '<a href="#">N</a>';
        html += '<a href="#">O</a>';
        html += '<a href="#">P</a>';
        html += '<a href="#">Q</a>';
        html += '<a href="#">R</a>';
        html += '<a href="#">S</a>';
        html += '<a href="#">T</a>';
        html += '<a href="#">U</a>';
        html += '<a href="#">V</a>';
        html += '<a href="#">W</a>';
        html += '<a href="#">X</a>';
        html += '<a href="#">Y</a>';
        html += '<a href="#">Z</a>';

        return html;
    }

    $(document).on('pageinit', ".libraryPage", function () {

        var page = this;

        var picker = $('.alphabetPicker', page);

        if (!picker.length) {
            return;
        }

        $('.itemsContainer', page).addClass('itemsContainerWithAlphaPicker');

        picker.html(getPickerHtml()).trigger('create').on('click', 'a', function () {

            var elem = $(this);

            var isSelected = elem.hasClass('selectedCharacter');

            $('.selectedCharacter', picker).removeClass('selectedCharacter');

            if (!isSelected) {

                elem.addClass('selectedCharacter');
                picker.trigger('alphaselect', [this.innerHTML]);
            } else {
                picker.trigger('alphaclear');
            }
        });
    });

    $.fn.alphaValue = function (val) {

        if (val == null) {
            return $('.selectedCharacter', this).html();
        }

        val = val.toLowerCase();

        $('.selectedCharacter', this).removeClass('selectedCharacter');

        $('a', this).each(function () {

            if (this.innerHTML.toLowerCase() == val) {

                $(this).addClass('selectedCharacter');

            } else {
                $(this).removeClass('selectedCharacter');
            }

        });

        return this;
    };

})(window, document, jQuery);