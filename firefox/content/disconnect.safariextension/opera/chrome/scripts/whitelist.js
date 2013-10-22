/*
  The script containing the functions responsible for whitelisting and
  blacklisting sites.

  Copyright 2010-2013 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Eason Goodale <eason.goodale@gmail.com>
*/

  /* Creates whitelist for URL if it doesn't exist
      If we get all fields, whitelist/blacklist service
      If we get everything except service, whitelist/blacklist category
      If we get only get whitelisted and the url, whitelist/blacklist url
      Treats global whitelist as just another url passed in as 'Global'
      TODO: Change the blacklist at the same time
  */
function changeWhitelist(whitelisted, url, category, service) {
  whitelistExistenceCheck(url, category);

  if (service) {
    whitelist[url][category].services[service] = whitelisted;
  }
  else if (category) {
    whitelist[url][category].whitelisted = whitelisted;
  }
  else if (url) {
    for (var currentCategory in whitelist[url]) {
      whitelist[url][currentCategory].whitelisted = whitelisted;
    }
  }
  options.whitelist = JSON.stringify(whitelist);
}

//TODO: Create blacklist entries at the same time
function whitelistExistenceCheck(url, category) {
  whitelist = whitelist || {};
  whitelist[url] = whitelist[url] || createWhitelist(url);
  if (category && !(whitelist[url][category])) {
    if (category == 'Content') {
      whitelist[url][category] = {whitelisted: true, services: {}};
    }
    else if (category == 'Disconnect') {
      whitelist[url][category] = {
        whitelisted: false, 
        services: {
          Google: false,
          Facebook: false,
          Twitter: false
        }
      };
    }
    else {
      whitelist[url][category] = {whitelisted: false, services: {}};
    }
  }
}

function createWhitelist(url) {
  return {
    Advertising: {whitelisted: false, services: {}},
    Analytics: {whitelisted: false, services: {}},
    Social: {whitelisted: false, services: {}},
    Content: {whitelisted: true, services: {}},
    Disconnect: {whitelisted: false, 
    	services: {
	      Google: false,
	      Facebook: false,
	      Twitter: false
    	}
  	}
  };
}

function isWhitelisted(parentDomain, category, url) {
  if (whitelist && whitelist != {}) {
    var domainWhitelist = whitelist[parentDomain] || {};
    var categoryWhitelist = domainWhitelist[category] || {};
    var servicesWhitelist = categoryWhitelist.services || {};
    if (!(url) && category) {
      if (category == "Content" || categoryWhitelist.whitelisted) {
        return !(isBlacklisted(parentDomain, category, url));
      }
    }
    else if (category == "Content" || categoryWhitelist.whitelisted) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else if (servicesWhitelist[url]) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else if (globalCategory.whitelisted || globalCategory.services[service]) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else return false;
  }
}

function isBlacklisted(parentDomain, category, url) {
    var blacklist = deserialize(options.blacklist) || {};
    var parentBlacklist = blacklist[parentDomain] || {};
    var categoryBlacklisted = parentBlacklist[category] || {};
    var globalBlacklist = blacklist.Global;
    if (!(url) && category){
      return categoryBlacklisted.blacklisted;
    }
    else if (categoryBlacklist[url]) {
      return true;
    }
    else if (globalBlacklist[category][url]) {
      return true
    }
    return false;
}

function setDefaultWhitelist () {
  var defaultWhitelist = {
    'mediafire.com': {
      Facebook: {category: "Disconnect", buildReleased: 35}
    },
    'salon.com': {
      Google: {category: "Disconnect", buildReleased: 35}
    },
    'latimes.com': {
      Google: {category: "Disconnect", buildReleased: 38}
    },
    'udacity.com': {
      Twitter: {category: "Disconnect", buildReleased: 39}
    },
    'feedly.com': {
      Google: {category: "Disconnect", buildReleased: 44}
    },
    'udacity.com': {
      Google: {category: "Disconnect", buildReleased: 54},
      Facebook: {category: "Disconnect", buildReleased: 54}
    },
    'freshdirect.com': {
      Google: {category: "Disconnect", buildReleased: 57}
    },
    'newyorker.com': {
      Google: {category: "Disconnect", buildReleased: 57}
    },
    'hm.com': {
      IBM: {category: "Analytics", buildReleased: "current"}
    }
  };

  for (var siteURL in defaultWhitelist) {
    for (var service in defaultWhitelist[siteURL]) {
      var category = defaultWhitelist[siteURL][service].category;
      var buildReleased = defaultWhitelist[siteURL][service].buildReleased;

      if (!PREVIOUS_BUILD || PREVIOUS_BUILD > buildReleased){
        changeWhitelist(true, siteURL, category, service);
      }
      else if (buildReleased == "current" && PREVIOUS_BUILD < CURRENT_BUILD) {
        changeWhitelist(true, siteURL, category, service);
      }
    }
  }
}