# JPDB-Export

### Latest version: 1.1
- Adds a button to export deck to CSV  
- Exported files are importable with the Import from Shirabe Jisho option, which this script renames to Import from CSV  
- The script also adds some info to the Import from CSV page

## Limitations
- The exporter specifies the main reading and the furigana reading of each card. If your card does not have kanji, there may be other JPDB entries which will produce the same information, and the importer will choose the same entry regardless. This can result in either the wrong entry being added, or the same entry being added twice.
- The script cycles through each URL rather than accessing the deck contents from the server, so for large decks this can take some time. To give a rough estimate, my setup takes around 1 second per page (50 items), but this could vary based on computer specs and internet connection.

## Known bugs that I can't be bothered to investigate
- It's possible that exporting a deck very soon after adding cards to it from text results in the new cards not being exported. This is not confirmed and I can't think of any reason this would happen, so it may have been an error in testing rather than the script itself.

## Installation
> To install this script, make sure you have a script manager and then click [here](https://github.com/JaiWWW/JPDB-Export/raw/main/JPDB-Export.user.js), or click <ins>JPDB-Export.user.js</ins> above and then click the **Raw** button.
