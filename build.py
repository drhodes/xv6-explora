from jinja2 import Environment, FileSystemLoader #, select_autoescape
from subprocess import Popen, PIPE
from line_table import lineTable, sheetTable
import x86reg

env = Environment(
    loader=FileSystemLoader('templates'),
    # autoescape=select_autoescape(['html', 'xml'])
)

structTable = {
    "run": 3115,
    "spin lock": (3119, 3123),
    "elfhdr": 905,
    "proghdr": 924,
    "trapframe": 602,
}

figrefTable = {
    "newkernelstack": "1-4",
    "x86_pagetable": "2-1",
    "xv6_layout": "2-2",
    "processlayout": "2-3",
}

addrTable = {
    "KERNBASE": 207,
    "PHYSTOP": 203,
    "0xFE000000": 204,
}

macTable = {
    "PGROUNDUP": 798,
}

def register(f):
    ''' register each filter function with template environment.
    '''
    env.filters[f.__name__] = f
    return f

GOTO_LINES_TEMPLATE = '<code><a onclick="event.stopPropagation()" href="javascript:gotoLines(%d, %d);">%s</a></code>'
GOTO_LINE_TEMPLATE = '<code><a onclick="event.stopPropagation()" href="javascript:gotoLine(%d);">%s</a></code>'

@register
def goto_line(ident):
    #{{"fork" | goto_line}}
    return GOTO_LINE_TEMPLATE % (lineTable[ident], ident)

@register
def goto_lines(ident, start, end):
    #{{"fork" | goto_line }}
    return GOTO_LINES_TEMPLATE % (start, end, ident)

@register
def section(title):
    #{{"exercies" | section}}
    return '<h3>§ %s</h3>' % title

@register
def chapter(title):
    #{{"exercies" | chapter }}
    return '<h1>%s</h1>' % title

@register
def addr(addrName):
    # {{"KERNBASE" | addr}}
    return GOTO_LINE_TEMPLATE % (addrTable[addrName], addrName)

@register
def macro(name):
    # {{"MACNAME" | addr}}
    return GOTO_LINE_TEMPLATE % (macTable[name], name)

@register
def sheet(name):
    return GOTO_LINE_TEMPLATE % (sheetTable[name], name)

@register
def figref(name):
    temp='''
    <a class="popoverOption" href="#fig%s" data-content="<img src='figs/fig%s.jpg' alt='figure %s'>"
    rel="popover" data-placement="bottom" data-original-title="Figure %s">Figure %s</a>.
    '''
    fignum = figrefTable[name]
    return temp % (fignum, fignum, fignum, fignum, fignum)

@register
def code(listing):
    # {{ ''' foo() \n bar() ''' | code }}
    # format this with external
    proc = Popen(["clang-format"], stdout=PIPE, stdin=PIPE)
    result = proc.communicate(input=bytearray(listing, 'utf-8'))

    if proc.returncode != 0:
        raise Exception("build.py fails to call clang-format for listing: " + listing)

    from pygments import highlight
    from pygments.lexers import CLexer
    from pygments.formatters import HtmlFormatter

    fmtd = highlight(result[0].decode(), CLexer(), HtmlFormatter())
    return "%s\n" % fmtd

@register
def line(lineNum):
    smallLineNum = "<small>(%d)</small>" % lineNum
    return GOTO_LINE_TEMPLATE % (lineNum, smallLineNum)

@register
def struct(structName):
    line = structTable[structName]
    if type(line) == tuple:
        return GOTO_LINES_TEMPLATE % (line + (structName,))
    else:
        return GOTO_LINE_TEMPLATE % (line, structName)

@register
def appendix(name):
    return '<a onclick="event.stopPropagation()" href="this will be a link">Appendix %s</a>' % name

@register
def chapref(chapname):
    return {
        "UNIX": "0",
        "MEM": "2",
        "TRAP": "3",
        "LOCK": "4",
    }[chapname]

@register
def bash(txt):
    from pygments import highlight
    from pygments.lexers import BashLexer
    from pygments.formatters import HtmlFormatter

    fmtd = highlight("$ " + txt, BashLexer(), HtmlFormatter())
    return "%s\n" % fmtd

@register
def figure(caption, num):
    temp = '''
    <br/>
    <img src="figs/fig%s.jpg" alt="figure %s" class="img-thumbnail">
    <br>
    <br>
    <center>
      <b>Figure %s.</b>
      <small class="text-muted">%s</small>
    </center>
    <br><br>
    '''
    return temp % (num, num, num, caption)

@register
def reg(r):
    # do fancy register info.
    desc = x86reg.regTable.get(r, "UNKNOWN REGISTER")
    return x86reg.REG_TEMPLATE % (desc, "%" + r)

def main():
    template = env.get_template("index.html")
    print (template.render())    

main()    
