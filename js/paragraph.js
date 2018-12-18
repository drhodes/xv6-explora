class NodeWrapper {
    constructor(node, pos) {
        this.node = node;
        this.extractTextNode(node);
        
        this.pos = pos;
        this.span = [pos, pos + node.textContent.length];
        console.log(this.span);
    }

    extractTextNode(node) {
        console.log(node);
        if (node.nodeName == "#text") {
            this.node = node;
            return;
        } else {
            node.childNodes.forEach(n => {
                this.extractTextNode(n);
            });
        }
    }
    
    // add a predicate to know if a paragraph-relative-pos is in this
    // node.
    containsPos(pos) {
        return pos >= this.span[0] && pos < this.span[1];
    }

    // given a paragraph relative offset, what is the offset in this node?
    getOffset(pos) {
        return pos - this.span[0];
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
        
        this.setupNodeSpans();
        this.ranges = [];
    }
    
    setupNodeSpans() {
        var pos = 0;
        this.el.childNodes.forEach(node => {            
            let wnode = new NodeWrapper(node, pos);
            this.wrappedNodes.push(wnode);
            pos += node.textContent.length;
        });
    }
    
    highlight() {
        // get this!  <p>.childNodes can have more than one DOM
        // element.  There might be [text, a, text] each of which
        // contributes to the rendered text in a paragraph seen by the
        // user. 
        let wrappedNode0 = this.nodeContainingPos(this.span[0]);
        let offset0 = wrappedNode0.getOffset(this.span[0]);
        
        let wrappedNode1 = this.nodeContainingPos(this.span[1] - 1);
        let offset1 = wrappedNode1.getOffset(this.span[1]);
        
        let range = document.createRange();
        let selection = window.getSelection();
        
        selection.removeAllRanges();
        range.setStart(wrappedNode0.node, offset0);
        range.setEnd(wrappedNode1.node, offset1);
        selection.addRange(range);        
    }
    
    nodeContainingPos(pos) {
        let matches = this.wrappedNodes.filter(node => node.containsPos(pos));
        switch(matches.length) {
        case 0: throw Error("no matching nodes found with position: " + pos);
        case 1: return matches[0];
        default: throw Error("more than one matching node found?? with pos: " + pos);
        }
    }
    
    selectAndSpeak(speed) {
        let synth = window.speechSynthesis;
        synth.cancel();
        this.highlight();
        
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
        this.sentences[this.curSentence].selectAndSpeak(this.speed);
    }
    
    prevSentence() {
        if (this.atTop()) return;
        console.log(this.sentences[this.curSentence]);
        this.sentences[this.curSentence].selectAndSpeak(this.speed);
        this.curSentence -= 1;
    }
    
    scrollTo() {
        $('html, body').animate({
            scrollTop: this.el.offsetTop - 300
        }, 50);        
    }
    
    highlight(bool) {
        if (bool) {
            this.el.style.background = "#EEEEFF";
        } else {
            this.el.style.background = "#FFFFFF";
        }
        this.scrollTo();
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
        this.lastMotion = undefined; // 
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
        } else {
            // step through the current paragraph sentence by sentence.
            this.curParagraph.prevSentence();
        }
    }

    decreaseSpeed() {
        if (this.speed > 1) this.speed -= .2;
        this.curParagraph.updateSpeed(this.speed);
        this.curParagraph.repeat();
    }

    stop() {
        let synth = window.speechSynthesis;
        synth.cancel();
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
        if (event.keyCode == 187) {            
            __paragraphSelector.increaseSpeed();
        }
        if (event.keyCode == 189) {            
            __paragraphSelector.decreaseSpeed();
        }
        if (event.keyCode == 83) {            
            __paragraphSelector.stop();
        }
        
        // alert(event.keyCode);
    });
}

var dbg = undefined;

function foo() {
    let temp = $("p")[9];
    console.log(temp);
    let node0 = temp.childNodes[0];
    let node1 = temp.childNodes[1].childNodes[0];
    console.log(["node1 text: ", node1.textContent]);
    // console.log(node0);
    console.log(node1);
    dbg = temp.childNodes[1];
    let range0 = document.createRange();
    let selection = window.getSelection();
    
    selection.removeAllRanges();
    
    range0.setStart(node0, 0);
    range0.setEnd(node1, node1.textContent.length);
    selection.addRange(range0);
}
