﻿(function ($, document, LibraryBrowser) {

    var currentItem;
    var shape;

    function getPromise() {

        var name = getParameterByName('person');

        if (name) {
            return ApiClient.getPerson(name, Dashboard.getCurrentUserId());
        }

        name = getParameterByName('studio');

        if (name) {

            return ApiClient.getStudio(name, Dashboard.getCurrentUserId());

        }

        name = getParameterByName('genre');

        if (name) {
            return ApiClient.getGenre(name, Dashboard.getCurrentUserId());
        }

        name = getParameterByName('artist');

        if (name) {
            return ApiClient.getArtist(name, Dashboard.getCurrentUserId());
        }
        else {
            throw new Error('Invalid request');
        }
    }

    function reload(page) {

        Dashboard.showLoadingMsg();

        getPromise().done(function (item) {

            currentItem = item;

            renderHeader(page, item);

            name = item.Name;

            $('#itemImage', page).html(LibraryBrowser.getDetailImageHtml(item));

            Dashboard.setPageTitle(name);

            $('.itemName', page).html(name);

            renderDetails(page, item);
            renderTabs(page, item);

            if (ApiClient.isWebSocketOpen()) {

                var vals = [item.Type, item.Id, item.Name];

                var context = getParameterByName('context');

                if (context) {
                    vals.push(vals);
                }

                ApiClient.sendWebSocketMessage("Context", vals.join('|'));
            }

            Dashboard.hideLoadingMsg();
        });
    }

    function renderHeader(page, item) {

        var context = getParameterByName('context');

        $('.itemTabs', page).hide();

        if (context == "movies" && item.Type == "Genre") {
            $('#movieGenreTabs', page).show();
        }

        if (context == "movies" && item.Type == "Person") {
            $('#moviePeopleTabs', page).show();
        }

        if (context == "movies" && item.Type == "Studio") {
            $('#movieStudioTabs', page).show();
        }

        if (context == "tv" && item.Type == "Studio") {
            $('#tvStudioTabs', page).show();
        }

        if (context == "tv" && item.Type == "Genre") {
            $('#tvGenreTabs', page).show();
        }

        if (context == "tv" && item.Type == "Person") {
            $('#tvPeopleTabs', page).show();
        }

        if (context == "music" && item.Type == "Genre") {
            $('#musicGenreTabs', page).show();
        }
        if (context == "music" && item.Type == "Artist") {
            $('#artistTabs', page).show();
        }
        if (context == "games" && item.Type == "Genre") {
            $('#gameGenreTabs', page).show();
        }
        if (context == "games" && item.Type == "Studio") {
            $('#gameStudioTabs', page).show();
        }
    }

    function renderTabs(page, item) {

        var promise;

        if (item.Type == "Person") {
            promise = ApiClient.getPersonItemCounts(Dashboard.getCurrentUserId(), item.Name);
        }
        else if (item.Type == "Genre") {
            promise = ApiClient.getGenreItemCounts(Dashboard.getCurrentUserId(), item.Name);
        }
        else if (item.Type == "Studio") {
            promise = ApiClient.getStudioItemCounts(Dashboard.getCurrentUserId(), item.Name);
        }
        else if (item.Type == "Artist") {
            promise = ApiClient.getArtistItemCounts(Dashboard.getCurrentUserId(), item.Name);
        }
        else {
            throw new Error("Unknown item type: " + item.Type);
        }

        promise.done(function (result) {

            var html = '<fieldset data-role="controlgroup" data-type="horizontal" class="libraryTabs">';

            html += '<legend></legend>';

            if (result.MovieCount) {

                html += '<input type="radio" name="ibnItems" id="radioMovies" value="on" data-mini="true">';
                html += '<label for="radioMovies">Movies (' + result.MovieCount + ')</label>';
            }

            if (result.SeriesCount) {

                html += '<input type="radio" name="ibnItems" id="radioShows" value="on" data-mini="true">';
                html += '<label for="radioShows">TV Shows (' + result.SeriesCount + ')</label>';
            }

            if (result.EpisodeCount) {

                html += '<input type="radio" name="ibnItems" id="radioEpisodes" value="on" data-mini="true">';
                html += '<label for="radioEpisodes">Episodes (' + result.EpisodeCount + ')</label>';
            }

            if (result.TrailerCount) {

                html += '<input type="radio" name="ibnItems" id="radioTrailers" value="on" data-mini="true">';
                html += '<label for="radioTrailers">Trailers (' + result.TrailerCount + ')</label>';
            }

            if (result.GameCount) {

                html += '<input type="radio" name="ibnItems" id="radioGames" value="on" data-mini="true">';
                html += '<label for="radioGames">Games (' + result.GameCount + ')</label>';
            }

            if (result.AlbumCount) {

                html += '<input type="radio" name="ibnItems" id="radioAlbums" value="on" data-mini="true">';
                html += '<label for="radioAlbums">Albums (' + result.AlbumCount + ')</label>';
            }

            if (result.SongCount) {

                html += '<input type="radio" name="ibnItems" id="radioSongs" value="on" data-mini="true">';
                html += '<label for="radioSongs">Songs (' + result.SongCount + ')</label>';
            }

            if (result.MusicVideoCount) {

                html += '<input type="radio" name="ibnMusicVideos" id="radioMusicVideos" value="on" data-mini="true">';
                html += '<label for="radioMusicVideos">Music Videos (' + result.MusicVideoCount + ')</label>';
            }

            html += '</fieldset>';

            var elem = $('#itemTabs', page).html(html).trigger('create');

            bindRadioEvents(page);

            $('input:first', elem).attr("checked", "checked").checkboxradio("refresh").trigger('click');
        });
    }

    function bindRadioEvents(page) {

        $("#radioMusicVideos", page).on("click", function () {

            shape = "poster";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "MusicVideo",
                PersonTypes: "",
                Artists: ""
            });

        });

        $("#radioMovies", page).on("click", function () {

            shape = "poster";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "Movie",
                PersonTypes: "",
                Artists: ""
            });

        });

        $("#radioShows", page).on("click", function () {

            shape = "poster";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "Series",
                PersonTypes: "",
                Artists: ""
            });
        });

        $("#radioTrailers", page).on("click", function () {

            shape = "poster";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "Trailer",
                PersonTypes: "",
                Artists: ""
            });
        });

        $("#radioGames", page).on("click", function () {

            shape = "poster";
            loadItems(page, {
                IncludeItemTypes: "",
                MediaTypes: "Game",
                PersonTypes: "",
                Artists: ""
            });
        });

        $("#radioEpisodes", page).on("click", function () {

            shape = "backdrop";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "Episode",
                PersonTypes: "",
                Artists: ""
            });
        });

        $("#radioAlbums", page).on("click", function () {

            shape = "square";
            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "MusicAlbum",
                PersonTypes: "",
                Artists: ""
            });
        });

        $("#radioSongs", page).on("click", function () {

            loadItems(page, {
                MediaTypes: "",
                IncludeItemTypes: "Audio",
                PersonTypes: "",
                Artists: ""
            });
        });
    }

    function renderDetails(page, item) {

        LibraryBrowser.renderDetailPageBackdrop(page, item);
        LibraryBrowser.renderOverview($('.itemOverview', page), item);

        renderUserDataIcons(page, item);
        LibraryBrowser.renderLinks($('#itemLinks', page), item);

        if (item.Type == "Person" && item.PremiereDate) {

            try {
                var birthday = parseISO8601Date(item.PremiereDate, { toLocal: true }).toDateString();

                $('#itemBirthday', page).show().html("Birthday:&nbsp;&nbsp;" + birthday);
            }
            catch (err) {
                $('#itemBirthday', page).hide();
            }
        } else {
            $('#itemBirthday', page).hide();
        }

        if (item.Type == "Person" && item.EndDate) {

            try {
                var deathday = parseISO8601Date(item.EndDate, { toLocal: true }).toDateString();

                $('#itemDeathDate', page).show().html("Death day:&nbsp;&nbsp;" + deathday);
            }
            catch (err) {
                $('#itemBirthday', page).hide();
            }
        } else {
        }

        if (item.Type == "Person" && item.ProductionLocations && item.ProductionLocations.length) {

            var gmap = '<a class="textlink" target="_blank" href="https://maps.google.com/maps?q=' + item.ProductionLocations[0] + '">' + item.ProductionLocations[0] + '</a>';

            $('#itemBirthLocation', page).show().html("Birthplace:&nbsp;&nbsp;" + gmap).trigger('create');
        } else {
            $('#itemBirthLocation', page).hide();
        }

        var elem = $('.detailSectionContent', page)[0];
        var text = elem.textContent || elem.innerText;

        if (!text.trim()) {
            $('#detailSection', page).hide();
        } else {
            $('#detailSection', page).show();
        }
    }

    function renderUserDataIcons(page, item) {
        $('.userDataIcons', page).html(LibraryBrowser.getUserDataIconsHtml(item));
    }

    function addCurrentItemToQuery(query) {

        if (currentItem.Type == "Person") {
            query.Person = currentItem.Name;
        }
        else if (currentItem.Type == "Genre") {
            query.Genres = currentItem.Name;
        }
        else if (currentItem.Type == "Studio") {
            query.Studios = currentItem.Name;
        }
        else if (currentItem.Type == "Artist") {
            query.Artists = currentItem.Name;
        }
    }

    function loadItems(page, options) {

        Dashboard.showLoadingMsg();

        var query = {

            SortBy: "SortName",
            SortOrder: "Ascending",
            IncludeItemTypes: "",
            Recursive: true,
            Fields: "UserData,DisplayMediaType,ItemCounts,DateCreated,AudioInfo,SeriesInfo,ParentId",
            Limit: LibraryBrowser.getDefaultPageSize(),
            StartIndex: 0
        };

        query = $.extend(query, options || {});

        addCurrentItemToQuery(query);

        ApiClient.getItems(Dashboard.getCurrentUserId(), query).done(function (result) {

            var html = '';

            if (result.TotalRecordCount > query.Limit) {
                $('.listTopPaging', page).html(LibraryBrowser.getPagingHtml(query, result.TotalRecordCount, true)).trigger('create');
                $('.viewSettings', page).show();
            } else {
                $('.listTopPaging', page).html('');
                $('.viewSettings', page).hide();
            }

            if (query.IncludeItemTypes == "Audio") {

                html += LibraryBrowser.getSongTableHtml(result.Items, {
                    showAlbum: true,
                    showArtist: true
                });


            } else {

                html += LibraryBrowser.getPosterDetailViewHtml({
                    items: result.Items,
                    preferBackdrop: shape == "backdrop",
                    shape: shape
                });
            }

            html += LibraryBrowser.getPagingHtml(query, result.TotalRecordCount);

            $('#items', page).html(html).trigger('create');

            $('.selectPage', page).on('change', function () {

                query.StartIndex = (parseInt(this.value) - 1) * query.Limit;
                loadItems(page, query);
            });

            $('.btnNextPage', page).on('click', function () {

                query.StartIndex = query.StartIndex + query.Limit;
                loadItems(page, query);
            });

            $('.btnPreviousPage', page).on('click', function () {

                query.StartIndex = query.StartIndex - query.Limit;
                loadItems(page, query);
            });

            $('.selectPageSize', page).on('change', function () {
                query.Limit = parseInt(this.value);
                query.StartIndex = 0;
                loadItems(page);
            });

            Dashboard.hideLoadingMsg();
        });
    }

    $(document).on('pageinit', "#itemByNameDetailPage", function () {

        var page = this;

        $('#btnRemote', page).on('click', function () {

            RemoteControl.showMenu({ item: currentItem, context: getParameterByName('context') || '' });
        });

    }).on('pageshow', "#itemByNameDetailPage", function () {

        var page = this;

        reload(page);

    }).on('pagehide', "#itemByNameDetailPage", function () {

        currentItem = null;
    });


})(jQuery, document, LibraryBrowser);