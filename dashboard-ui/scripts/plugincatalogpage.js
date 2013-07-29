﻿(function ($, document) {

    // The base query options
    var query = {
        TargetSystems: 'Server'
    };

    function reloadList(page) {

        Dashboard.showLoadingMsg();

        var promise1 = ApiClient.getAvailablePlugins(query);
        var promise2 = ApiClient.getInstalledPlugins();

        $.when(promise1, promise2).done(function (response1, response2) {
            populateList(page, response1[0], response2[0]);
        });

        Dashboard.hideLoadingMsg();
    }

    function populateList(page, availablePlugins, installedPlugins) {

        Dashboard.showLoadingMsg();

        availablePlugins = availablePlugins.filter(function (p) {
            return p.type == "UserInstalled";
        }).sort(function (a, b) {

            var aName = (a.category || "General") + " " + a.name;
            var bame = (b.category || "General") + " " + b.name;

            return aName > bame ? 1 : -1;
        });

        var pluginhtml = '';

        var currentCategory;

        for (var i = 0, length = availablePlugins.length; i < length; i++) {
            var html = '';
            var plugin = availablePlugins[i];

            var category = plugin.category || "General";
            
            if (category != currentCategory) {
                html += '<h2 style="margin: .5em 0 0;">' + category + '</h2>';
                currentCategory = category;
            }

            html += "<a class='posterItem smallBackdropPosterItem transparentPosterItem borderlessPosterItem' href='addPlugin.html?name=" + encodeURIComponent(plugin.name) + "'>";

            if (plugin.thumbImage) {
                html += '<div class="posterItemImage" style="background-image:url(\'' + plugin.thumbImage + '\');"></div>';
            } else {
                html += '<div class="posterItemImage defaultPosterItemImage" style="background-image:url(\'css/images/items/list/collection.png\');"></div>';
            }

            if (plugin.isPremium) {
                if (plugin.price > 0) {
                    html += "<div class='premiumBanner'><img src='css/images/supporter/premiumflag.png' /></div>";
                } else {
                    html += "<div class='premiumBanner'><img src='css/images/supporter/supporterflag.png' /></div>";
                }
            }

            var color = plugin.tileColor || LibraryBrowser.getMetroColor(plugin.name);

            html += "<div class='posterItemText posterItemTextCentered' style='background:" + color + "'>";

            var installedPlugin = installedPlugins.filter(function (ip) {
                return ip.Name == plugin.name;
            })[0];

            if (installedPlugin) {
                html += "<span class='installedPluginTitle'>" + plugin.name + "</span> (Installed)";
            } else {
                html += plugin.name;
            }

            html += "</div>";

            html += "</a>";

            pluginhtml += html;

        }

        if (!availablePlugins.length) {
            $("#noPlugins", page).hide();
        }

        $('#pluginTiles', page).html(pluginhtml);

        Dashboard.hideLoadingMsg();
    }


    $(document).on('pageinit', "#pluginCatalogPage", function () {

        var page = this;

        reloadList(page);

        $('.chkPremiumFilter', page).on('change', function () {

            if (this.checked) {
                query.IsPremium = true;
            } else {
                query.IsPremium = null;
            }
            reloadList(page);
        });

        $('#selectTargetSystem', page).on('change', function () {

            query.TargetSystems = this.value;
            reloadList(page);
        });

    }).on('pageshow', "#pluginCatalogPage", function () {

        var page = this;

        // Reset form values using the last used query
        $('.chkPremiumFilter', page).each(function () {

            var filters = query.IsPremium || false;

            this.checked = filters;

        }).checkboxradio('refresh');
    });

})(jQuery, document);