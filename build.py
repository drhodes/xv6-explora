from jinja2 import Environment, FileSystemLoader #, select_autoescape
from subprocess import Popen, PIPE

env = Environment(
    loader=FileSystemLoader('templates'),
    # autoescape=select_autoescape(['html', 'xml'])
)

lineTable = {
    "fork": 2580,
    "forkret": 2853,
    "struct proc": 2337,
    "entry": 1044,
    "main": 1217,
    "kvmalloc": 1840,
    "setupkvm": 1818,
    "mappages": 1760,
    "walkpgdir": 1735,
    "kinit1": 3131,
    "kinit2": 3139,
    "freerange": 3151,
    "kfree": 3164,
    "kalloc": 3187,
    "sbrk": 3801,
    "exec": 6610,
}

structTable = {
    "run": 3115,
    "spin lock": (3119, 3123)
}

figrefTable = {
    "newkernelstack": "1-4",
    "x86_pagetable": "2-1",
    "xv6_layout": "2-2",
    "processlayout": "2-3",
}

sheetTable = {
    "mmu.h": 700,
    "memlayout.h": 200,
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

@register
def goto_line(ident):
    #{{"fork" | goto_line}}
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (lineTable[ident], ident)

@register
def goto_lines(ident, start, end):
    #{{"fork" | goto_line }}
    temp = '<code><a href="javascript:gotoLines(%d, %d);">%s</a></code>'
    return temp % (start, end, ident)

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
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (addrTable[addrName], addrName)

@register
def macro(name):
    # {{"MACNAME" | addr}}
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (macTable[name], name)


@register
def sheet(name):
    temp = '<code><a href="javascript:gotoLine(%d);">%s</a></code>'
    return temp % (sheetTable[name], name)

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
    return '<a href="javascript:gotoLine(%d);">(%d)</a>' % (lineNum, lineNum)

@register
def struct(structName):
    line = structTable[structName]
    if type(line) == tuple:
        return '<code><a href="javascript:gotoLines(%d, %d);">%s</a></code>' % (line + (structName,))
    else:
        return '<code><a href="javascript:gotoLine(%d);">%s</a></code>' % (line, structName)

@register
def appendix(name):
    return '<a href="this will be a link">Appendix %s</a>' % name

@register
def chapref(chapname):
    return {
        "LOCK": "4"
    }[chapname]


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

def main():
    template = env.get_template("index.html")
    print (template.render())    

main()    
