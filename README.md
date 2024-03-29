# JPDB-Export

This script was tested with Tampermonkey in Chrome and Firefox. There have been reports that it may not work with Violentmonkey or Greasemonkey. I don't have the time or experience to try and resolve this. If you find a fix for this, I'll try to update it, but no guarantees.

## Features
- Adds a button to export deck to CSV  
- Exported files are importable with the Import from Shirabe Jisho option, which this script renames to Import from CSV  
- The script also adds some info to the Import from CSV page

## Installation
> To install this script, make sure you have Tampermonkey (may or may not work with other script managers) and then click [here](https://github.com/JaiWWW/JPDB-Export/raw/main/JPDB-Export.user.js), or click <ins>JPDB-Export.user.js</ins> above and then click the **Raw** button.

## Limitations
- The exporter specifies the main reading and the furigana reading of each card. If your card does not have kanji, there may be other JPDB entries which will produce the same information, and the importer will choose the same entry regardless. This can result in either the wrong entry being added, or the same entry being added twice.
- The script cycles through each URL rather than accessing the deck contents from the server, so for large decks this can take some time. To give a rough estimate, my setup takes around 1 second per page (50 items), but this could vary based on computer specs and internet connection.
- JPDB-Export relies on another script I found to download the file, and this script is not supported on all browsers. However, JPDB-Export runs a test before trying to export and informs the user if their browser is not supported and why.

## Known bugs that I can't be bothered to investigate
- It's possible that exporting a deck very soon after adding cards to it from text results in the new cards not being exported. This is not confirmed and I can't think of any reason this would happen, so it may have been an error in testing rather than the script itself.

## Known bugs that I'm working on
- If you lose connection while exporting, the script will think you are still exporting and won't let you start a new export. See [this issue](https://github.com/JaiWWW/JPDB-Export/issues/9#issuecomment-1565350244) for a temporary workaround.

## Future ideas
- After importing a deck from CSV, perform a check for duplicate cards caused by the first limitation described above
> This won't catch all the misimports, only the ones that produce duplicate cards. It also won't fix them for you, it will just alert you
- When exporting a card without kanji, search the database for the kanji version and export that instead
> This should catch all the misimports, but I have no idea how to do it  
> Maybe also make this a toggleable option in case you really don't want to export super rare kanji spellings  
> Possibly also figure out which entries the importer favours for kana cards and only force kanji for others with the same reading
- Access the deck contents globally so the script doesn't have to cycle through every page
> This will massively boost the speed of the script, but again I have no idea how to do that
- Find the page count before showing the warning and don't show if it's low
> Maybe even give an estimate of how long it will take on certain setups, but this will require a lot of testing help
- Add a full changelog to github
