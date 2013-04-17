﻿var MetadataImagesPage = {

    onPageShow: function () {

        Dashboard.showLoadingMsg();

        var page = this;

        ApiClient.getServerConfiguration().done(function(result) {
            MetadataImagesPage.load(page, result);
        });
    },

    load: function (page, config) {

        $('#selectTmdbPersonImageDownloadSize', page).val(config.TmdbFetchedProfileSize).selectmenu("refresh");
        $('#selectTmdbPosterDownloadSize', page).val(config.TmdbFetchedPosterSize).selectmenu("refresh");
        $('#selectTmdbBackdropDownloadSize', page).val(config.TmdbFetchedBackdropSize).selectmenu("refresh");
        
        $('#chkRefreshItemImages', page).checked(config.RefreshItemImages).checkboxradio("refresh");
        $('#txtNumbackdrops', page).val(config.MaxBackdrops);

        $('#chkDownloadMovieArt', page).checked(config.DownloadMovieImages.Art).checkboxradio("refresh");
        $('#chkDownloadMovieBanner', page).checked(config.DownloadMovieImages.Banner).checkboxradio("refresh");
        $('#chkDownloadMovieDisc', page).checked(config.DownloadMovieImages.Disc).checkboxradio("refresh");
        $('#chkDownloadMovieLogo', page).checked(config.DownloadMovieImages.Logo).checkboxradio("refresh");
        $('#chkDownloadMovieThumb', page).checked(config.DownloadMovieImages.Thumb).checkboxradio("refresh");
        $('#chKDownloadTVArt', page).checked(config.DownloadSeriesImages.Art).checkboxradio("refresh");
        $('#chkDownloadTVBanner', page).checked(config.DownloadSeriesImages.Banner).checkboxradio("refresh");
        $('#chkDownloadTVLogo', page).checked(config.DownloadSeriesImages.Logo).checkboxradio("refresh");
        $('#chkDownloadTVThumb', page).checked(config.DownloadSeriesImages.Thumb).checkboxradio("refresh");
        $('#chkDownloadSeasonBanner', page).checked(config.DownloadSeasonImages.Banner).checkboxradio("refresh");
        $('#chkDownloadSeasonThumb', page).checked(config.DownloadSeasonImages.Thumb).checkboxradio("refresh");
        $('#chkDownloadSeasonBackdrops', page).checked(config.DownloadSeasonImages.Backdrops).checkboxradio("refresh");
        $('#chkDownloadArtistThumb', page).checked(config.DownloadMusicArtistImages.Thumb).checkboxradio("refresh");
        $('#chkDownloadArtistBackdrops', page).checked(config.DownloadMusicArtistImages.Backdrops).checkboxradio("refresh");
        $('#chkDownloadArtistLogo', page).checked(config.DownloadMusicArtistImages.Logo).checkboxradio("refresh");
        $('#chkDownloadArtistBanner', page).checked(config.DownloadMusicArtistImages.Banner).checkboxradio("refresh");
        $('#chkDownloadAlbumPrimary', page).checked(config.DownloadMusicAlbumImages.Primary).checkboxradio("refresh");
        $('#chkDownloadAlbumBackdrops', page).checked(config.DownloadMusicAlbumImages.Backdrops).checkboxradio("refresh");

        Dashboard.hideLoadingMsg();
    },

    onSubmit: function () {
        var form = this;

        Dashboard.showLoadingMsg();

        ApiClient.getServerConfiguration().done(function (config) {

            config.TmdbFetchedProfileSize = $('#selectTmdbPersonImageDownloadSize', form).val();
            config.TmdbFetchedPosterSize = $('#selectTmdbPosterDownloadSize', form).val();
            config.TmdbFetchedBackdropSize = $('#selectTmdbBackdropDownloadSize', form).val();

            config.RefreshItemImages = $('#chkRefreshItemImages', form).checked();
            config.MaxBackdrops = $('#txtNumbackdrops', form).val();

            config.DownloadMovieImages.Art = $('#chkDownloadMovieArt', form).checked();
            config.DownloadMovieImages.Banner = $('#chkDownloadMovieBanner', form).checked();
            config.DownloadMovieImages.Disc = $('#chkDownloadMovieDisc', form).checked();
            config.DownloadMovieImages.Logo = $('#chkDownloadMovieLogo', form).checked();
            config.DownloadMovieImages.Thumb = $('#chkDownloadMovieThumb', form).checked();
            config.DownloadSeriesImages.Art = $('#chKDownloadTVArt', form).checked();
            config.DownloadSeriesImages.Banner = $('#chkDownloadTVBanner', form).checked();
            config.DownloadSeriesImages.Logo = $('#chkDownloadTVLogo', form).checked();
            config.DownloadSeriesImages.Thumb = $('#chkDownloadTVThumb', form).checked();
            config.DownloadSeasonImages.Banner = $('#chkDownloadSeasonBanner', form).checked();
            config.DownloadSeasonImages.Thumb = $('#chkDownloadSeasonThumb', form).checked();
            config.DownloadSeasonImages.Backdrops = $('#chkDownloadSeasonBackdrops', form).checked();
            config.DownloadMusicArtistImages.Backdrops = $('#chkDownloadArtistBackdrops', form).checked();
            config.DownloadMusicArtistImages.Logo = $('#chkDownloadArtistLogo', form).checked();
            config.DownloadMusicArtistImages.Thumb = $('#chkDownloadArtistThumb', form).checked();
            config.DownloadMusicArtistImages.Banner = $('#chkDownloadArtistBanner', form).checked();
            config.DownloadMusicAlbumImages.Primary = $('#chkDownloadAlbumPrimary', form).checked();
            config.DownloadMusicAlbumImages.Backdrops = $('#chkDownloadAlbumBackdrops', form).checked();

            ApiClient.updateServerConfiguration(config).done(Dashboard.processServerConfigurationUpdateResult);
        });

        // Disable default form submission
        return false;
    }
};

$(document).on('pageshow', "#metadataImagesConfigurationPage", MetadataImagesPage.onPageShow);