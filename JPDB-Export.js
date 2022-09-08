// ==UserScript==
// @name         jpdb | Deck export
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a button to export deck contents, plus some other minor changes (see below for full details)
// @author       JaiWWW
// @match        https://jpdb.io/deck*
// @match        https://jpdb.io/add-to-deck-from-shirabe-jisho*
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jpdb.io
// @grant        none
// ==/UserScript==

/*

To do:

✓ Add export deck button
• Add button functionality:
    ✓ Create file
    ✓ Export file
• Add in-progess test for non-first pages
✓ Rename import button
✓ Edit import description

*/


(function() {
    'use strict';

    if (window.location.href.startsWith('https://jpdb.io/deck')) { // Deck page

        const ULs = document.getElementsByTagName("ul"); // An array of all unordered list elements
        const menu = ULs[0];
        const shirabe = menu.getElementsByTagName("li")[5]; // The "Import from Shirabe Jisho" list item

        function exportToCSV() { // Export the deck contents to a CSV file

            console.log('You called the exportToCSV() function!');

            // Test if FileSaver.js is supported
            let supported;
            try {
                const isFileSaverSupported = !!new Blob;
                supported = true;
            } catch (e) {
                supported = false;
                const errorMessage = 'Userscript "jpdb | Deck export":\n\nSorry, your browser does not support the system used to download files. Please see this link for more information: https://github.com/eligrey/FileSaver.js#user-content-supported-browsers\n\nDo you want to go to this link now? (opens in new tab)';
                if (confirm(errorMessage)) { // If they click OK to go to the link
                    window.open("https://github.com/eligrey/FileSaver.js#user-content-supported-browsers");
                }
            }

            if (supported) {

                // Create a file name from the deck name and current time
                const container = document.getElementsByClassName("container bugfix")[0];
                const deckName = container.firstChild.nextSibling.textContent;
                const current = new Date();
                const time = current.toLocaleTimeString();
                const date = current.toLocaleDateString();
                const fileName = `_${deckName}_ deck export at ${time} on ${date}.csv`;

                // Create the file contents
                let fileContents = '';
                let wordWrapper; // The <a> tag surrounding each word
                let stringK; // This will store the current kanji string being found to add to the CSV
                let stringR; // This will store the current reading string being found to add to the CSV
                const vocabList = document.querySelector("body > div.container.bugfix > div.vocabulary-list"); // Div containing all the vocab on the page

                for (let i = 1; i <= vocabList.childElementCount; i++) { // Loop through each word in the vocab list
                    stringK = '';
                    stringR = '';
                    wordWrapper = document.querySelector("body > div.container.bugfix > div.vocabulary-list > div:nth-child("
                    + i + ") > div:nth-child(1) > div.vocabulary-spelling > a");
                    for (let j = 0; j < wordWrapper.childElementCount; j++) { // Loop through each ruby element in this word
                        if (wordWrapper.children[j].childElementCount === 0) { // If this ruby element has no children (i.e. it's kana)
                            // Add the contents to both strings
                            stringR += wordWrapper.children[j].textContent;
                            stringK += wordWrapper.children[j].textContent;
                        } else { // If this ruby element is kanji
                            stringK += wordWrapper.children[j].firstChild.textContent; // Add the kanji to the kanji string
                            stringR += wordWrapper.children[j].children[0].textContent; // Add the furigana to the reading string
                        }
                    }
                    fileContents += `${stringK},${stringR},\n`; // Append the strings into the csv file in the correct format
                }

                // Actually export
                const blob = new Blob([fileContents], {type: "text/plain;charset=utf-8"});
                saveAs(blob, fileName);
            }
        }

        shirabe.firstChild.lastChild.setAttribute('value', 'Import from CSV'); // Rename to "Import from CSV"
        // Add "Export to CSV" button
        shirabe.insertAdjacentHTML('afterend', '<li><form class="link-like" method="dialog"><input type="submit" value="Export to CSV"></form></li>');

        const exportButton = menu.getElementsByTagName("li")[6];
        exportButton.addEventListener('click', exportToCSV);

    }

    if (window.location.href.startsWith('https://jpdb.io/add-to')) { // Import page

        const heading = document.getElementsByTagName("h4")[0]; // "Import from Shirabe Jisho" heading
        heading.innerHTML = 'Import from CSV'; // Changing the heading

        const bulletOne = document.getElementsByTagName("ul")[0].firstChild; // First bullet point
        bulletOne.innerHTML += ', decks or any other correctly-formatted CSV file';
        // Add a bullet point explaining how to find the correct format
        bulletOne.insertAdjacentHTML(
            'afterend', '<li>To see an example of the correct format, try exporting a deck and opening the file in a text editor</li>');
    }

})();