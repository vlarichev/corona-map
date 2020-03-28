import rssParser from 'rss-parser-browser';


const RSSFeed = 'https://www.rki.de/SiteGlobals/Functions/RSSFeed/RSSGenerator_nCoV.xml';

const ladeKnopf = document.getElementById('lade');
ladeKnopf.addEventListener('click', getRssFeed);


var CORS_PROXY=process.env.CORS_PROXY;

export default function getRssFeed(){
    ladeKnopf.style.display = "none";
    rssParser.parseURL(CORS_PROXY+RSSFeed, function(err, parsed) {
      var feed = L.DomUtil.create('ul', 'feed');
      parsed.feed.entries.forEach(function(entry) {
        feed.innerHTML += `<li class="is-size-6"><b href="${entry.link}">${entry.title}</b><br><p>${entry.contentSnippet} <a href="${entry.link}">weiter lesen</a></p> </li>`;
      });
      document.getElementById('feed').appendChild(feed);
    });
  }


  