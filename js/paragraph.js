class Sentence {
    
}


class Paragraph {
    constructor(el, speed) {
        this.speed = speed;
        this.el = el;
        this.sentenceRanges = [];
        this.buildRanges();
        this.curRange = 0;        
        this.synth = window.speechSynthesis;
        // do
        this.highlight(true);
        this.scrollTo();
    }

    buildRanges() {
        let txt = this.el.innerText;
        let elText = this.el.childNodes[0];
        var curRange = document.createRange();
        curRange.setStart(elText, 0);
        
        for (var i = 0; i < txt.length; i++) {
            if (txt[i] == '.' || i >= txt.length) {
                // end of sentence.
                curRange.setEnd(elText, i);
                this.sentenceRanges.push(curRange);                
                // start of next sentence.
                curRange = document.createRange();
                curRange.setStart(elText, i+1);
            } else {
                // in sentence. do nothing.                
            }
        }
        this.sentenceRanges.push(curRange);
    }

    selectAndSpeak() {
        this.synth.cancel();
        var selection = window.getSelection();
        selection.removeAllRanges();
        
        let range = this.sentenceRanges[this.curRange];
        selection.addRange(range);

        let txt = this.el.innerText.slice(range.startOffset, range.endOffset);
        var utterThis = new SpeechSynthesisUtterance(txt);
        utterThis.voice = this.synth.getVoices()[2];
        utterThis.pitch = 1;
        console.log("utter speed", this.speed);
        utterThis.rate = this.speed;
        this.synth.speak(utterThis);
    }


    atTop() { return this.curRange == 0; }
    atBottom() { return this.curRange >= this.sentenceRanges.length - 1; }
    gotoBottom() { this.curRange = this.sentenceRanges.length - 1; }
    
    nextSentence() {
        if (this.atBottom()) return;
        this.selectAndSpeak();
        this.curRange += 1;
        this.scrollTo();
    }

    repeat() {
        this.synth.cancel();
        this.selectAndSpeak();
    }
    
    prevSentence() {
        if (this.atTop()) return;
        this.curRange -= 1;        
        this.selectAndSpeak(this.curRange);
        this.scrollTo();
    }
    
    scrollTo() {
        $('html, body').animate({
            scrollTop: this.el.offsetTop - 200
        }, 0);        
    }
    
    highlight(bool) {
        if (bool) {
            this.el.style.background = "#EEEEFF";
        } else {
            this.el.style.background = "#FFFFFF";
        }
    }
    
    updateSpeed(speed) { this.speed = speed; }
}

class ParagraphSelector {
    constructor() {
        this.speed = 1;
        this.pels = $("p");
        this.pidx = 0;
        this.curParagraph = new Paragraph(this.pels[0], this.speed);
        this.synth = window.speechSynthesis;
        // setup click events.
        this.pels.click(e => this.selectClick(e.target));
    }
    
    curPel() { return this.pels[this.pidx]; }
    
    prevP() {
        return this.pels[this.pidx > 0 ? this.pidx - 1 : this.pidx];
    }
    
    atTop() { return this.pidx == 0; }
    atBottom() { return this.pidx >= this.pels.length - 1; }

    selectClick(pel) {
        // need to find pidx of thie pel.
        for (var i=0; i<this.pels.length; i++) {
            if (this.pels[i].isEqualNode(pel)) {
                this.pidx = i;                
            }
        }
        console.log(this.pidx);
        this.curParagraph.highlight(false);
        this.curParagraph = new Paragraph(pel, this.speed);

    }
    
    selectNext() {
        if (this.curParagraph.atBottom()) {
            // at the bottom of the current paragraph, onto the next!
            this.curParagraph.highlight(false);
            this.pidx += 1;
            this.curParagraph = new Paragraph(this.curPel(), this.speed);
        } 
        // step through the current paragraph sentence by sentence.
        this.curParagraph.nextSentence();
    }
    
    selectPrev() {
        if (this.curParagraph.atTop()) {
            this.curParagraph.highlight(false);
            this.pidx -= 1;
            this.curParagraph = new Paragraph(this.curPel(), this.speed);
            this.curParagraph.gotoBottom();
        }
        // step through the current paragraph sentence by sentence.
        this.curParagraph.prevSentence();
    }

    decreaseSpeed() {
        if (this.speed > 1) this.speed -= .2;
        this.curParagraph.updateSpeed(this.speed);
        this.curParagraph.repeat();
    }

    increaseSpeed() {
        if (this.speed <= 1.8) this.speed += .2;
        this.curParagraph.updateSpeed(this.speed);
        this.curParagraph.repeat();
    }

}


{
    var __paragraphSelector = new ParagraphSelector();
    $(document).keydown(function(event){
        if (event.keyCode == 74) {
            __paragraphSelector.selectNext();
        }
        if (event.keyCode == 75) {
            __paragraphSelector.selectPrev();
        }
        if (event.keyCode == 83) {            
            __paragraphSelector.toSpeech();
        }
        if (event.keyCode == 187) {            
            __paragraphSelector.increaseSpeed();
        }
        if (event.keyCode == 189) {            
            __paragraphSelector.decreaseSpeed();
        }
        
        // alert(event.keyCode);
        
    });
}
