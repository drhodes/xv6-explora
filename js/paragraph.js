class NodeWrapper {
    constructor(node, pos) {
        this.node = node;
        this.pos = pos;
        this.span = [pos, pos + node.textContent.length];
    }

    // add a predicate to know if a paragraph-relative-pos is
    // in this node.
    containsPos = function(p) {
        return p >= this.span[0] && p < this.span[1];
    };

    highlightToEndFrom = function(p) {
        if (node.containsSpan(p)) {
            
        }
    }
}

class Sentence {
    // find a speakable sentence in the middle of a <p> nodes.
    // there might be 5 sentences broken up over 3 nodes.
    
    constructor(el, pos, txt) {
        this.el = el;
        this.span = [pos, pos + txt.length];
        this.wrappedNodes = [];
        this.txt = txt;
        
        this.tagNodeSpans();
        this.ranges = [];
        //this.setupHighlightRanges();
    }
    
    tagNodeSpans() {
        var pos = 0;
        this.el.childNodes.forEach(node => {
            this.wrappedNodes.push(new NodeWrapper(node, pos));
            pos += node.textContent.length;
        });
        
        
    }
    
    setupHighlightRanges() {
        // get this!  <p>.childNodes can have more than one DOM
        // element.  There might be [text, a, text] each of which
        // contributes to the rendered text in a paragraph seen by the
        // user. 

        // consider some text found in a rendered <p>
        
        // A fox jumped over the lazy brown dog.

        // but the word "fox" might be an HTML link, so this sentence
        // doesn't occupy one childNode of <p>, it would be part of
        // three! more insideously, the sentence will occupy only
        // portions of each node.

        // so the job is to find which portions of the rendered text
        // are in which portions of the childNodes of <p>

        // <1          ><2><3                                                >
        // |bla bla.  A fox jumped over the lazy brown dog.  The dog bla bla
        //            A 
        //              fox
        //                  jumped over the lazy brown dog.

        // luckily, childNodes have the 'textContent' field.
        // from span1, only the text "A " is used.
        // from span2, only the text "fox" is used.
        // from span3, only the text " jumped over the lazy brown dog" is used.

        // there are three different ranges here that need to be
        // considered. Each of those ranges is contained within a span
        // the covers each <p>.childNode

        // so the easy way to do this.
        // assign a span to each childNode within the <p>
        
        // CASES
        // 1) this.txt spans one childNode.       
        // 2) this.txt spans two childNodes.
        // 3) this.txt spans three or more childNodes.

        let idxM = this.childIdxContainingPos(this.span[0]);
        let idxN = this.childIdxContainingPos(this.span[1]);
                                             
        // if N = M then case 1.
        if (idxN == idxM) {
            this.highlightCase1(idxM, idxN);
            return;
        }
        // if N == M + 1 then case 2.
        if (idxN == idxM + 1) {
            this.highlightCase2(idxM, idxN);
            return;
        }
        // if N > M + 1 then case 3.
        if (idxN > idxM + 1) {
            this.highlightCase3(idxM, idxN);
            return;
        }
    }
    
    highlightCase1(idxM, idxN) {
        this.ranges.push(document.createRange());
        let elText = this.el.childNodes[0];
        this.ranges[0].setStart(elText, this.span[0]);
        this.ranges[0].setEnd(elText, this.span[1]);
    }

    highlightCase2(idxM, idxN) {
        throw Error("CASE 2 unimplemented");
        // we'll need two ranges.
        // this.ranges.push(document.createRange());
        // this.ranges.push(document.createRange());

        // // where does this.txt start in idxM ?
        // let startInM = this.span[0] - this.getStartPosOfChild(idxM);
        // let nodeM = this.el.childNodes[idxM];
        // this.ranges[0].setStart(
        
        // // where does this.txt stop in idxN ?
        // let startInN = this.span[1] - this.getStartPosOfChild(idxN);
        
    }

    highlightCase3(idxM, idxN) {
        // find the index of the left childNode, the one that contains this.span[0];
        let nodeIdxL = this.childIdxContainingPos(this.span[0]);
        
        // find the index of the right childNode, the one that contains this.span[1];
        let nodeIdxR = this.childIdxContainingPos(this.span[1]);

        let r = document.createRange();
        let leftSpan = this.absSpanOfNode(nodeIdxL);
        let node = this.el.childNodes[idxM];        
        r.setStart(node, this.span[0] - leftSpan[0]);
        r.setEnd(node, node.textContent.length);
        this.ranges.push(r);
    }

    absSpanOfNode(idx) {
        var from = 0;
        for (var i=0; i < this.el.childNodes.length; i++) {
            var to = from + this.el.childNodes[i].textContent.length;
            if (i == idx) return [from, to];
            from = to;
        }
        console.log(this.el);
        throw Error("Could not find position: " + p + " in <p>" + this.txt);
    }
    
    getStartPosOfNode(idx) {
        var curP = 0;
        for (var i=0; i < this.el.childNodes[i].length; i++) {
            if (i == idx) return curP;
            curP += this.el.childNodes[i].length;
        }
        console.log(this.el);
        throw Error("Could not find position: " + idx + " in <p>" + this.txt);
    }

    getEndPosOfNode(idx) {
        this.getStartPosOfNode(idx) + this.el.childNodes[idx].textContent.length;
    }

    
    childIdxContainingPos(p) {
        var from = 0;
        for (var i=0; i < this.el.childNodes.length; i++) {
            var to = from + this.el.childNodes[i].textContent.length;
            console.log([from, to]);
            // CAUTION the follow (<=) comparison is sketchy.
            if (p >= from && p <= to) return i;
            from = to;
        }
        console.log(this.el);
        throw Error("Could not find position: " + p + " in <p>" + this.txt);
    }
    
    selectAndSpeak(speed) {
        let synth = window.speechSynthesis;
        synth.cancel();
        var selection = window.getSelection();
        selection.removeAllRanges();
        this.ranges.forEach(r => selection.addRange(r));
        
        var utterThis = new SpeechSynthesisUtterance(this.txt);
        utterThis.voice = synth.getVoices()[2];
        utterThis.pitch = 1;
        console.log("utter speed", speed);
        utterThis.rate = speed;
        synth.speak(utterThis);
    }
}

class Paragraph {
    constructor(el, speed) {
        this.speed = speed;
        this.el = el;
        this.sentences = [];
        this.curSentence = 0;        
        this.buildSentences();
        this.synth = window.speechSynthesis;
        
        // do
        this.highlight(true);
        this.scrollTo();
    }

    buildSentences() {
        const sep = ". ";
        var parts = this.el.textContent.split(sep);
        var pos = 0;
        
        parts.forEach(part => {
            if (part.length > 0) {
                this.sentences.push(new Sentence(this.el, pos, part));
                pos += part.length + sep.length;
            }
        });
    }

    atTop() { return this.curSentence == 0; }
    atBottom() { return this.curSentence >= this.sentences.length; }
    gotoBottom() { this.curSentence = this.sentences.length - 1; }
    
    nextSentence() {
        if (this.atBottom()) return;

        console.log(this.sentences[this.curSentence]);
        this.sentences[this.curSentence].selectAndSpeak(this.speed);
        this.curSentence += 1;
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
