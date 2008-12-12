/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Gloda Wordcloud.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Andrew Sutherland <asutherland@asutherland.org>
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */
var wordcloudTabType = {
  name: "wordcloud",
  perTabPanel: "iframe",
  modes: {
    wordcloud: {
      type: "wordcloud"
    },
  },
  openTab: function (aTab, aConstraints, aCollection) {
    aTab.panel.contentWindow.addEventListener("load",
      function(e) { glodacloud.magicUpAWordCloud(aTab); }, false);
    aTab.constraints = aConstraints;
    aTab.collection = aCollection;
    aTab.panel.setAttribute("src",
      "chrome://glodacloud/content/glodacloud.xhtml");
    aTab.title = "Word Cloud";
  },
  closeTab: function (aTab) {
  },
  saveTabState: function (aTab) {
  },
  showTab: function (aTab) {
  }
};

var glodacloud = {
  stopwords: ["i", "me", "my", "myself", "we", "our", "ours", "ourselves",
              "you", "your", "yours", "yourself", "yourselves", "he", "him",
              "his", "himself", "she", "her", "hers", "herself", "it", "its",
              "itself", "they", "them", "their", "theirs", "themselves", "what",
              "which", "who", "whom", "this", "that", "these", "those", "am",
              "is", "are", "was", "were", "be", "been", "being", "have", "has",
              "had", "having", "do", "does", "did", "doing", "would", "should",
              "could", "ought", "i'm", "you're", "he's", "she's", "it's",
              "we're", "they're", "i've", "you've", "we've", "they've", "i'd",
              "you'd", "he'd", "she'd", "we'd", "they'd", "i'll", "you'll",
              "he'll", "she'll", "we'll", "they'll", "isn't", "aren't",
              "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't",
              "don't", "didn't", "won't", "wouldn't", "shan't", "shouldn't",
              "can't", "cannot", "couldn't", "mustn't", "let's", "that's",
              "who's", "what's", "here's", "there's", "when's", "where's",
              "why's", "how's", "a", "an", "the", "and", "but", "if", "or",
              "because", "as", "until", "while", "of", "at", "by", "for",
              "with", "about", "against", "between", "into", "through",
              "during", "before", "after", "above", "below", "to", "from", "up",
              "down", "in", "out", "on", "off", "over", "under", "again",
              "further", "then", "once", "here", "there", "when", "where",
              "why", "how", "all", "any", "both", "each", "few", "more", "most",
              "other", "some", "such", "no", "nor", "not", "only", "own",
              "same", "so", "than", "too", "very"],
  stopmap: {},
  wordSplitRegex: new RegExp("[-~0-9/ \r\n\t!@#$%^&*(),.<>;:\"[\\]{}_=+|]+"),
  
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("glodacloud-strings");
    
    this.tabmail = document.getElementById("tabmail");
    this.tabmail.registerTabType(wordcloudTabType);
    
    for each (let [, stopword] in Iterator(this.stopwords)) {
      this.stopmap[stopword] = true;
    }
  },
  handleWordClick: function(aPhantom) {
    let newConstraints = this.tabmail.currentTabInfo.constraints.concat();
    let lastConstraint = newConstraints[newConstraints.length-1];
    if (typeof(lastConstraint) == "string")
      newConstraints.pop();
    newConstraints.push(aPhantom.word);
    this.tabmail.openTab("searchAll", newConstraints);
  },
  magicUpAWordCloud: function(aTab) {
    let doc = aTab.panel.contentDocument;
    let win = aTab.panel.contentWindow;
    
    let words = {};
    let stopmap = this.stopmap;
    
    for each (let [, message] in Iterator(aTab.collection.items)) {
      if (!message.indexedBodyText)
        continue;
      
      let docWords = message.indexedBodyText.split(this.wordSplitRegex);
      for each (let [,docword] in Iterator(docWords)) {
        lowerWord = docword.toLowerCase();
        if (lowerWord in stopmap)
          continue;
        let word = words[lowerWord];
        if (word === undefined)
          words[lowerWord] = word = {word: docword, count: 1};
        else
          word.count += 1;
      }
    }
    
    let wordlist = [value for each (value in words)];
    
    win.handleWordClickThis = this;
    win.handleWordClick = this.handleWordClick;
    
    win.setupVis(wordlist);
  },
};
window.addEventListener("load", function(e) { glodacloud.onLoad(e); }, false);
