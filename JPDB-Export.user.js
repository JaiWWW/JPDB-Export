// ==UserScript==
// @name         JPDB-Export
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  Adds a button to export deck contents, plus some other minor changes (see readme on github for full details)
// @author       JaiWWW
// @match        https://jpdb.io/deck*
// @match        https://jpdb.io/add-to-deck-from-shirabe-jisho*
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jpdb.io
// @homepageURL  https://github.com/JaiWWW/JPDB-Export
// @supportURL   https://github.com/JaiWWW/JPDB-Export/issues/new
// @downloadURL  https://github.com/JaiWWW/JPDB-Export/raw/main/JPDB-Export.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==


(function() {
    'use strict';
    
    const URL = window.location.href;

    if (URL.startsWith('https://jpdb.io/deck')) { // Deck page

        function exportToCSV() { // Export the deck contents to a CSV file

            // Test if FileSaver.js is supported
            let supported;
            try {
                const isFileSaverSupported = !!new Blob;
                supported = true;
            } catch (e) {
                supported = false;
                const errorMessage = 'Userscript "JPDB-Export":\n\nSorry, your browser does not support the system used to download files. Please see this link for more information: https://github.com/eligrey/FileSaver.js#user-content-supported-browsers\n\nDo you want to go to this link now? (opens in new tab)';
                if (confirm(errorMessage)) { // If they click OK to go to the link
                    window.open("https://github.com/eligrey/FileSaver.js#user-content-supported-browsers");
                }
            }

            if (supported) {

                inProgress = GM_getValue('inProgress')
                const confirmationMessage = "Exporting your deck may take some time if it has a lot of pages. Continue?";
                if (inProgress || confirm(confirmationMessage)) { // If they are already in progress of click OK to start export

                    function addPageToFile() { // Append the current page to the file

                        const vocabList = document.querySelector("body > div.container.bugfix > div.vocabulary-list"); // Div containing all the vocab on the page

                        let wordWrapper; // The <a> tag surrounding each word
                        let stringK; // This will store the current kanji string being found to add to the CSV
                        let stringR; // This will store the current reading string being found to add to the CSV
                        let fileContents = GM_getValue('fileContents'); // Get the current file contents into fileContents

                        for (let i = 1; i <= vocabList.childElementCount; i++) { // Loop through each word in the vocab list
                            stringK = '';
                            stringR = '';
                            wordWrapper = vocabList.querySelector(`div:nth-child(${i}) > div:nth-child(1) > div.vocabulary-spelling > a`);
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
                            fileContents += `${stringK},${stringR},\n`; // Append the correctly formatted strings to fileContents
                        }
                        GM_setValue('fileContents', fileContents); // Update the file contents
                    }

                    function createFileName() { // Create a file name and upload to storage

                        const container = document.getElementsByClassName("container bugfix")[0];
                        const deckName = container.firstChild.nextSibling.textContent;
                        const current = new Date();
                        const time = current.toLocaleTimeString();
                        const date = current.toLocaleDateString();
                        const fileName = `_${deckName}_ deck export at ${time} on ${date}.csv`;
                        return fileName;
                    }

                    function downloadFile() { // Download the file

                        GM_setValue('inProgress', false);
                        const fileName = createFileName();
                        const fileContents = GM_getValue('fileContents');

                        const blob = new Blob([fileContents], {type: "text/plain;charset=utf-8"});
                        saveAs(blob, fileName);
                    }

                    function lastPage() { // Test if we are on the last page or not

                        const pagination = document.getElementsByClassName('container bugfix')[0].children[9]; // Div that shows "Next page"
                        if (pagination.textContent.indexOf("Next page") < 0) { // Last page
                            return true;
                        } else { // More pages to go
                            return false;
                        }
                    }

                    if (URL.indexOf("offset=") < 0) { // If they are on the first page of the deck

                        GM_setValue('inProgress', true);
                        GM_setValue('fileContents', ''); // Initiate fileContents
                        addPageToFile();

                        if (lastPage()) { // Download file
                            downloadFile();
                        } else { // Redirect to next page

                            // URL looks like 'https://jpdb.io/deck?id=123' potentially with '#a' at the end
                            const redirect = URL.replace('#a', '') + '&offset=50';
                            window.location.replace(redirect);
                        }

                    } else { // They are not on the first page
                        if (inProgress) { // If export is already in progress

                            addPageToFile();

                            if (lastPage()) { // Download file
                                downloadFile();
                            } else { // Redirect to next page

                                // URL looks like 'https://jpdb.io/deck=123&offset=200'
                                const offsetIndex = URL.indexOf("offset=") + 7; // First character of the actual offset number
                                const offset = parseInt(URL.slice(offsetIndex)) + 50; // Offset value of next page

                                const redirect = URL.slice(0, offsetIndex) + offset;
                                window.location.replace(redirect);
                            }


                        } else { // User wants to start export but has to go to the first page

                            GM_setValue('inProgress', true);
                            const firstPage = URL.slice(0,URL.indexOf("offset=")-1);
                            window.location.replace(firstPage); // Go to first page

                        }
                    }
                }
            }
        }

        let inProgress = GM_getValue('inProgress'); // inProgress will store true if in progress and false otherwise
        const ULs = document.getElementsByTagName("ul"); // An array of all unordered list elements
        const menu = ULs[0];
        const shirabe = menu.getElementsByTagName("li")[5]; // The "Import from Shirabe Jisho" button
        shirabe.firstChild.lastChild.setAttribute('value', 'Import from CSV'); // Rename to "Import from CSV"

        // Add "Export to CSV" button
        shirabe.insertAdjacentHTML('afterend', '<li id="export"><form class="link-like" method="dialog"><input type="submit" value="Export to CSV"></form></li>');

        const exportButton = document.getElementById("export");
        exportButton.addEventListener('click', exportToCSV); // Call exportToCSV() when exportButton is clicked

        if (inProgress) {
            exportToCSV();
        }
    }

    if (URL.startsWith('https://jpdb.io/add-to')) { // Import page

        const heading = document.getElementsByTagName("h4")[0]; // "Import from Shirabe Jisho" heading
        heading.innerHTML = 'Import from CSV'; // Changing the heading

        const bulletOne = document.getElementsByTagName("ul")[0].firstChild; // First bullet point
        bulletOne.innerHTML += ', decks or any other correctly-formatted CSV file';
        // Add a bullet point explaining how to find the correct format
        bulletOne.insertAdjacentHTML(
            'afterend', '<li>To see an example of the correct format, try exporting a deck and opening the file in a text editor</li>');
    }
})();
