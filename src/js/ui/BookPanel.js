const Phaser = require('phaser');

const FONT_SIZE = 12;
const PAGE_LINES = 11;
const PAGE_WIDTH = 89;
const RIGHT_PAGE_LOCATION = 110;
const PAGE_MARGIN_X = 10;
const PAGE_MARGIN_Y = 8;
const BOOK_LOCATION_X = 90;
const BOOK_LOCATION_Y = 77;

const BookPanel = {
    init(game, layer) {
        this.game = game;
        this.layer = this.game.add.group(layer);
        this.layer.x = BOOK_LOCATION_X;
        this.layer.y = BOOK_LOCATION_Y;
        this.background = game.add.image(0, 0, "bookBack");
        this.measureTool = game.add.bitmapText(0, 0, 'dark', '', FONT_SIZE);
        this.leftSide = game.add.bitmapText(PAGE_MARGIN_X, PAGE_MARGIN_Y, 'dark', '', FONT_SIZE);
        this.rightSide = game.add.bitmapText(RIGHT_PAGE_LOCATION + PAGE_MARGIN_X, PAGE_MARGIN_Y, 'dark', '', FONT_SIZE);
        
        this.background.inputEnabled = true;
        this.background.events.onInputDown.add((element, pointer) => { 
            const relx = pointer.x - this.layer.x;
            if (relx > RIGHT_PAGE_LOCATION) {
                this.nextPages();
            } else {
                this.previousPages();
            }
        });
        this.leftSide.maxWidth = PAGE_WIDTH;
        this.rightSide.maxWidth = PAGE_WIDTH;
        this.layer.add(this.background);
        this.layer.add(this.leftSide);
        this.layer.add(this.rightSide);
        this.layer.visible = false;
    },

    show (book) {
        this.book = book;
        this.layer.visible = true;
        this.pages = this.__splitInPages(book.def.contents);
        this.currentPage = 0;
        this.__updateShownPage();
        this.layer.parent.bringToTop(this.layer);
    },

    hide() {
        this.book = null;
        this.layer.visible = false;
    },

    nextPages () {
        if (this.currentPage + 2 < this.pages.length) {
            this.currentPage += 2;
        }
        this.__updateShownPage();
    },

    previousPages () {
        if (this.currentPage - 2 >= 0) {
            this.currentPage -= 2;
        }
        this.__updateShownPage();
    },

    __updateShownPage () {
        this.leftSide.text = this.pages[this.currentPage];
        if (this.pages.length > this.currentPage + 1) {
            this.rightSide.text = this.pages[this.currentPage + 1];
        } else {
            this.rightSide.text = '';
        }
    },

    __splitInPages (content) {
        const pages = [];
        const lines = this.__splitInLines(content);
        let currentPage = 0;
        let currentLine = 0;
        for (let i = 0; i < lines.length; i++) {
            if (!pages[currentPage])
                pages[currentPage] = '';
            if (lines[i] == '' && currentLine == 0) {
                continue;
            }
            pages[currentPage] += lines[i] + '\n';
            currentLine++;
            if (currentLine == PAGE_LINES) {
                currentLine = 0;
                currentPage++;
            }
        }
        return pages;
    },

    __splitInLines: function(text) {
        var lines = [],
            line = "",
            measureTool = this.measureTool,
            words = text.split(/\s/g);
        measureTool.text = "";
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            let forcedNewline = false;
            if (word == '{br}') {
                forcedNewline = true;
            } else {
                if (line.length !== 0) {
                    measureTool.text += " ";
                }
                measureTool.text += word;
            }
            
            if (forcedNewline || measureTool.textWidth > PAGE_WIDTH) {
                lines.push(line);
                line = "";
                measureTool.text = "";
                if (forcedNewline) {
                    lines.push(''); // Another blank line!
                } else {
                    i--;
                }
                continue;
            }

            line = measureTool.text;
        }

        if (line !== "") {
            lines.push(line);
        }

        measureTool.text = "";

        return lines;
    },
};

module.exports = BookPanel;